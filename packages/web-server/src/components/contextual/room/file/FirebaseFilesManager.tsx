import * as React from 'react';
import { Button, Dropdown, Menu, Table, Tabs, Upload, notification } from 'antd';
import { FilePathFragment, FileSourceType } from '@flocon-trpg/typed-document-node';
import { ColumnGroupType, ColumnType } from 'antd/lib/table';
import { getStorageForce } from '../../../../utils/firebaseHelpers';
import * as Icons from '@ant-design/icons';
import { FirebaseStorageLink } from './FirebaseStorageLink';
import copy from 'clipboard-copy';
import { fileName } from '../../../../utils/filename';
import { InformationIcon } from '../../../ui/InformationIcon';
import { FilterValue } from 'antd/lib/table/interface';
import moment from 'moment';
import { useMyUserUid } from '../../../../hooks/useMyUserUid';
import { $public, StorageType, unlisted } from '../../../../utils/file/firebaseStorage';
import {
    DeleteFirebaseStorageFileModal,
    useDeleteFirebaseStorageFileModalActions,
} from './DeleteFirebaseStorageFileModal';
import { accept } from './helper';
import { FileType, guessFileType, image, others, sound } from '../../../../utils/fileType';
import { FileState, Reference } from '../../../../atoms/firebaseStorage/fileState';
import { useAtom } from 'jotai';
import { unlistedFilesAtom } from '../../../../atoms/firebaseStorage/unlistedFilesAtom';
import { publicFilesAtom } from '../../../../atoms/firebaseStorage/publicFilesAtom';
import { reloadUnlistedFilesKeyAtom } from '../../../../atoms/firebaseStorage/reloadUnlistedFilesKeyAtom';
import { reloadPublicFilesKeyAtom } from '../../../../atoms/firebaseStorage/reloadPublicFilesKeyAtom';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { useWebConfig } from '../../../../hooks/useWebConfig';

type DataSource = FileState;

type Column = ColumnGroupType<DataSource> | ColumnType<DataSource>;

const Path = {
    public: {
        file: (fileName: string) => `version/1/uploader/public/${fileName}`,
        list: 'version/1/uploader/public',
    },
    unlisted: {
        file: (userId: string, fileName: string) =>
            `version/1/uploader/unlisted/${userId}/${fileName}`,
        list: (userId: string) => `version/1/uploader/unlisted/${userId}`,
    },
};

type UploaderProps = {
    onUploaded: () => void;
    storageType: StorageType;
};

const Uploader: React.FC<UploaderProps> = ({ onUploaded, storageType }: UploaderProps) => {
    const myUserUid = useMyUserUid();
    const config = useWebConfig();

    if (storageType === $public) {
        return (
            <span>
                publicモードは読み取り専用です。ファイルを設置するには、サーバー管理者がFirebase
                Storageで直接ファイルをアップロードします。
            </span>
        );
    }

    // TODO: antdのUploaderでアップロードが完了したとき、そのログを消すメッセージが「remove file」でアイコンがゴミ箱なのは紛らわしいと思うので直したい。
    // TODO: 同一ファイル名のファイルをアップロードすると上書きされるので、そのときは失敗させるかダイアログを出したほうが親切か。
    return (
        <Upload.Dragger
            accept={accept}
            customRequest={options => {
                if (myUserUid == null) {
                    return;
                }
                if (typeof options.file === 'string' || !('name' in options.file)) {
                    return;
                }
                const storageRef = (() => {
                    if (config.isUnlistedFirebaseStorageEnabled !== true) {
                        return null;
                    }
                    return getStorageForce(config).ref(
                        Path.unlisted.file(myUserUid, options.file.name)
                    );
                })();
                if (storageRef == null) {
                    return;
                }
                storageRef
                    .put(options.file)
                    .then(() => {
                        if (options.onSuccess != null) {
                            options.onSuccess({}, new XMLHttpRequest());
                        }
                        onUploaded();
                    })
                    .catch(err => {
                        if (options.onError != null) {
                            if (typeof err === 'string') {
                                options.onError(new Error(err));
                                return;
                            }
                            options.onError(err);
                        }
                    });
            }}
            multiple
        >
            アップロードしたいファイルをここにドラッグするか、クリックしてください
        </Upload.Dragger>
    );
};

