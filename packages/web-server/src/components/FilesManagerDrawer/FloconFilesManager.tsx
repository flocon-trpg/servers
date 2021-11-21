import * as React from 'react';
import { Button, Dropdown, Menu, notification, Table, Tooltip, Upload } from 'antd';
import { accept } from './helper';
import { getHttpUri } from '../../config';
import urljoin from 'url-join';
import axios from 'axios';
import { ColumnGroupType, ColumnType, FilterValue } from 'antd/lib/table/interface';
import {
    DeleteFilesDocument,
    FileItemFragment,
    FilePathFragment,
    FileSourceType,
    GetFilesDocument,
} from '@flocon-trpg/typed-document-node';
import { FloconUploaderFileLink } from '../FloconUploaderFileLink';
import { InformationIcon } from '../InformationIcon';
import { FileType, guessFileType, image, others, sound } from '../../utils/fileType';
import moment from 'moment';
import copy from 'clipboard-copy';
import * as Icons from '@ant-design/icons';
import { DeleteFloconStorageFileModal } from '../DeleteFloconStorageFileModal';
import { FirebaseAuthenticationIdTokenContext } from '../../contexts/FirebaseAuthenticationIdTokenContext';
import { useAsync } from 'react-use';
import { LazyAndPreloadImage } from '../LazyAndPreloadImage';
import { getFloconUploaderFile, thumbs } from '../../utils/getFloconUploaderFile';
import { useMutation, useQuery } from '@apollo/client';
import { useWebConfig } from '../../hooks/useWebConfig';

type DataSource = FileItemFragment;

type Column = ColumnGroupType<DataSource> | ColumnType<DataSource>;

type UploaderProps = {
    unlistedMode: boolean;
    onUploaded: () => void;
};

const Uploader: React.FC<UploaderProps> = ({ unlistedMode, onUploaded }: UploaderProps) => {
    const config = useWebConfig();
    const getIdToken = React.useContext(FirebaseAuthenticationIdTokenContext);

    if (getIdToken == null) {
        return null;
    }

    // TODO: antdのUploaderでアップロードが完了したとき、そのログを消すメッセージが「remove file」でアイコンがゴミ箱なのは紛らわしいと思うので直したい。
    // TODO: 同一ファイル名のファイルをアップロードすると上書きされるので、そのときは失敗させるかダイアログを出したほうが親切か。
    return (
        <Upload.Dragger
            accept={accept}
            customRequest={options => {
                const main = async () => {
                    if (typeof options.file === 'string' || !('name' in options.file)) {
                        return;
                    }
                    const idToken = await getIdToken();
                    if (idToken == null) {
                        return;
                    }
                    const formData = new FormData();
                    formData.append('file', options.file, options.file.name);
                    const axiosConfig = {
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    };
                    const result = await axios
                        .post(
                            urljoin(
                                getHttpUri(config),
                                'uploader',
                                'upload',
                                unlistedMode ? 'unlisted' : 'public'
                            ),
                            formData,
                            axiosConfig
                        )
                        .then(() => true)
                        .catch(err => err);

                    if (result === true) {
                        if (options.onSuccess != null) {
                            options.onSuccess({}, new XMLHttpRequest());
                        }
                        onUploaded();
                    } else {
                        if (options.onError != null) {
                            if (typeof result === 'string') {
                                options.onError(new Error(result));
                                return;
                            }
                            options.onError(result);
                        }
                    }
                };
                main();
            }}
            multiple
        >
            アップロードしたいファイルをここにドラッグするか、クリックしてください
        </Upload.Dragger>
    );
};

type ThumbProps = {
    thumbFilePath: string | undefined;
    size: number;
};

