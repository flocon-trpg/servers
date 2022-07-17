import { State, filePathTemplate } from '@flocon-trpg/core';
import React from 'react';
import { useDeepCompareEffect } from 'react-use';
import { FirebaseStorageUrlCacheContext } from '../contexts/FirebaseStorageUrlCacheContext';
import { FilePathFragment } from '@flocon-trpg/typed-document-node-v0.7.1';
import { FilePath as FilePathModule } from '../utils/file/filePath';
import { useWebConfig } from './useWebConfig';
import { useAtomValue } from 'jotai/utils';
import { firebaseStorageAtom } from '../pages/_app';
import { useGetIdToken } from './useGetIdToken';

type FilePath = State<typeof filePathTemplate>;

export const done = 'done';
export const success = 'success';
export const loading = 'loading';
export const nullishArg = 'nullishArg';
export const invalidWebConfig = 'invalidWebConfig';
export const error = 'error';

type SrcArrayResult =
    | {
          // 一部が成功して残りが失敗というケースがあるため、successではなくdoneという名前にしている。
          type: typeof done;
          value: (string | null)[];
      }
    | {
          type: typeof error;
          error: unknown;
      }
    | {
          type: typeof loading | typeof nullishArg | typeof invalidWebConfig;
      };

// PathArrayがnullish ⇔ 戻り値がnullishArg
// pathArray.length = 戻り値.length
export function useSrcArrayFromGraphQL(
    pathArray: ReadonlyArray<FilePathFragment | FilePath> | null | undefined,
    additionalDeps?: React.DependencyList
): SrcArrayResult {
    const config = useWebConfig();
    const storage = useAtomValue(firebaseStorageAtom);
    const [result, setResult] = React.useState<SrcArrayResult>({ type: loading });
    const firebaseStorageUrlCacheContext = React.useContext(FirebaseStorageUrlCacheContext);
    const { getIdToken } = useGetIdToken();

    // deep equalityでチェックされるため、余計なプロパティを取り除いている
    const cleanPathArray = pathArray?.map(path => ({
        path: path.path,
        sourceType: path.sourceType,
    }));

    useDeepCompareEffect(() => {
        if (cleanPathArray == null) {
            setResult({ type: nullishArg });
            return;
        }
        if (getIdToken == null || config == null || storage == null) {
            setResult({ type: loading });
            return;
        }
        if (config.isError) {
            setResult({ type: invalidWebConfig });
            return;
        }
        let isDisposed = false;
        const main = async () => {
            const idToken = await getIdToken();
            if (idToken == null) {
                return null;
            }
            Promise.all(
                cleanPathArray.map(async path => {
                    // firebaseStorageUrlCacheContextはDeepCompareしてほしくないしされる必要もないインスタンスであるため、depsに加えてはいけない。
                    return FilePathModule.getSrc(
                        path,
                        config.value,
                        storage,
                        idToken,
                        firebaseStorageUrlCacheContext
                    );
                })
            )
                .then(all => {
                    if (isDisposed) {
                        return;
                    }
                    setResult({
                        type: done,
                        value: all.flatMap(x => (x == null ? [] : [x.src ?? null])),
                    });
                })
                .catch(e => {
                    console.log('error', e);

                    setResult({ type: error, error: e });
                });
        };

        main();

        return () => {
            isDisposed = true;
        };
    }, [cleanPathArray, config, storage, getIdToken, ...(additionalDeps ?? [])]);

    return result;
}

type SrcResult =
    | {
          type: typeof success;
          value: string;
      }
    | {
          type: typeof loading | typeof error | typeof nullishArg | typeof invalidWebConfig;
      };

const toSrcResult = (srcArray: ReturnType<typeof useSrcArrayFromGraphQL>): SrcResult => {
    if (srcArray.type !== done) {
        return srcArray;
    }
    const result = srcArray.value[0];
    if (result == null) {
        return { type: error };
    }
    return { type: success, value: result };
};

export function useSrcFromGraphQL(
    path: FilePathFragment | FilePath | null | undefined,
    additionalDeps?: React.DependencyList
): SrcResult {
    const pathArray = React.useMemo(() => (path == null ? null : [path]), [path]);
    const resultArray = useSrcArrayFromGraphQL(pathArray, additionalDeps);
    const [result, setResult] = React.useState<SrcResult>(toSrcResult(resultArray));
    React.useEffect(() => {
        setResult(toSrcResult(resultArray));
    }, [resultArray]);
    return result;
}
