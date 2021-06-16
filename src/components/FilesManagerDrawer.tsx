import * as React from 'react';
import { Button, Drawer, Dropdown, Input, Menu, Modal, Result, Table, Tabs, Upload, notification } from 'antd';
import { FilePathFragment, FileSourceType } from '../generated/graphql';
import { ColumnGroupType, ColumnType } from 'antd/lib/table';
import { getStorageForce } from '../utils/firebaseHelpers';
import MyAuthContext from '../contexts/MyAuthContext';
import DrawerFooter from '../layouts/DrawerFooter';
import FirebaseApp from 'firebase/app';
import * as Icons from '@ant-design/icons';
import FirebaseStorageLink from './FirebaseStorageLink';
import { FilesManagerDrawerType, some } from '../utils/types';
import ConfigContext from '../contexts/ConfigContext';
import copy from 'clipboard-copy';
import { fileName } from '../utils/filename';
import { extname } from '../utils/extname';
import { InformationIcon } from './InformationIcon';
import { useMe } from '../hooks/useMe';
import { FilterValue } from 'antd/lib/table/interface';
import { useMemoAsync } from '../hooks/useMemoAsync';
import moment from 'moment';

type Reference = firebase.default.storage.Reference;

export const image = 'image';
export const sound = 'sound';
export const others = 'others';
type FileType = typeof image | typeof sound | typeof others;

type DataSource = {
    reference: Reference;
    fullPath: string;
    fileName: string;
    fileType: FileType;
    metadata: unknown;
}

type Column = ColumnGroupType<DataSource> | ColumnType<DataSource>;

const ForceReloadPublicListKeyContext = React.createContext(0);
const SetForceReloadPublicListKeyContext = React.createContext<React.Dispatch<React.SetStateAction<number>>>(() => undefined);
const ForceReloadUnlistedListKeyContext = React.createContext(0);
const SetForceReloadUnlistedListKeyContext = React.createContext<React.Dispatch<React.SetStateAction<number>>>(() => undefined);

const Path = {
    public: {
        file: (fileName: string) => `version/1/uploader/public/${fileName}`,
        list: 'version/1/uploader/public',
    },
    unlisted: {
        file: (userId: string, fileName: string) => `version/1/uploader/unlisted/${userId}/${fileName}`,
        list: (userId: string) => `version/1/uploader/unlisted/${userId}`
    },
};

const $public = 'public';
const unlisted = 'unlisted';
type StorageType = typeof $public | typeof unlisted;

type FirebaseUploaderProps = {
    onUploaded: () => void;
    storageType: StorageType;
}

const FirebaseUploader: React.FC<FirebaseUploaderProps> = ({ onUploaded, storageType }: FirebaseUploaderProps) => {
    const { userUid: myUserUid } = useMe();
    const config = React.useContext(ConfigContext);

    if (storageType === $public) {
        return <span>publicモードは読み取り専用です。ファイルを設置するには、サーバー管理者がFirebase Storageで直接ファイルをアップロードします。</span>;
    }

    const webConfig = config.web;
    const accept = 'image/gif,image/jpeg,image/png,audio/mpeg,audio/wav';

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
                    if (!webConfig.firebase.storage.enableUnlisted) {
                        return null;
                    }
                    return getStorageForce(config).ref(Path.unlisted.file(myUserUid, options.file.name));
                })();
                if (storageRef == null) {
                    return;
                }
                storageRef.put(options.file).then(() => {
                    if (options.onSuccess != null) {
                        options.onSuccess({}, new XMLHttpRequest());
                    }
                    onUploaded();
                }).catch(err => {
                    if (options.onError != null) {
                        if (typeof err === 'string') {
                            options.onError(new Error(err));
                            return;
                        }
                        options.onError(err);
                    }
                });
            }}
            multiple>
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
        return (<FirebaseStorageLink key={record.reference.fullPath} reference={record.reference} />);
    },
};

const fileTypeColumn = (defaultFilteredValue: FilterValue | null | undefined): Column => ({
    title: (<span>種類 <InformationIcon title='種類の分類はあくまで簡易的なものです。誤った分類がされることがあります。' /></span>),
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
    sorter: (x, y) => (getTimeCreated(x.metadata) ?? '').localeCompare((getTimeCreated(y.metadata) ?? '')),
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
        return (<Button key={record.reference.fullPath} onClick={() => onClick(record.reference)}>選択</Button>);
    },
});

type FileOptionsMenuProps = {
    reference: Reference;
    storageType: StorageType;
}

