import * as React from 'react';
import { Button, Drawer, Dropdown, Menu, Modal, Radio, Result, Table, Tabs, Tooltip, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { ShowUploadListInterface } from 'antd/lib/upload/interface';
import Link from 'next/link';
import { FilePathFragment, FileSourceType } from '../generated/graphql';
import { ColumnGroupType, ColumnType } from 'antd/lib/table';
import { getStorageForce } from '../utils/firebaseHelpers';
import MyAuthContext from '../contexts/MyAuthContext';
import ComponentsStateContext from './room/contexts/RoomComponentsStateContext';
import DispatchRoomComponentsStateContext from './room/contexts/DispatchRoomComponentsStateContext';
import DrawerFooter from '../layouts/DrawerFooter';
import FirebaseApp from 'firebase/app';
import { useSelector } from '../store';
import { useDispatch } from 'react-redux';
import { EllipsisOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import FirebaseStorageLink from './FirebaseStorageLink';
import { FilesManagerDrawerType, some } from '../utils/types';
import ConfigContext from '../contexts/ConfigContext';
import { __ } from '../@shared/collection';

type Reference = firebase.default.storage.Reference;

type Column = ColumnGroupType<Reference> | ColumnType<Reference>;

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
    authUser: firebase.default.User;
    onUploaded: () => void;
    storageType: StorageType;
}

const FirebaseUploader: React.FC<FirebaseUploaderProps> = ({ authUser, onUploaded, storageType }: FirebaseUploaderProps) => {
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
                const storageRef = (() => {
                    if (!webConfig.firebase.storage.enableUnlisted) {
                        return null;
                    }
                    return getStorageForce(config).ref(Path.unlisted.file(authUser.uid, options.file.name));
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
    title: 'Name',
    dataIndex: 'name',
    // eslint-disable-next-line react/display-name
    render: (_, record: Reference) => {
        return (<FirebaseStorageLink key={record.fullPath} reference={record} />);
    },
};

const openButtonColumn = (onClick: (ref: Reference) => void): Column => ({
    title: 'Open',
    dataIndex: '',
    key: 'Open',
    // eslint-disable-next-line react/display-name
    render: (_, record: Reference) => {
        return (<Button key={record.fullPath} onClick={() => onClick(record)}>Open</Button>);
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
                <Menu.Item icon={<DeleteOutlined />} onClick={() => {
                    Modal.warn({
                        title: `${storageType} の ${reference.name} を削除します。よろしいですか？`,
                        onOk() {
                            reference.delete().then(() => {
                                switch(storageType) {
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
    render: (_, record: Reference) => {
        return (
            <Dropdown.Button
                icon={<MoreOutlined />}
                overlay={<FileOptionsMenu reference={record} storageType={storageType} />}
                type={'text' as any}
                trigger={['click']} />
        );
    },
});

type FirebaseFilesListProps = {
    files: Reference[];
    onFlieOpen?: (ref: Reference) => void;
    storageType: StorageType;
}

const FirebaseFilesList: React.FC<FirebaseFilesListProps> = ({ files, onFlieOpen, storageType }: FirebaseFilesListProps) => {
    const columns = (() => {
        if (onFlieOpen != null) {
            return [fileNameColumn, openButtonColumn(onFlieOpen), fileOptionsColumn(storageType)];
        }
        return [fileNameColumn, fileOptionsColumn(storageType)];
    })();
    return (<Table rowKey='fullPath' columns={columns} dataSource={files} />);
};

type FirebaseFilesManagerProps = {
    myAuth: FirebaseApp.User;
    onFlieOpen?: (path: FilePathFragment) => void;
}

const FirebaseFilesManager: React.FC<FirebaseFilesManagerProps> = ({ myAuth, onFlieOpen }: FirebaseFilesManagerProps) => {
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
        let unsubscribed = false;
        const main = async () => {
            const userUid = myAuth.uid;
            if (!config.web.firebase.storage.enableUnlisted) {
                return;
            }
            const unlisted = await getStorageForce(config).ref(Path.unlisted.list(userUid)).listAll();
            if (unsubscribed) {
                return;
            }
            setUnlistedFiles(unlisted.items);
        };
        main();
        return () => {
            unsubscribed = true;
        };
    }, [myAuth.uid, forceReloadUnlistedListKey, config]);

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
                        <FirebaseUploader storageType={unlisted} authUser={myAuth} onUploaded={() => {
                            setForceReloadUnlistedListKey(oldValue => oldValue + 1);
                        }} />
                        <FirebaseFilesList files={unlistedFiles} onFlieOpen={onFirebaseFileOpen} storageType="unlisted" />
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
                        <FirebaseUploader storageType={$public} authUser={myAuth} onUploaded={() => {
                            setForceReloadPublicListKey(oldValue => oldValue + 1);
                        }} />
                        <FirebaseFilesList files={publicFiles} onFlieOpen={onFirebaseFileOpen} storageType="public" />
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
                    <FirebaseFilesManager myAuth={myAuth} onFlieOpen={onFileOpen} />
                </Tabs.TabPane>
            </Tabs>
        );
    })();

    return (
        <ForceReloadPublicListKeyContext.Provider value={forceReloadPublicListKey}>
            <SetForceReloadPublicListKeyContext.Provider value={setForceReloadPublicListKey}>
                <ForceReloadUnlistedListKeyContext.Provider value={forceReloadUnlistedListKey}>
                    <SetForceReloadUnlistedListKeyContext.Provider value={setForceReloadUnlistedListKey}>
                        <Drawer
                            closable
                            visible={drawerType != null}
                            onClose={() => onClose()}
                            width={600}
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