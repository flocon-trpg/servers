import React from 'react';
import { FilePathLikeOrThumb, FilePathModule } from '../utils/file/filePath';
import { useWebConfig } from './useWebConfig';
import { useAtomValue } from 'jotai/utils';
import { firebaseStorageAtom } from '../pages/_app';
import { useGetIdToken } from './useGetIdToken';
import { UseQueryResult, useQueries } from 'react-query';
import { useMemoOne } from 'use-memo-one';
import { idTokenIsNull, thumbs } from '@/utils/file/getFloconUploaderFile';

export const loaded = 'loaded';
export const loading = 'loading';
export const nullishArg = 'nullishArg';
export const invalidWebConfig = 'invalidWebConfig';

type SrcArrayResult =
    | {
          type: typeof loaded;
          queriesResult: readonly UseQueryResult<FilePathModule.SrcResult, unknown>[];

          /** queriesResultの要素がすべてSuccessのとき、各要素のsrcを抽出した結果を表します。 */
          // もしすべてSuccessになる前にnon-undefinedな値を返してしまうと、すべてSuccessになるまでにsrcDataの値が頻繁に変わる。これは音声ファイルを再生する場面で問題になってしまうので避けている。
          srcData: (string | undefined)[] | undefined;
      }
    | {
          type: typeof loading | typeof nullishArg | typeof invalidWebConfig;
      };

// PathArrayがnullish ⇔ 戻り値がnullishArg
// pathArray.length = queriesResult.length = srcDataArray.length
export function useSrcArrayFromFilePath(
    pathArray: ReadonlyArray<FilePathLikeOrThumb> | null | undefined
): SrcArrayResult {
    const config = useWebConfig();
    const storage = useAtomValue(firebaseStorageAtom);
    const { getIdToken } = useGetIdToken();

    const cleanPathArray =
        pathArray == null || config?.value == null || storage == null
            ? []
            : pathArray.map(path => {
                  const $path = FilePathModule.ensureType(path);

                  // deep equalityでチェックされるため、pathからは必要なプロパティのみ抽出している。
                  const queryKey = [
                      'firebase storage url',
                      $path.type === thumbs
                          ? {
                                thumbFilename: $path.thumbFilename,
                            }
                          : {
                                path: $path.value.path,
                                sourceType: $path.value.sourceType,
                            },
                  ];
                  const queryFn = async () => {
                      const result = await FilePathModule.getSrc({
                          path,
                          config: config.value,
                          storage,
                          getIdToken,
                      });
                      if (result === idTokenIsNull) {
                          return Promise.reject(
                              new Error(
                                  'Firebase Authentication の IdToken を取得できませんでした。'
                              )
                          );
                      }
                      return result;
                  };
                  // FirebaseのURLは自動的にexpireされるのでcacheTimeを指定している。
                  // TODO: 1時間にしているがこの値は適当。
                  const cacheTime = 1000 * 60 * 60 * 1;
                  return { queryKey, queryFn, cacheTime };
              });

    const queriesResult = useQueries(cleanPathArray);

    const srcDataSource = queriesResult.map(r => r.data?.src);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const srcData = useMemoOne(() => srcDataSource, srcDataSource);
    const allSrcDataSuccess = queriesResult.every(r => r.isSuccess);

    const isPathArrayNullish = pathArray == null;

    return useMemoOne(() => {
        if (isPathArrayNullish) {
            return { type: nullishArg };
        }
        if (config?.isError) {
            return { type: invalidWebConfig };
        }
        if (config == null || storage == null) {
            return { type: loading };
        }
        return { type: loaded, queriesResult, srcData: allSrcDataSuccess ? srcData : undefined };
    }, [config, isPathArrayNullish, queriesResult, srcData, allSrcDataSuccess, storage]);
}

type SrcResult =
    | {
          type: typeof loaded;
          value: UseQueryResult<FilePathModule.SrcResult, unknown>;
      }
    | {
          type: typeof loading | typeof nullishArg | typeof invalidWebConfig;
      };

const toSrcResult = (srcArray: ReturnType<typeof useSrcArrayFromFilePath>): SrcResult => {
    if (srcArray.type !== loaded) {
        return srcArray;
    }
    const result = srcArray.queriesResult[0];
    if (result == null) {
        throw new Error(
            'This should not happen. pathArray.length might be 0, which is not expected.'
        );
    }
    return { type: loaded, value: result };
};

export function useSrcFromFilePath(path: FilePathLikeOrThumb | null | undefined): {
    src: string | undefined;
    queryResult: SrcResult;
} {
    const pathArray = React.useMemo(() => (path == null ? null : [path]), [path]);
    const resultArray = useSrcArrayFromFilePath(pathArray);
    const queryResult = useMemoOne(() => {
        return toSrcResult(resultArray);
    }, [resultArray]);
    const src = queryResult.type === loaded ? queryResult.value.data?.src : undefined;

    return React.useMemo(
        () => ({
            src,
            queryResult,
        }),
        [queryResult, src]
    );
}
