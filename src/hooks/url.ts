import { FilePath } from '@kizahasi/flocon-core';
import React from 'react';
import { useDeepCompareEffect } from 'react-use';
import ConfigContext from '../contexts/ConfigContext';
import { FirebaseStorageUrlCacheContext } from '../contexts/FirebaseStorageUrlCacheContext';
import { FilePathFragment } from '../generated/graphql';
import { FilePath as FilePathModule } from '../utils/filePath';

export const done = 'done';
export const success = 'success';
export const loading = 'loading';
export const nullishArg = 'nullishArg';
export const error = 'error';

type UrlArrayResult =
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
export function useUrlArrayFromGraphQL(
    pathArray: ReadonlyArray<FilePathFragment | FilePath> | null | undefined
): UrlArrayResult {
    const config = React.useContext(ConfigContext);
    const [result, setResult] = React.useState<UrlArrayResult>({ type: loading });
    const firebaseStorageUrlCacheContext = React.useContext(FirebaseStorageUrlCacheContext);

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
        setResult({ type: loading });
        let isDisposed = false;
        Promise.all(
            cleanPathArray.map(path => {
                // firebaseStorageUrlCacheContextはDeepCompareしてほしくないしされる必要もないインスタンスであるため、depsに加えてはいけない。
                return FilePathModule.getUrl(path, config, firebaseStorageUrlCacheContext);
            })
        )
            .then(all => {
                if (isDisposed) {
                    return;
                }
                setResult({ type: done, value: all });
            })
            .catch(e => {
                console.log('error', e);

                setResult({ type: error, error: e });
            });
        return () => {
            isDisposed = true;
        };
    }, [cleanPathArray]);

    return result;
}

type UrlResult =
    | {
          type: typeof success;
          value: string;
      }
    | {
          type: typeof loading | typeof error | typeof nullishArg;
      };

export function useUrlFromGraphQL(path: FilePathFragment | FilePath | null | undefined): UrlResult {
    const pathArray = React.useMemo(() => (path == null ? null : [path]), [path]);
    const resultArray = useUrlArrayFromGraphQL(pathArray);
    if (resultArray.type !== done) {
        return resultArray;
    }
    const result = resultArray.value[0];
    if (result == null) {
        return { type: error };
    }
    return { type: success, value: result };
}
