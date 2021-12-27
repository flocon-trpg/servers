import { StorageReference, ref, getDownloadURL } from 'firebase/storage';
import React from 'react';
import { FirebaseStorageUrlCacheContext } from '../../../../contexts/FirebaseStorageUrlCacheContext';
import { useReadonlyRef } from '../../../../hooks/useReadonlyRef';
import { useWebConfig } from '../../../../hooks/useWebConfig';
import { fileName } from '../../../../utils/filename';
import { getStorageForce } from '../../../../utils/firebaseHelpers';

type Props = {
    reference: StorageReference | string;
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

        const storageRef = (() => {
            if (typeof reference === 'string') {
                return ref(getStorageForce(config.value), reference);
            }
            return reference;
        })();
        setFullPath(storageRef.fullPath);
        const cachedUrl = cacheRef.current?.get(storageRef.fullPath);
        if (cachedUrl != null) {
            setUrl(cachedUrl);
            return;
        }
        getDownloadURL(storageRef).then(url => {
            if (unsubscribed) {
                return;
            }
            if (typeof url === 'string') {
                cacheRef.current?.set(storageRef.fullPath, url, 1000 * 60 * 10);
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