const fileNameColumn: Column = {
    title: 'ファイル名',
    sorter: (x, y) => x.fileName.localeCompare(y.fileName),
    sortDirections: ['ascend', 'descend'],
    // eslint-disable-next-line react/display-name
    render: (_, record: DataSource) => {
        return <FirebaseStorageLink key={record.reference.fullPath} reference={record.reference} />;
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
    onFilter: (value, record) => value === record.fileType,
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
        return toNumber(x.fileType) - toNumber(y.fileType);
    },
    sortDirections: ['ascend', 'descend'],
    width: 100,
    // eslint-disable-next-line react/display-name
    render: (_, record: DataSource) => {
        switch (record.fileType) {
            case image:
                return '画像';
            case sound:
                return '音声';
            default:
                return 'その他';
        }
    },
});

const getTimeCreated = (metadata: unknown): string | undefined => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const timeCreated = (metadata as any)?.timeCreated;
    if (typeof timeCreated === 'string') {
        return timeCreated;
    }
    return undefined;
};

const createdAtColumn: Column = {
    title: 'アップロード日時',
    sorter: (x, y) =>
        (getTimeCreated(x.metadata) ?? '').localeCompare(getTimeCreated(y.metadata) ?? ''),
    sortDirections: ['ascend', 'descend'],
    // eslint-disable-next-line react/display-name
    render: (_, record: DataSource) => {
        return moment(getTimeCreated(record.metadata)).format('YYYY/MM/DD HH:mm:ss');
    },
};

const openButtonColumn = (onClick: (ref: Reference) => void): Column => ({
    title: 'Open',
    key: 'Open',
    // eslint-disable-next-line react/display-name
    render: (_, record: DataSource) => {
        return (
            <Button key={record.reference.fullPath} onClick={() => onClick(record.reference)}>
                選択
            </Button>
        );
    },
});

type FileOptionsMenuProps = {
    reference: Reference;
    storageType: StorageType;
};

