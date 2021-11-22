import { Modal } from 'antd';
import { useUpdateAtom } from 'jotai/utils';
import React from 'react';
import { Reference } from '../atoms/firebaseStorage/fileState';
import { reloadPublicFilesKeyAtom } from '../atoms/firebaseStorage/reloadPublicFilesKeyAtom';
import { reloadUnlistedFilesKeyAtom } from '../atoms/firebaseStorage/reloadUnlistedFilesKeyAtom';
import { $public, StorageType, unlisted } from '../utils/firebaseStorage';

export const useDeleteFirebaseStorageFileModalActions = () => {
    const setReloadUnlistedFilesKey = useUpdateAtom(reloadUnlistedFilesKeyAtom);
    const setReloadPublicFilesKey = useUpdateAtom(reloadPublicFilesKeyAtom);
    return React.useMemo(
        () => ({
            setReloadUnlistedFilesKey,
            setReloadPublicFilesKey,
        }),
        [setReloadPublicFilesKey, setReloadUnlistedFilesKey]
    );
};

export const DeleteFirebaseStorageFileModal = (
    storageType: StorageType,
    reference: Reference | Reference[],
    actions: ReturnType<typeof useDeleteFirebaseStorageFileModalActions>
) => {
    const referenceArray = Array.isArray(reference) ? reference : [reference];
    const fileName =
        referenceArray.length === 1
            ? referenceArray[0]?.name
            : `${referenceArray.length}個のファイル`;
    const deleteFiles = async () => {
        for (const r of referenceArray) {
            await r.delete();
        }
        switch (storageType) {
            case $public:
                actions.setReloadPublicFilesKey(i => i + 1);
                break;
            case unlisted:
                actions.setReloadUnlistedFilesKey(i => i + 1);
                break;
        }
    };
    Modal.warn({
        title: `${storageType} の ${fileName} を削除します。よろしいですか？`,
        onOk() {
            deleteFiles();
        },
        okButtonProps: { danger: true, type: 'primary' },
        okText: '削除',
        okCancel: true,
        keyboard: true,
        autoFocusButton: 'cancel',
        maskClosable: true,
    });
};