const FileOptionsMenu: React.FC<FileOptionsMenuProps> = ({ reference, storageType }: FileOptionsMenuProps) => {
    const setForceReloadPublicListKey = React.useContext(SetForceReloadPublicListKeyContext);
    const setForceReloadUnlistedListKey = React.useContext(SetForceReloadUnlistedListKeyContext);

    return (
        <div>
            <Menu>
                <Menu.Item icon={<Icons.CopyOutlined />} onClick={() => {
                    copy(`firebase:${reference.fullPath}`)
                        .then(() => {
                            notification.success({
                                message: 'クリップボードにコピーしました。',
                                placement: 'bottomRight'
                            });
                        });
                }}>
                    コマンドに使用するリンクとしてクリップボードにコピー
                </Menu.Item>
                <Menu.Item icon={<Icons.DeleteOutlined />} onClick={() => {
                    Modal.warn({
                        title: `${storageType} の ${reference.name} を削除します。よろしいですか？`,
                        onOk() {
                            reference.delete().then(() => {
                                switch (storageType) {
                                    case $public:
                                        setForceReloadPublicListKey(oldValue => oldValue + 1);
                                        break;
                                    case unlisted:
                                        setForceReloadUnlistedListKey(oldValue => oldValue + 1);
                                        break;
                                }
                            });
                        },
                        okButtonProps: { danger: true, type: 'primary' },
                        okText: '削除',
                        okCancel: true,
                        keyboard: true,
                        autoFocusButton: 'cancel',
                        maskClosable: true,
                    });
                }}>
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
                trigger={['click']} />
        );
    },
});

type FirebaseFilesListProps = {
    files: Reference[];
    onFlieOpen?: (ref: Reference) => void;
    storageType: StorageType;
    defaultFilteredValue?: FilterValue;
}

const FirebaseFilesList: React.FC<FirebaseFilesListProps> = ({
    files,
    onFlieOpen,
    storageType,
    defaultFilteredValue
}: FirebaseFilesListProps) => {
    const dataSource: DataSource[] | undefined = useMemoAsync(async () => {
        const promises = files.map(async file => {
            const metadata = await file.getMetadata();
            const name = fileName(file.fullPath);
            let fileType: FileType;
            switch (extname(name)?.toLowerCase()) {
                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'gif':
                case 'bmp':
                case 'webp':
                    fileType = image;
                    break;
                case 'mp3':
                case 'ogg':
                case 'oga':
                case 'wav':
                case 'aac':
                case 'weba':
                    fileType = sound;
                    break;
                default:
                    fileType = others;
                    break;
            }
            return {
                reference: file,
                fullPath: file.fullPath,
                fileName: name,
                fileType,
                metadata,
            };
        });
        return await Promise.all(promises);
    }
    , [files]);
    const columns = (() => {
        if (onFlieOpen != null) {
            return [fileNameColumn, fileTypeColumn(defaultFilteredValue), createdAtColumn, openButtonColumn(onFlieOpen), fileOptionsColumn(storageType)];
        }
        return [fileNameColumn, fileTypeColumn(defaultFilteredValue), createdAtColumn, fileOptionsColumn(storageType)];
    })();
    return (<Table
        size='small'
        pagination={{ pageSize: 15 }}
        rowKey='fullPath'
        columns={columns}
        dataSource={dataSource ?? []} />);
};

type FirebaseFilesManagerProps = {
    onFlieOpen?: (path: FilePathFragment) => void;
    defaultFilteredValue?: FilterValue;
}

