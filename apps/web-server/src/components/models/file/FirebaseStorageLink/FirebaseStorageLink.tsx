import { StorageReference, getDownloadURL, ref } from 'firebase/storage';
import { useAtomValue } from 'jotai/utils';
import React from 'react';
import { useLatest } from 'react-use';
import { FirebaseStorageUrlCacheContext } from '@/contexts/FirebaseStorageUrlCacheContext';
import { firebaseStorageAtom } from '@/pages/_app';
import { fileName } from '@/utils/filename';

type Props = {
    reference: StorageReference | string;
};

export const FirebaseStorageLink: React.FC<Props> = ({ reference }: Props) => {
    const cache = React.useContext(FirebaseStorageUrlCacheContext);
    const cacheRef = useLatest(cache);
    const [url, setUrl] = React.useState<string>();
    const [fullPath, setFullPath] = React.useState<string>(
        typeof reference === 'string' ? '' : reference.fullPath
    );
    const storage = useAtomValue(firebaseStorageAtom);

    React.useEffect(() => {
        if (storage == null) {
            return;
        }

        let unsubscribed = false;

        const storageRef = (() => {
            if (typeof reference === 'string') {
                return ref(storage, reference);
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
    }, [reference, cacheRef, storage]);

    if (url == null) {
        return <span>{fileName(fullPath)}</span>;
    }

    return (
        <a href={url} target='_blank' rel='noopener noreferrer'>
            {fileName(fullPath)}
        </a>
    );
};
