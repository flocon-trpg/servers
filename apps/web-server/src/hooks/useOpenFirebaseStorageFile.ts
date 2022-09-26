import { StorageReference } from '@firebase/storage';
import { notification } from 'antd';
import React from 'react';
import { useQueryClient } from 'react-query';
import { fetchFirebaseStorageUrlQuery } from './useFirebaseStorageUrlQuery';

export const useOpenFirebaseStorageFile = () => {
    const queryClient = useQueryClient();
    const [isFetching, setIsFetching] = React.useState(false);

    const open = React.useCallback(
        async (storageReference: StorageReference) => {
            if (isFetching) {
                notification.warn({
                    message:
                        '他のファイルをダウンロードしているため、ダウンロードを開始できませんでした。',
                });
                return;
            }
            setIsFetching(true);
            const url = await fetchFirebaseStorageUrlQuery(queryClient, storageReference)
                .catch(() => null)
                .finally(() => {
                    setIsFetching(false);
                });
            if (url == null) {
                notification.warn({
                    message: 'ファイルを開けませんでした。',
                });
                return;
            }
            window.open(url, '_blank', 'noreferrer');
        },
        [isFetching, queryClient]
    );

    return React.useMemo(
        () => ({
            open,
            isFetching,
        }),
        [isFetching, open]
    );
};
