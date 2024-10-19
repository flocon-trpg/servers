import { StorageReference } from '@firebase/storage';
import { useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { fetchFirebaseStorageUrlQuery } from './useFirebaseStorageUrlQuery';
import { useSingleExecuteAsync1 } from './useSingleExecuteAsync';
import React from 'react';

export const useOpenFirebaseStorageFile = () => {
    const queryClient = useQueryClient();
    const { notification } = App.useApp();
    const result = useSingleExecuteAsync1(
        async (storageReference: StorageReference) => {
            const url = await fetchFirebaseStorageUrlQuery(queryClient, storageReference).catch(
                () => null,
            );
            if (url == null) {
                notification.warning({
                    message: 'ファイルを開けませんでした。',
                });
                return;
            }
            window.open(url, '_blank', 'noreferrer');
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
        () => ({ open: result.execute, isExecuting: result.isExecuting }),
        [result.execute, result.isExecuting],
    );
};