const FirebaseFilesManager: React.FC<FirebaseFilesManagerProps> = ({ onFlieOpen, defaultFilteredValue }: FirebaseFilesManagerProps) => {
    const { userUid: myUserUid } = useMe();
    const [publicFiles, setPublicFiles] = React.useState<Reference[]>([]);
    const [unlistedFiles, setUnlistedFiles] = React.useState<Reference[]>([]);
    const forceReloadPublicListKey = React.useContext(ForceReloadPublicListKeyContext);
    const setForceReloadPublicListKey = React.useContext(SetForceReloadPublicListKeyContext);
    const forceReloadUnlistedListKey = React.useContext(ForceReloadUnlistedListKeyContext);
    const setForceReloadUnlistedListKey = React.useContext(SetForceReloadUnlistedListKeyContext);
    const config = React.useContext(ConfigContext);

    React.useEffect(() => {
        let unsubscribed = false;
        const main = async () => {
            if (!config.web.firebase.storage.enablePublic) {
                return;
            }
            const $public = await getStorageForce(config).ref(Path.public.list).listAll();
            if (unsubscribed) {
                return;
            }
            setPublicFiles($public.items);
        };
        main();
        return () => {
            unsubscribed = true;
        };
    }, [forceReloadPublicListKey, config]); // もしpublicでアクセスできるファイルがUserによって異なるように変更した場合、depsにmyAuth.uidなどを含めるほうがいい。

    React.useEffect(() => {
        if (myUserUid == null) {
            return;
        }
        let unsubscribed = false;
        const main = async () => {
            if (!config.web.firebase.storage.enableUnlisted) {
                return;
            }
            const unlisted = await getStorageForce(config).ref(Path.unlisted.list(myUserUid)).listAll();
            if (unsubscribed) {
                return;
            }
            setUnlistedFiles(unlisted.items);
        };
        main();
        return () => {
            unsubscribed = true;
        };
    }, [myUserUid, forceReloadUnlistedListKey, config]);

    if (!config.web.firebase.storage.enablePublic && !config.web.firebase.storage.enableUnlisted) {
        return (<div>Firebase StorageのUIは管理者によって全て無効化されています。</div>);
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
        if (config.web.firebase.storage.enableUnlisted) {
            return (
                <Tabs.TabPane tab="unlisted" key="storage1">
                    <div>
                        <FirebaseUploader storageType={unlisted} onUploaded={() => {
                            setForceReloadUnlistedListKey(oldValue => oldValue + 1);
                        }} />
                        <FirebaseFilesList files={unlistedFiles} onFlieOpen={onFirebaseFileOpen} storageType="unlisted" defaultFilteredValue={defaultFilteredValue} />
                    </div>
                </Tabs.TabPane>
            );
        }
        return (
            <Tabs.TabPane tab="unlisted" disabled key="storage1" />
        );
    })();

    const publicTabPane: JSX.Element = (() => {
        if (config.web.firebase.storage.enablePublic) {
            return (
                <Tabs.TabPane tab="public" key="storage2">
                    <div>
                        <FirebaseUploader storageType={$public} onUploaded={() => {
                            setForceReloadPublicListKey(oldValue => oldValue + 1);
                        }} />
                        <FirebaseFilesList files={publicFiles} onFlieOpen={onFirebaseFileOpen} storageType="public" defaultFilteredValue={defaultFilteredValue} />
                    </div>
                </Tabs.TabPane>
            );
        }
        return (
            <Tabs.TabPane tab="public" disabled key="storage2" />
        );
    })();

    return (
        <Tabs>
            {unlistedTabPane}
            {publicTabPane}
        </Tabs>
    );
};

type Props = {
    drawerType: FilesManagerDrawerType | null;
    onClose: () => void;
}

const FilesManagerDrawer: React.FC<Props> = ({ drawerType, onClose }: Props) => {
    const myAuth = React.useContext(MyAuthContext);
    const [forceReloadPublicListKey, setForceReloadPublicListKey] = React.useState(0);
    const [forceReloadUnlistedListKey, setForceReloadUnlistedListKey] = React.useState(0);
    const [input, setInput] = React.useState<string>('');

    const child = (() => {
        if (typeof myAuth === 'string') {
            return (<Result status='warning' title='この機能を利用するにはログインする必要があります。' />);
        }
        let onFileOpen: ((path: FilePathFragment) => void) | undefined = undefined;
        if (drawerType?.openFileType === some) {
            onFileOpen = path => {
                drawerType.onOpen(path);
                onClose();
            };
        }
        return (
            <Tabs>
                <Tabs.TabPane tab="Firebase Storage" key="1">
                    <FirebaseFilesManager onFlieOpen={onFileOpen} defaultFilteredValue={drawerType?.defaultFilteredValue} />
                </Tabs.TabPane>
                {drawerType?.openFileType === some && <Tabs.TabPane tab="URL" key="2">
                    <div>
                        <Input value={input} onChange={e => setInput(e.target.value)} />
                        <Button
                            type='primary'
                            style={{ marginTop: 2 }}
                            disabled={input.trim() === '' /* このチェックはかなり簡易的 */}
                            onClick={() => {
                                drawerType.onOpen({ sourceType: FileSourceType.Default, path: input.trim() });
                                setInput('');
                                onClose();
                            }}>OK</Button>
                    </div>
                </Tabs.TabPane>}
            </Tabs>
        );
    })();

    return (
        <ForceReloadPublicListKeyContext.Provider value={forceReloadPublicListKey}>
            <SetForceReloadPublicListKeyContext.Provider value={setForceReloadPublicListKey}>
                <ForceReloadUnlistedListKeyContext.Provider value={forceReloadUnlistedListKey}>
                    <SetForceReloadUnlistedListKeyContext.Provider value={setForceReloadUnlistedListKey}>
                        <Drawer
                            className='cancel-rnd'
                            closable
                            visible={drawerType != null}
                            onClose={() => onClose()}
                            width={800}
                            footer={(<DrawerFooter
                                close={({
                                    textType: 'close',
                                    onClick: () => onClose()
                                })} />)}>
                            {child}
                        </Drawer>
                    </SetForceReloadUnlistedListKeyContext.Provider>
                </ForceReloadUnlistedListKeyContext.Provider>
            </SetForceReloadPublicListKeyContext.Provider>
        </ForceReloadPublicListKeyContext.Provider>
    );
};

export default FilesManagerDrawer;