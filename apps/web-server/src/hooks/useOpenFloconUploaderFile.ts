import { App } from 'antd';
import fileDownload from 'js-file-download';
import React from 'react';
import { useGetIdToken } from './useGetIdToken';
import { useWebConfig } from './useWebConfig';
import { files, getFloconUploaderFile, idTokenIsNull } from '@/utils/file/getFloconUploaderFile';
import { useSingleExecuteAsync1 } from './useSingleExecuteAsync';

export const useOpenFloconUploaderFile = () => {
    const webConfig = useWebConfig();
    const { getIdToken } = useGetIdToken();
    const { notification } = App.useApp();
    const { execute, isExecuting } = useSingleExecuteAsync1(
        async (file: { filename: string; screenname: string }) => {
            if (webConfig?.value == null) {
                // CONSIDER: notificationなどで通知したほうがいいか
                return;
            }
            const blob = await getFloconUploaderFile({
                filename: file.filename,
                config: webConfig.value,
                getIdToken,
                mode: files,
            });
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
        {
            onDecline: () => {
                notification.warning({
                    message:
                        '他のファイルをダウンロードしているため、ダウンロードを開始できませんでした。',
                });
            },
        },
    );

    return React.useMemo(
        () => ({
            open: execute,
            isExecuting,
        }),
        [execute, isExecuting],
    );
};