const FileOptionsMenu: React.FC<FileOptionsMenuProps> = ({
    reference,
    storageType,
}: FileOptionsMenuProps) => {
    const modalActions = useDeleteFirebaseStorageFileModalActions();

    return (
        <div>
            <Menu>
                <Menu.Item
                    icon={<Icons.CopyOutlined />}
                    onClick={() => {
                        copy(reference.fullPath).then(() => {
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
                        DeleteFirebaseStorageFileModal(storageType, reference, modalActions)
                    }
                >
                    削除
                </Menu.Item>
            </Menu>
        </div>
    );
};

const fileOptionsColumn = (storageType: StorageType): Column => ({
    dataIndex: 'options',
    width: 40,
    // eslint-disable-next-line react/display-name
    render: (_, record: DataSource) => {
        return (
            <Dropdown.Button
                icon={<Icons.MoreOutlined />}
                overlay={<FileOptionsMenu reference={record.reference} storageType={storageType} />}
                type={'text' as any}
                trigger={['click']}
            />
        );
    },
});

type FirebaseFilesListProps = {
    onFlieOpen?: (ref: Reference) => void;
    storageType: StorageType;
    defaultFilteredValue?: FilterValue;
};

const FirebaseFilesList: React.FC<FirebaseFilesListProps> = ({
    onFlieOpen,
    storageType,
    defaultFilteredValue,
}: FirebaseFilesListProps) => {
    const unlistedFiles = useAtomValue(unlistedFilesAtom);
    const publicFiles = useAtomValue(publicFilesAtom);
    const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
    const deleteFirebaseStorageFileModalActions = useDeleteFirebaseStorageFileModalActions();

    const columns = (() => {
        if (onFlieOpen != null) {
            return [
                fileNameColumn,
                fileTypeColumn(defaultFilteredValue),
                createdAtColumn,
                openButtonColumn(onFlieOpen),
                fileOptionsColumn(storageType),
            ];
        }
        return [
            fileNameColumn,
            fileTypeColumn(defaultFilteredValue),
            createdAtColumn,
            fileOptionsColumn(storageType),
        ];
    })();
    return (
        <div>
            <Button
                disabled={selectedRowKeys.length === 0}
                onClick={() => {
                    let selectedFiles: FileState[];
                    if (storageType === $public) {
                        if (publicFiles == null) {
                            return;
                        }
                        selectedFiles = publicFiles.filter(r =>
                            selectedRowKeys.some(key => r.fullPath === key)
                        );
                    } else {
                        if (unlistedFiles == null) {
                            return;
                        }
                        selectedFiles = unlistedFiles.filter(r =>
                            selectedRowKeys.some(key => r.fullPath === key)
                        );
                    }
                    DeleteFirebaseStorageFileModal(
                        storageType,
                        selectedFiles.map(s => s.reference),
                        deleteFirebaseStorageFileModalActions
                    );
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
                rowKey='fullPath'
                columns={columns}
                dataSource={(storageType === unlisted ? unlistedFiles : publicFiles) ?? []}
            />
        </div>
    );
};

const referencesToDataSource = (files: ReadonlyArray<Reference>): Promise<DataSource[]> => {
    const promises = files.map(async file => {
        const metadata = await file.getMetadata();
        const name = fileName(file.fullPath);
        const fileType = guessFileType(name);
        return {
            reference: file,
            fullPath: file.fullPath,
            fileName: name,
            fileType,
            metadata,
        };
    });
    return Promise.all(promises);
};

type FirebaseFilesManagerProps = {
    onFlieOpen?: (path: FilePathFragment) => void;
    defaultFilteredValue?: FilterValue;
};

export const FirebaseFilesManager: React.FC<FirebaseFilesManagerProps> = ({
    onFlieOpen,
    defaultFilteredValue,
}: FirebaseFilesManagerProps) => {
    const myUserUid = useMyUserUid();
    const [reloadUnlistedFilesKey, setReloadUnlistedFilesKey] = useAtom(reloadUnlistedFilesKeyAtom);
    const [reloadPublicFilesKey, setReloadPublicFilesKey] = useAtom(reloadPublicFilesKeyAtom);
    const setUnlistedFiles = useUpdateAtom(unlistedFilesAtom);
    const setPublicFiles = useUpdateAtom(publicFilesAtom);
    const config = useWebConfig();

    React.useEffect(() => {
        let unsubscribed = false;
        const main = async () => {
            if (config.isPublicFirebaseStorageEnabled !== true) {
                return;
            }
            const $public = await getStorageForce(config).ref(Path.public.list).listAll();
            const newState = await referencesToDataSource($public.items);
            if (unsubscribed) {
                return;
            }
            setPublicFiles(newState);
        };
        main();
        return () => {
            unsubscribed = true;
        };
    }, [setPublicFiles, reloadPublicFilesKey, config]); // もしpublicでアクセスできるファイルがUserによって異なるように変更した場合、depsにmyAuth.uidなどを含めるほうがいい。

    React.useEffect(() => {
        if (myUserUid == null) {
            return;
        }
        let unsubscribed = false;
        const main = async () => {
            if (config.isUnlistedFirebaseStorageEnabled !== true) {
                return;
            }
            const unlisted = await getStorageForce(config)
                .ref(Path.unlisted.list(myUserUid))
                .listAll();
            const newState = await referencesToDataSource(unlisted.items);
            if (unsubscribed) {
                return;
            }
            setUnlistedFiles(newState);
        };
        main();
        return () => {
            unsubscribed = true;
        };
    }, [myUserUid, setUnlistedFiles, reloadUnlistedFilesKey, config]);

    if (
        config.isPublicFirebaseStorageEnabled !== true &&
        config.isUnlistedFirebaseStorageEnabled !== true
    ) {
        return <div>Firebase StorageのUIは管理者によって全て無効化されています。</div>;
    }

    let onFirebaseFileOpen: ((ref: Reference) => void) | undefined = undefined;
    if (onFlieOpen != null) {
        onFirebaseFileOpen = ref => {
            const path = {
                path: ref.fullPath,
                sourceType: FileSourceType.FirebaseStorage,
            };
            onFlieOpen(path);
        };
    }

    const unlistedTabPane: JSX.Element = (() => {
        if (config.isUnlistedFirebaseStorageEnabled) {
            return (
                <Tabs.TabPane tab='unlisted' key='storage1'>
                    <div>
                        <Uploader
                            storageType={unlisted}
                            onUploaded={() => {
                                setReloadUnlistedFilesKey(i => i + 1);
                            }}
                        />
                        <FirebaseFilesList
                            onFlieOpen={onFirebaseFileOpen}
                            storageType='unlisted'
                            defaultFilteredValue={defaultFilteredValue}
                        />
                    </div>
                </Tabs.TabPane>
            );
        }
        return <Tabs.TabPane tab='unlisted' disabled key='storage1' />;
    })();

    const publicTabPane: JSX.Element = (() => {
        if (config.isPublicFirebaseStorageEnabled) {
            return (
                <Tabs.TabPane tab='public' key='storage2'>
                    <div>
                        <Uploader
                            storageType={$public}
                            onUploaded={() => {
                                setReloadPublicFilesKey(i => i + 1);
                            }}
                        />
                        <FirebaseFilesList
                            onFlieOpen={onFirebaseFileOpen}
                            storageType='public'
                            defaultFilteredValue={defaultFilteredValue}
                        />
                    </div>
                </Tabs.TabPane>
            );
        }
        return <Tabs.TabPane tab='public' disabled key='storage2' />;
    })();

    return (
        <Tabs>
            {unlistedTabPane}
            {publicTabPane}
        </Tabs>
    );
};
