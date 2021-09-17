import { FilePath } from '@kizahasi/flocon-core';
import React from 'react';
import { useDeepCompareEffect } from 'react-use';
import ConfigContext from '../contexts/ConfigContext';
import { FirebaseAuthenticationIdTokenContext } from '../contexts/FirebaseAuthenticationIdTokenContext';
import { FirebaseStorageUrlCacheContext } from '../contexts/FirebaseStorageUrlCacheContext';
import { FilePathFragment } from '../generated/graphql';
import { FilePath as FilePathModule } from '../utils/filePath';

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
    const config = React.useContext(ConfigContext);
    const [result, setResult] = React.useState<SrcArrayResult>({ type: loading });
    const firebaseStorageUrlCacheContext = React.useContext(FirebaseStorageUrlCacheContext);
    const idToken = React.useContext(FirebaseAuthenticationIdTokenContext);

    // deep equalityでチェックされるため、余計なプロパティを取り除いている
    const cleanPathArray = pathArray?.map(path => ({
        path: path.path,
        sourceType: path.sourceType,
    }));

    useDeepCompareEffect(() => {
        // コメントアウトしている理由は下のHACKを参照
        // if (idToken == null) {
        //     setResult({ type: loading });
        //     return;
        // }
        if (cleanPathArray == null) {
            setResult({ type: nullishArg });
            return;
        }
        let isDisposed = false;
        Promise.all(
            cleanPathArray.map(path => {
                // firebaseStorageUrlCacheContextはDeepCompareしてほしくないしされる必要もないインスタンスであるため、depsに加えてはいけない。
                // HACK: ImagePieceからはFirebaseAuthenticationIdTokenContextの値を取得できないため（他のContextも同様かもしれない）、常にidToken==nullとなり画像読み込みが失敗する。そのため、暫定的にidTokenのnullチェックを無効化し適当な値を渡している。現状では内蔵アップローダーを使っていないため、idTokenは使われていないので動作は問題ない。
                return FilePathModule.getSrc(
                    path,
                    config,
                    idToken ?? '',
                    firebaseStorageUrlCacheContext
                );
            })
        )
            .then(all => {
                if (isDisposed) {
                    return;
                }
                setResult({ type: done, value: all.map(x => x.src ?? null) });
            })
            .catch(e => {
                console.log('error', e);

                setResult({ type: error, error: e });
            });
        return () => {
            isDisposed = true;
        };
    }, [cleanPathArray, idToken]);

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
