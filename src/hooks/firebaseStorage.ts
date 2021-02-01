import React from 'react';
import { useDeepCompareEffectNoCheck } from 'use-deep-compare-effect';
import ConfigContext from '../contexts/ConfigContext';
import { FilePathFragment, FileSourceType } from '../generated/graphql';
import { getStorageForce } from '../utils/firebaseHelpers';

// PathArrayがnullish ⇔ 戻り値がnull
// pathArray.length = 戻り値.length
export function useFirebaseStorageUrlArray(pathArray: ReadonlyArray<FilePathFragment> | null | undefined): (string | null)[] | null {
    const config = React.useContext(ConfigContext);
    const [result, setResult] = React.useState<(string | null)[] | null>(null);

    // deep equalityでチェックされるため、余計なプロパティを取り除いている
    const cleanPathArray = pathArray?.map(path => ({ path: path.path, sourceType: path.sourceType }));

    useDeepCompareEffectNoCheck(() => {
        if (cleanPathArray == null) {
            setResult(null);
            return;
        }
        let isDisposed = false;
        Promise.all(cleanPathArray.map(async path => {
            if (path.sourceType === FileSourceType.Default) {
                return path.path;
            }
            const url = await getStorageForce(config).ref(path.path).getDownloadURL();
            if (typeof url !== 'string') {
                return null;
            }
            return url;
        })).then(all => {
            if (isDisposed) {
                return;
            }
            setResult(all);
        }).catch(e => console.log('error', e));
        return () => {
            isDisposed = true;
        };
    }, [cleanPathArray]);

    return result;
}

export function useFirebaseStorageUrl(path: FilePathFragment | null | undefined): string | null {
    const pathArray = React.useMemo(() => path == null ? null : [path], [path]);
    const resultArray = useFirebaseStorageUrlArray(pathArray);
    if (resultArray == null) {
        return null;
    }
    return resultArray[0] ?? null;
}