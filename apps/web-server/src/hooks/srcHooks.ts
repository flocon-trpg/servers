import { UseQueryResult, useQueries } from '@tanstack/react-query';
import { useAtomValue } from 'jotai/react';
import React from 'react';
import { useMemoOne } from 'use-memo-one';
import { FilePathLikeOrThumb, FilePathModule } from '../utils/file/filePath';
import { firebaseStorageAtom, getIdTokenResultAtom } from './useSetupApp';
import { useWebConfig } from './useWebConfig';
import { idTokenIsNull, thumbs } from '@/utils/file/getFloconUploaderFile';

export const loaded = 'loaded';
export const loading = 'loading';
export const nullishArg = 'nullishArg';

type SrcArrayResult =
    | {
          type: typeof loaded;
          queriesResult: readonly UseQueryResult<FilePathModule.SrcResult, unknown>[];
      }
    | {
          type: typeof loading | typeof nullishArg;
      };

// PathArrayがnullish ⇔ 戻り値がnullishArg
// pathArray.length = queriesResult.length
export function useSrcArrayFromFilePath(
    pathArray: ReadonlyArray<FilePathLikeOrThumb> | null | undefined,
): SrcArrayResult {
    const config = useWebConfig();
    const storage = useAtomValue(firebaseStorageAtom);
    const { getIdToken } = useAtomValue(getIdTokenResultAtom);

    const cleanPathArray =
        pathArray == null || storage == null
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
                          config,
                          storage,
                          getIdToken,
                      });
                      if (result === idTokenIsNull) {
                          return Promise.reject(
                              new Error(
                                  'Firebase Authentication の IdToken を取得できませんでした。',
                              ),
                          );
                      }
                      return result;
                  };
                  // FirebaseのURLは自動的にexpireされるのでcacheTimeを指定している。
                  // TODO: 1時間にしているがこの値は適当。
                  const cacheTime = 1000 * 60 * 60 * 1;
                  return { queryKey, queryFn, cacheTime };
              });

    const queriesResult = useQueries({ queries: cleanPathArray });

    const isPathArrayNullish = pathArray == null;

    return useMemoOne(() => {
        if (isPathArrayNullish) {
            return { type: nullishArg };
        }
        if (storage == null) {
            return { type: loading };
        }
        return { type: loaded, queriesResult };
    }, [config, isPathArrayNullish, queriesResult, storage]);
}

type SrcResult =
    | {
          type: typeof loaded;
          value: UseQueryResult<FilePathModule.SrcResult, unknown>;
      }
    | {
          type: typeof loading | typeof nullishArg;
      };

const toSrcResult = (srcArray: ReturnType<typeof useSrcArrayFromFilePath>): SrcResult => {
    if (srcArray.type !== loaded) {
        return srcArray;
    }
    const result = srcArray.queriesResult[0];
    if (result == null) {
        throw new Error(
            'This should not happen. pathArray.length might be 0, which is not expected.',
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
        [queryResult, src],
    );
}
