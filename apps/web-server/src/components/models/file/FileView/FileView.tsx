import * as Core from '@flocon-trpg/core';
import { FileSourceType, GetFilesDocument } from '@flocon-trpg/typed-document-node';
import { Alert, Button, Tooltip } from 'antd';
import classNames from 'classnames';
import { StorageReference } from 'firebase/storage';
import * as React from 'react';
import { useQuery } from 'urql';
import { FileSelectorModal } from '../FileSelectorModal/FileSelectorModal';
import { ImageView } from '../ImageView/ImageView';
import { useFirebaseStorageUrl } from '@/hooks/useFirebaseStorageUrl';
import { useOpenFloconUploaderFile } from '@/hooks/useOpenFloconUploaderFile';
import { flex, flexRow, itemsCenter } from '@/styles/className';
import { FilePath, FilePathLike } from '@/utils/file/filePath';
import { FileType } from '@/utils/fileType';
import { fileName } from '@/utils/filename';

type FilePathState = Core.State<typeof Core.filePathTemplate>;

const FirebaseStorageLink: React.FC<{
    reference: StorageReference | string;
}> = ({ reference }) => {
    const { queryResult, fullPath } = useFirebaseStorageUrl({ reference });

    if (fullPath == null) {
        return (
            <Alert
                type='warning'
                message='fullPathの値がundefinedです。Firebase Storage インスタンスがnullの可能性があります。'
            />
        );
    }

    if (queryResult.data == null) {
        return <span>{fileName(fullPath)}</span>;
    }

    return (
        <a href={queryResult.data} target='_blank' rel='noopener noreferrer'>
            {fileName(fullPath)}
        </a>
    );
};

const FloconUploaderLink: React.FC<{
    filename: string;
}> = ({ filename }) => {
    const [getFilesQueryResult] = useQuery({
        query: GetFilesDocument,
        variables: { input: { fileTagIds: [] } },
    });
    const fileItem = getFilesQueryResult.data?.result.files.find(
        file => file.filename === filename,
    );
    const { open } = useOpenFloconUploaderFile();

    if (fileItem == null) {
        return <span>{filename}</span>;
    }

    return <a onClick={() => open(fileItem)}>{fileName(fileItem.screenname)}</a>;
};

type OnPathChange = (newValue: FilePath | FilePathState | null) => void;

type PropsBase = {
    filePath?: FilePathLike;
    showImage?: boolean;
    maxWidthOfLink: number | null;
    uploaderFileBrowserHeight: number | null;
    style?: React.CSSProperties;
};

type ModeProps =
    | {
          /** nullishの場合は読み取り専用モードになります。 */
          onPathChange: null;
      }
    | {
          /** nullishの場合は読み取り専用モードになります。 */
          onPathChange: OnPathChange;
          defaultFileTypeFilter: FileType | null;
      };

type Props = PropsBase & ModeProps;

export const FileView: React.FC<Props> = props => {
    const { filePath, showImage, maxWidthOfLink, style } = props;
    let onPathChange: OnPathChange | null;
    let defaultFileTypeFilter: FileType | null;
    if (props.onPathChange == null) {
        onPathChange = props.onPathChange ?? null;
        defaultFileTypeFilter = null;
    } else {
        onPathChange = props.onPathChange;
        defaultFileTypeFilter = props.defaultFileTypeFilter;
    }

    const [modalVisible, setModalVisible] = React.useState(false);

    const imageElement = (() => {
        if (filePath == null || showImage !== true) {
            return null;
        }
        return <ImageView filePath={filePath} size={30} link />;
    })();
    const fileNameElement: JSX.Element = (() => {
        if (filePath == null) {
            return <span>（ファイルが選択されていません）</span>;
        }
        switch (filePath.sourceType) {
            case FileSourceType.Default:
            case 'Default': {
                const a = (ellipsis: boolean) => (
                    <a
                        href={filePath.path}
                        target='_blank'
                        rel='noopener noreferrer'
                        style={
                            ellipsis
                                ? {
                                      maxWidth: maxWidthOfLink ?? undefined,
                                      textOverflow: 'ellipsis',
                                      overflow: 'hidden',
                                      whiteSpace: 'nowrap',
                                  }
                                : undefined
                        }
                    >
                        {filePath.path}
                    </a>
                );
                return <Tooltip overlay={a(false)}>{a(true)}</Tooltip>;
            }
            case FileSourceType.FirebaseStorage:
            case 'FirebaseStorage':
                return <FirebaseStorageLink reference={filePath.path} />;
            case FileSourceType.Uploader:
            case 'Uploader':
                return <FloconUploaderLink filename={filePath.path} />;
        }
    })();

    return (
        <div className={classNames(flex, flexRow, itemsCenter)} style={style}>
            {imageElement}
            {imageElement == null ? null : <div style={{ width: 4 }} />}
            {fileNameElement}
            {onPathChange && (
                <>
                    <div style={{ width: 4 }} />
                    <Button onClick={() => setModalVisible(true)}>
                        {filePath == null ? '開く' : '変更'}
                    </Button>
                    {filePath != null && (
                        <Button
                            onClick={() => {
                                onPathChange && onPathChange(null);
                            }}
                        >
                            クリア
                        </Button>
                    )}
                    <FileSelectorModal
                        visible={modalVisible}
                        onClose={() => setModalVisible(false)}
                        onSelect={newValue => {
                            onPathChange && onPathChange(newValue);
                            setModalVisible(false);
                        }}
                        defaultFileTypeFilter={defaultFileTypeFilter}
                        uploaderFileBrowserHeight={props.uploaderFileBrowserHeight}
                    />
                </>
            )}
        </div>
    );
};
