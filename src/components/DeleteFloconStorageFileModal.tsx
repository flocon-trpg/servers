import { Modal } from 'antd';
import { FileItemFragment, useDeleteFilesMutation, useGetFilesQuery } from '../generated/graphql';

export const DeleteFloconStorageFileModal = (
    filesToDelete: FileItemFragment | FileItemFragment[]
) => {
    const { refetch } = useGetFilesQuery({ variables: { input: { fileTagIds: [] } } });
    const [deleteFilesMutation] = useDeleteFilesMutation();

    const filesArray = Array.isArray(filesToDelete) ? filesToDelete : [filesToDelete];
    const fileName =
        filesArray.length === 1 ? filesArray[0]?.screenname : `${filesArray.length}個のファイル`;
    const deleteFiles = async () => {
        if (filesArray.length === 0) {
            return;
        }
        const isSuccess = await deleteFilesMutation({ variables: { filenames: filesArray.map(f => f.filename) } }).then(() => true).catch(() => false);
        if (isSuccess) {
            await refetch();
        }
    };
    Modal.warn({
        title: `${fileName} を削除します。よろしいですか？`,
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
