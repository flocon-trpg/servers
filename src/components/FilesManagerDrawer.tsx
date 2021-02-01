import * as React from 'react';
import { Button, Drawer, Dropdown, Menu, Modal, Radio, Table, Tabs, Tooltip, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { RcCustomRequestOptions, ShowUploadListInterface } from 'antd/lib/upload/interface';
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
import FirebaseAppNotFound from './alerts/FirebaseAppNotFound';
import ConfigContext from '../contexts/ConfigContext';

type Reference = firebase.default.storage.Reference;

type Column = ColumnGroupType<Reference> | ColumnType<Reference>;

const ForceReloadSharedListKeyContext = React.createContext(0);
const SetForceReloadSharedListKeyContext = React.createContext<React.Dispatch<React.SetStateAction<number>>>(() => undefined);
const ForceReloadUnlistedListKeyContext = React.createContext(0);
const SetForceReloadUnlistedListKeyContext = React.createContext<React.Dispatch<React.SetStateAction<number>>>(() => undefined);

const Path = {
    shared: {
        file: (fileName: string) => `version/1/uploader/shared/${fileName}`,
        list: 'version/1/uploader/shared',
    },
    unlisted: {
        file: (userId: string, fileName: string) => `version/1/uploader/unlisted/${userId}/${fileName}`,
        list: (userId: string) => `version/1/uploader/unlisted/${userId}`
    },
};

const shared = 'shared';
const unlisted = 'unlisted';
type StorageType = typeof shared | typeof unlisted;

type FirebaseUploaderProps = {
    authUser: firebase.default.User;
    onUploaded: () => void;
    storageType: StorageType;
}

const FirebaseUploader: React.FC<FirebaseUploaderProps> = ({ authUser, onUploaded, storageType }: FirebaseUploaderProps) => {
    const config = React.useContext(ConfigContext);

    const webConfig = config.web;
    const accept = 'image/gif,image/jpeg,image/png,audio/mpeg,audio/wav';
    const customRequest = (options: RcCustomRequestOptions) => {
        const storageRef = (() => {
            if (storageType === shared) {
                if (!webConfig.firebase.storage.enableShared) {
                    return null;
                }
                return getStorageForce(config).ref(Path.shared.file(options.file.name));
            }
            if (!webConfig.firebase.storage.enableUnlisted) {
                return null;
            }
            return getStorageForce(config).ref(Path.unlisted.file(authUser.uid, options.file.name));
        })();
        if (storageRef == null) {
            return;
        }
        storageRef.put(options.file).then(() => {
            options.onSuccess({}, options.file);
            onUploaded();
        }).catch(err => {
            if (typeof err === 'string') {
                options.onError(new Error(err));
                return;
            }
            options.onError(err);
        });
    };
    // TODO: antdのUploaderでアップロードが完了したとき、そのログを消すメッセージが「remove file」でアイコンがゴミ箱なのは紛らわしいと思うので直したい。
    // TODO: 同一ファイル名のファイルをアップロードすると上書きされるので、そのときは失敗させるかダイアログを出したほうが親切か。
    return (
        <Upload.Dragger
            accept={accept}
            customRequest={customRequest}
            multiple>
            Click or drag file to this area
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
    const setForceReloadSharedListKey = React.useContext(SetForceReloadSharedListKeyContext);
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
                                    case shared:
                                        setForceReloadSharedListKey(oldValue => oldValue + 1);
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
    const [sharedFiles, setSharedFiles] = React.useState<Reference[]>([]);
    const [unlistedFiles, setUnlistedFiles] = React.useState<Reference[]>([]);
    const forceReloadSharedListKey = React.useContext(ForceReloadSharedListKeyContext);
    const setForceReloadSharedListKey = React.useContext(SetForceReloadSharedListKeyContext);
    const forceReloadUnlistedListKey = React.useContext(ForceReloadUnlistedListKeyContext);
    const setForceReloadUnlistedListKey = React.useContext(SetForceReloadUnlistedListKeyContext);
    const config = React.useContext(ConfigContext);

    React.useEffect(() => {
        let unsubscribed = false;
        const main = async () => {
            if (!config.web.firebase.storage.enableShared) {
                return;
            }
            const shared = await getStorageForce(config).ref(Path.shared.list).listAll();
            if (unsubscribed) {
                return;
            }
            setSharedFiles(shared.items);
        };
        main();
        return () => {
            unsubscribed = true;
        };
    }, [forceReloadSharedListKey, config]); // もしsharedでアクセスできるファイルがUserによって異なるように変更した場合、depsにmyAuth.uidなどを含めるほうがいい。

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

    if (!config.web.firebase.storage.enableShared && !config.web.firebase.storage.enableUnlisted) {
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

    const sharedTabPane: JSX.Element = (() => {
        if (config.web.firebase.storage.enableShared) {
            return (
                <Tabs.TabPane tab="shared" key="storage2">
                    <div>
                        <FirebaseUploader storageType={shared} authUser={myAuth} onUploaded={() => {
                            setForceReloadSharedListKey(oldValue => oldValue + 1);
                        }} />
                        <FirebaseFilesList files={sharedFiles} onFlieOpen={onFirebaseFileOpen} storageType="shared" />
                    </div>
                </Tabs.TabPane>
            );
        }
        return (
            <Tabs.TabPane tab="shared" disabled key="storage2" />
        );
    })();

    return (
        <Tabs>
            {unlistedTabPane}
            {sharedTabPane}
        </Tabs>
    );
};

type Props = {
    drawerType: FilesManagerDrawerType | null;
    onClose: () => void;
}

const FilesManagerDrawer: React.FC<Props> = ({ drawerType, onClose }: Props) => {
    const myAuth = React.useContext(MyAuthContext);
    const [forceReloadSharedListKey, setForceReloadSharedListKey] = React.useState(0);
    const [forceReloadUnlistedListKey, setForceReloadUnlistedListKey] = React.useState(0);

    const child = (() => {
        if (myAuth == null) {
            return (<div>You have to sign in.</div>);
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
        <ForceReloadSharedListKeyContext.Provider value={forceReloadSharedListKey}>
            <SetForceReloadSharedListKeyContext.Provider value={setForceReloadSharedListKey}>
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
            </SetForceReloadSharedListKeyContext.Provider>
        </ForceReloadSharedListKeyContext.Provider>
    );
};

export default FilesManagerDrawer;