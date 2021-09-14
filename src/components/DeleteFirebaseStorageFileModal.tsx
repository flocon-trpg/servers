import { Modal } from 'antd';
import { useDispatch } from 'react-redux';
import { fileModule, FirebaseStorageFile } from '../modules/fileModule';
import { $public, StorageType, unlisted } from '../utils/firebaseStorage';

export const DeleteFirebaseStorageFileModal = (
    storageType: StorageType,
    reference: FirebaseStorageFile.Reference | FirebaseStorageFile.Reference[],
    dispatch: ReturnType<typeof useDispatch>
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
                dispatch(fileModule.actions.reloadFirebaseStoragePublicFiles());
                break;
            case unlisted:
                dispatch(fileModule.actions.reloadFirebaseStorageUnlistedFiles());
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
