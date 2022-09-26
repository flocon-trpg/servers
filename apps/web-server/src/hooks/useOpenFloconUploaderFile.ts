import React from 'react';
import fileDownload from 'js-file-download';
import { useWebConfig } from './useWebConfig';
import { files, getFloconUploaderFile, idTokenIsNull } from '@/utils/file/getFloconUploaderFile';
import { useGetIdToken } from './useGetIdToken';
import { notification } from 'antd';

export const useOpenFloconUploaderFile = () => {
    const webConfig = useWebConfig();
    const [isFetching, setIsFetching] = React.useState(false);
    const { getIdToken } = useGetIdToken();

    const open = React.useCallback(
        async (file: { filename: string; screenname: string }) => {
            if (webConfig?.value == null) {
                // CONSIDER: notificationなどで通知したほうがいいか
                return;
            }
            if (isFetching) {
                notification.warn({
                    message:
                        '他のファイルをダウンロードしているため、ダウンロードを開始できませんでした。',
                });
                return;
            }
            setIsFetching(true);
            const axiosResponse = await getFloconUploaderFile({
                filename: file.filename,
                config: webConfig.value,
                getIdToken,
                mode: files,
            }).finally(() => setIsFetching(false));
            if (axiosResponse === idTokenIsNull) {
                // CONSIDER: notificationなどで通知したほうがいいか
                return;
            }
            if (axiosResponse.data == null) {
                // CONSIDER: notificationなどで通知したほうがいいか
                return;
            }
            const blob = new Blob([axiosResponse.data]);
            // screennameは拡張子などが変わっている可能性があるためfilenameを用いている
            // CONSIDER: 画像などであれば、ダウンロードするのではなく、新しいタブで開いたほうがいい
            fileDownload(blob, file.filename);
        },
        [getIdToken, isFetching, webConfig?.value]
    );

    return React.useMemo(
        () => ({
            open,
            isFetching,
        }),
        [isFetching, open]
    );
};
