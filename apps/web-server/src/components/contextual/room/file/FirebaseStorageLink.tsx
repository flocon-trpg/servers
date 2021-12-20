import React from 'react';
import { FirebaseStorageUrlCacheContext } from '../../../../contexts/FirebaseStorageUrlCacheContext';
import { useReadonlyRef } from '../../../../hooks/useReadonlyRef';
import { useWebConfig } from '../../../../hooks/useWebConfig';
import { fileName } from '../../../../utils/filename';
import { getStorageForce } from '../../../../utils/firebaseHelpers';

type Props = {
    reference: firebase.default.storage.Reference | string;
};

export const FirebaseStorageLink: React.FC<Props> = ({ reference }: Props) => {
    const cache = React.useContext(FirebaseStorageUrlCacheContext);
    const cacheRef = useReadonlyRef(cache);
    const [url, setUrl] = React.useState<string>();
    const [fullPath, setFullPath] = React.useState<string>(
        typeof reference === 'string' ? '' : reference.fullPath
    );
    const config = useWebConfig();

    React.useEffect(() => {
        if (config?.value == null) {
            return;
        }

        let unsubscribed = false;

        const ref = (() => {
            if (typeof reference === 'string') {
                return getStorageForce(config.value).ref(reference);
            }
            return reference;
        })();
        setFullPath(ref.fullPath);
        const cachedUrl = cacheRef.current?.get(ref.fullPath);
        if (cachedUrl != null) {
            setUrl(cachedUrl);
            return;
        }
        ref.getDownloadURL().then(url => {
            if (unsubscribed) {
                return;
            }
            if (typeof url === 'string') {
                cacheRef.current?.set(ref.fullPath, url, 1000 * 60 * 10);
                setUrl(url);
            }
        });

        return () => {
            unsubscribed = true;
        };
    }, [reference, config, cacheRef]);

    if (url == null) {
        return <span>{fileName(fullPath)}</span>;
    }

    return (
        <a href={url} target='_blank' rel='noopener noreferrer'>
            {fileName(fullPath)}
        </a>
    );
};