const Thumb: React.FC<ThumbProps> = ({ thumbFilePath, size }: ThumbProps) => {
    const config = useWebConfig();
    const getIdToken = React.useContext(FirebaseAuthenticationIdTokenContext);
    const loadingIcon = <Icons.LoadingOutlined style={{ fontSize: size }} />;
    const src = useAsync(async () => {
        if (thumbFilePath == null || getIdToken == null) {
            return null;
        }
        const idToken = await getIdToken();
        if (idToken == null) {
            return;
        }
        const axiosResponse = await getFloconUploaderFile({
            filename: thumbFilePath,
            config,
            idToken,
            mode: thumbs,
        });
        if (axiosResponse.data == null) {
            return null;
        }
        const blob = new Blob([axiosResponse.data]);
        return URL.createObjectURL(blob);
    }, [thumbFilePath, config, getIdToken]);

    return (
        <Tooltip
            overlay={
                <LazyAndPreloadImage
                    src={src.value ?? undefined}
                    width={80}
                    height={80}
                    loadingPlaceholder={loadingIcon}
                />
            }
        >
            <LazyAndPreloadImage
                src={src.value ?? undefined}
                width={size}
                height={size}
                loadingPlaceholder={loadingIcon}
            />
        </Tooltip>
    );
};

const thumbColumn: Column = {
    title: 'サムネイル',
    // eslint-disable-next-line react/display-name
    render: (_, record: DataSource) => {
        if (record.thumbFilename == null) {
            return null;
        }
        return <Thumb key={record.filename} thumbFilePath={record.thumbFilename} size={20} />;
    },
};

const screennameColumn: Column = {
    title: 'ファイル名',
    sorter: (x, y) => x.screenname.localeCompare(y.screenname),
    sortDirections: ['ascend', 'descend'],
    // eslint-disable-next-line react/display-name
    render: (_, record: DataSource) => {
        return <FloconUploaderFileLink key={record.filename} state={record} />;
    },
};

const fileTypeColumn = (defaultFilteredValue: FilterValue | null | undefined): Column => ({
    title: (
        <span>
            種類{' '}
            <InformationIcon title='種類の分類はあくまで簡易的なものです。誤った分類がされることがあります。' />
        </span>
    ),
    key: 'fileType',
    filters: [
        { text: '画像', value: image },
        { text: '音声', value: sound },
        { text: 'その他', value: others },
    ],
    onFilter: (value, record) => value === guessFileType(record.screenname),
    defaultFilteredValue,
    sorter: (x, y) => {
        const toNumber = (fileType: FileType): number => {
            switch (fileType) {
                case image:
                    return 1;
                case sound:
                    return 2;
                default:
                    return 3;
            }
        };
        return toNumber(guessFileType(x.screenname)) - toNumber(guessFileType(y.screenname));
    },
    sortDirections: ['ascend', 'descend'],
    width: 100,
    // eslint-disable-next-line react/display-name
    render: (_, record: DataSource) => {
        switch (guessFileType(record.screenname)) {
            case image:
                return '画像';
            case sound:
                return '音声';
            default:
                return 'その他';
        }
    },
});

const createdAtColumn: Column = {
    title: 'アップロード日時',
    sorter: (x, y) => (x.createdAt ?? 0) - (y.createdAt ?? 0),
    sortDirections: ['ascend', 'descend'],
    // eslint-disable-next-line react/display-name
    render: (_, record: DataSource) => {
        return moment(record.createdAt).format('YYYY/MM/DD HH:mm:ss');
    },
};

const openButtonColumn = (onClick: (filename: string) => void): Column => ({
    title: 'Open',
    key: 'Open',
    // eslint-disable-next-line react/display-name
    render: (_, record: DataSource) => {
        return (
            <Button key={record.filename} onClick={() => onClick(record.filename)}>
                選択
            </Button>
        );
    },
});

type FileOptionsMenuProps = {
    fileItem: FileItemFragment;
};

