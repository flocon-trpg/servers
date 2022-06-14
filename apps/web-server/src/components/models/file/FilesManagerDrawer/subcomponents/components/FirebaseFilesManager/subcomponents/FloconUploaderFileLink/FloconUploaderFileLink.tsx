import React from 'react';
import { FileItemFragment } from '@flocon-trpg/typed-document-node-v0.7.1';
import {
    files,
    getFloconUploaderFile,
} from '../../../../../../../../../utils/file/getFloconUploaderFile';
import fileDownload from 'js-file-download';
import { useWebConfig } from '../../../../../../../../../hooks/useWebConfig';
import { getIdTokenAtom } from '../../../../../../../../../pages/_app';
import { useAtomValue } from 'jotai';

type Props = {
    state: FileItemFragment;
};

export const FloconUploaderFileLink: React.FC<Props> = ({ state }: Props) => {
    const getIdToken = useAtomValue(getIdTokenAtom);
    const config = useWebConfig();
    const [isDownloading, setIsDownloading] = React.useState(false);

    if (config?.value == null) {
        return null;
    }

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
                    const idToken = await getIdToken();
                    if (idToken == null) {
                        return;
                    }
                    const axiosResponse = await getFloconUploaderFile({
                        filename: state.filename,
                        config: config.value,
                        idToken,
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
