import { App } from 'antd';
import fileDownload from 'js-file-download';
import React from 'react';
import { useGetIdToken } from './useGetIdToken';
import { useWebConfig } from './useWebConfig';
import { files, getFloconUploaderFile, idTokenIsNull } from '@/utils/file/getFloconUploaderFile';

export const useOpenFloconUploaderFile = () => {
    const webConfig = useWebConfig();
    const [isFetching, setIsFetching] = React.useState(false);
    const { getIdToken } = useGetIdToken();
    const { notification } = App.useApp();

    const open = React.useCallback(
        async (file: { filename: string; screenname: string }) => {
            if (webConfig?.value == null) {
                // CONSIDER: notificationなどで通知したほうがいいか
                return;
            }
            if (isFetching) {
                notification.warning({
                    message:
                        '他のファイルをダウンロードしているため、ダウンロードを開始できませんでした。',
                });
                return;
            }
            setIsFetching(true);
            const blob = await getFloconUploaderFile({
                filename: file.filename,
                config: webConfig.value,
                getIdToken,
                mode: files,
            }).finally(() => setIsFetching(false));
            if (blob === idTokenIsNull) {
                // CONSIDER: notificationなどで通知したほうがいいか
                return;
            }
            if (blob == null) {
                // CONSIDER: notificationなどで通知したほうがいいか
                return;
            }
            // screennameは拡張子などが変わっている可能性があるためfilenameを用いている
            // CONSIDER: 画像などであれば、ダウンロードするのではなく、新しいタブで開いたほうがいい
            fileDownload(blob, file.filename);
        },
        [getIdToken, isFetching, notification, webConfig?.value]
    );

    return React.useMemo(
        () => ({
            open,
            isFetching,
        }),
        [isFetching, open]
    );
};
