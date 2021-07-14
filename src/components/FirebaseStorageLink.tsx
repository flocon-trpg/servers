import React from 'react';
import ConfigContext from '../contexts/ConfigContext';
import { fileName } from '../utils/filename';
import { getStorageForce } from '../utils/firebaseHelpers';

type Props = {
    reference: firebase.default.storage.Reference | string;
};

const FirebaseStorageLink: React.FC<Props> = ({ reference }: Props) => {
    const [url, setUrl] = React.useState<string>();
    const [fullPath, setFullPath] = React.useState<string>(
        typeof reference === 'string' ? '' : reference.fullPath
    );
    const config = React.useContext(ConfigContext);

    React.useEffect(() => {
        let unsubscribed = false;

        const ref = (() => {
            if (typeof reference === 'string') {
                return getStorageForce(config).ref(reference);
            }
            return reference;
        })();
        setFullPath(ref.fullPath);
        ref.getDownloadURL().then(url => {
            if (unsubscribed) {
                return;
            }
            if (typeof url === 'string') {
                setUrl(url);
            }
        });

        return () => {
            unsubscribed = true;
        };
    }, [reference, config]);

    if (url == null) {
        return <span>{fileName(fullPath)}</span>;
    }

    return (
        <a href={url} target="_blank" rel="noopener noreferrer">
            {fileName(fullPath)}
        </a>
    );
};

export default FirebaseStorageLink;