const FileOptionsMenu: React.FC<FileOptionsMenuProps> = ({ fileItem }: FileOptionsMenuProps) => {
    const { refetch } = useQuery(GetFilesDocument, { variables: { input: { fileTagIds: [] } } });
    const [deleteFilesMutation] = useMutation(DeleteFilesDocument);

    return (
        <div>
            <Menu>
                <Menu.Item
                    icon={<Icons.CopyOutlined />}
                    onClick={() => {
                        copy(fileItem.filename).then(() => {
                            notification.success({
                                message: 'クリップボードにコピーしました。',
                                placement: 'bottomRight',
                            });
                        });
                    }}
                >
                    コマンドに使用するリンクとしてクリップボードにコピー
                </Menu.Item>
                <Menu.Item
                    icon={<Icons.DeleteOutlined />}
                    onClick={() =>
                        DeleteFloconStorageFileModal([fileItem], async filenamesToDelete => {
                            if (filenamesToDelete.length === 0) {
                                return;
                            }
                            const isSuccess = await deleteFilesMutation({
                                variables: { filenames: filenamesToDelete },
                            })
                                .then(() => true)
                                .catch(() => false);
                            if (isSuccess) {
                                await refetch();
                            }
                        })
                    }
                >
                    削除
                </Menu.Item>
            </Menu>
        </div>
    );
};

const fileOptionsColumn: Column = {
    dataIndex: 'options',
    width: 40,
    // eslint-disable-next-line react/display-name
    render: (_, record: DataSource) => {
        return (
            <Dropdown.Button
                icon={<Icons.MoreOutlined />}
                overlay={<FileOptionsMenu fileItem={record} />}
                type={'text' as any}
                trigger={['click']}
            />
        );
    },
};

type FloconFilesListProps = {
    onFlieOpen?: (filename: string) => void;
    defaultFilteredValue?: FilterValue;
};

const FloconFilesList: React.FC<FloconFilesListProps> = ({
    onFlieOpen,
    defaultFilteredValue,
}: FloconFilesListProps) => {
    const getFilesQueryResult = useQuery(GetFilesDocument, {
        variables: { input: { fileTagIds: [] } },
    });
    const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
    const { refetch } = useQuery(GetFilesDocument, { variables: { input: { fileTagIds: [] } } });
    const [deleteFilesMutation] = useMutation(DeleteFilesDocument);

    const columns = (() => {
        if (onFlieOpen != null) {
            return [
                thumbColumn,
                screennameColumn,
                fileTypeColumn(defaultFilteredValue),
                createdAtColumn,
                openButtonColumn(onFlieOpen),
                fileOptionsColumn,
            ];
        }
        return [
            thumbColumn,
            screennameColumn,
            fileTypeColumn(defaultFilteredValue),
            createdAtColumn,
            fileOptionsColumn,
        ];
    })();
    return (
        <div>
            <Button
                disabled={selectedRowKeys.length === 0}
                onClick={() => {
                    const selectedFiles = getFilesQueryResult.data?.result.files.filter(f =>
                        selectedRowKeys.some(key => f.filename === key)
                    );
                    if (selectedFiles == null) {
                        return;
                    }
                    DeleteFloconStorageFileModal(selectedFiles, async filenamesToDelete => {
                        if (filenamesToDelete.length === 0) {
                            return;
                        }
                        const isSuccess = await deleteFilesMutation({
                            variables: { filenames: filenamesToDelete },
                        })
                            .then(() => true)
                            .catch(() => false);
                        if (isSuccess) {
                            await refetch();
                        }
                    });
                }}
            >
                選択したファイルを削除
            </Button>
            <Table
                rowSelection={{
                    selectedRowKeys,
                    onChange: selected => {
                        setSelectedRowKeys(selected);
                    },
                }}
                size='small'
                pagination={{ pageSize: 15 }}
                rowKey='filename'
                columns={columns}
                dataSource={getFilesQueryResult.data?.result.files ?? []}
            />
        </div>
    );
};

type Props = {
    onFlieOpen?: (file: FilePathFragment) => void;
    defaultFilteredValue?: FilterValue;
};

export const FloconFilesManager: React.FC<Props> = (props: Props) => {
    const { refetch } = useQuery(GetFilesDocument, { variables: { input: { fileTagIds: [] } } });
    return (
        <div>
            <Uploader onUploaded={() => refetch()} unlistedMode />
            <FloconFilesList
                {...props}
                onFlieOpen={filename => {
                    if (props.onFlieOpen == null) {
                        return;
                    }
                    props.onFlieOpen({ sourceType: FileSourceType.Uploader, path: filename });
                }}
            />
        </div>
    );
};
