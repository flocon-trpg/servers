import React from 'react';
import { ConfigContext } from '../contexts/ConfigContext';
import { FirebaseAuthenticationIdTokenContext } from '../contexts/FirebaseAuthenticationIdTokenContext';
import { FileItemFragment } from '../generated/graphql';
import { files, getFloconUploaderFile } from '../utils/getFloconUploaderFile';
import fileDownload from 'js-file-download';

type Props = {
    state: FileItemFragment;
};

export const FloconUploaderFileLink: React.FC<Props> = ({ state }: Props) => {
    const getIdToken = React.useContext(FirebaseAuthenticationIdTokenContext);
    const config = React.useContext(ConfigContext);
    const [isDownloading, setIsDownloading] = React.useState(false);

    if (isDownloading) {
        return <span>{state.screenname}</span>;
    }

    return (
        <a
            onClick={() => {
                setIsDownloading(true);
                const main = async () => {
                    if (getIdToken == null) {
                        return;
                    }
                    const axiosResponse = await getFloconUploaderFile({
                        filename: state.filename,
                        config,
                        idToken: await getIdToken(),
                        mode: files,
                    });
                    if (axiosResponse.data == null) {
                        return null;
                    }
                    const blob = new Blob([axiosResponse.data]);
                    fileDownload(blob, state.screenname);
                };
                main().finally(() => setIsDownloading(false));
            }}
        >
            {state.screenname}
        </a>
    );
};
