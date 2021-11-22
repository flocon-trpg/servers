import { FilePath } from '@flocon-trpg/core';
import React from 'react';
import { useDeepCompareEffect } from 'react-use';
import { FirebaseAuthenticationIdTokenContext } from '../contexts/FirebaseAuthenticationIdTokenContext';
import { FirebaseStorageUrlCacheContext } from '../contexts/FirebaseStorageUrlCacheContext';
import { FilePathFragment } from '@flocon-trpg/typed-document-node';
import { FilePath as FilePathModule } from '../utils/filePath';
import { useWebConfig } from './useWebConfig';

export const done = 'done';
export const success = 'success';
export const loading = 'loading';
export const nullishArg = 'nullishArg';
export const error = 'error';

type SrcArrayResult =
    | {
          // useFirebaseStorageUrlArrayは一部が成功して残りが失敗というケースがあるため、successではなくdoneという名前にしている。
          type: typeof done;
          value: (string | null)[];
      }
    | {
          type: typeof error;
          error: any;
      }
    | {
          type: typeof loading | typeof nullishArg;
      };

// PathArrayがnullish ⇔ 戻り値がnullishArg
// pathArray.length = 戻り値.length
export function useSrcArrayFromGraphQL(
    pathArray: ReadonlyArray<FilePathFragment | FilePath> | null | undefined
): SrcArrayResult {
    const config = useWebConfig();
    const [result, setResult] = React.useState<SrcArrayResult>({ type: loading });
    const firebaseStorageUrlCacheContext = React.useContext(FirebaseStorageUrlCacheContext);
    const getIdToken = React.useContext(FirebaseAuthenticationIdTokenContext);

    // deep equalityでチェックされるため、余計なプロパティを取り除いている
    const cleanPathArray = pathArray?.map(path => ({
        path: path.path,
        sourceType: path.sourceType,
    }));

    useDeepCompareEffect(() => {
        if (getIdToken == null) {
            setResult({ type: loading });
            return;
        }
        if (cleanPathArray == null) {
            setResult({ type: nullishArg });
            return;
        }
        let isDisposed = false;
        Promise.all(
            cleanPathArray.map(async path => {
                const idToken = await getIdToken();
                if (idToken == null) {
                    return null;
                }

                // firebaseStorageUrlCacheContextはDeepCompareしてほしくないしされる必要もないインスタンスであるため、depsに加えてはいけない。
                return FilePathModule.getSrc(path, config, idToken, firebaseStorageUrlCacheContext);
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
        return () => {
            isDisposed = true;
        };
    }, [cleanPathArray, getIdToken]);

    return result;
}

type SrcResult =
    | {
          type: typeof success;
          value: string;
      }
    | {
          type: typeof loading | typeof error | typeof nullishArg;
      };

export function useSrcFromGraphQL(path: FilePathFragment | FilePath | null | undefined): SrcResult {
    const pathArray = React.useMemo(() => (path == null ? null : [path]), [path]);
    const resultArray = useSrcArrayFromGraphQL(pathArray);
    if (resultArray.type !== done) {
        return resultArray;
    }
    const result = resultArray.value[0];
    if (result == null) {
        return { type: error };
    }
    return { type: success, value: result };
}
