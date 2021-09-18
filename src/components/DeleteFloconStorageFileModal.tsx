import { Modal } from 'antd';
import { FileItemFragment, useDeleteFilesMutation, useGetFilesQuery } from '../generated/graphql';

export const DeleteFloconStorageFileModal = (
    filesToDelete: FileItemFragment | FileItemFragment[],
    onOk: (flenamesToDelete: string[]) => void
) => {
    const filesArray = Array.isArray(filesToDelete) ? filesToDelete : [filesToDelete];
    const fileName =
        filesArray.length === 1 ? filesArray[0]?.screenname : `${filesArray.length}個のファイル`;
    Modal.warn({
        title: `${fileName} を削除します。よろしいですか？`,
        onOk() {
            onOk(filesArray.map(f => f.filename));
        },
        okButtonProps: { danger: true, type: 'primary' },
        okText: '削除',
        okCancel: true,
        keyboard: true,
        autoFocusButton: 'cancel',
        maskClosable: true,
    });
};
