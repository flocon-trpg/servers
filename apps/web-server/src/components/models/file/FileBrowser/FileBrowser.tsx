/** @jsxImportSource @emotion/react */
import {
    flex,
    flexColumn,
    flexRow,
    itemsCenter,
    justifyItemsCenter,
    justifySelfCenter,
    selfCenter,
} from '@/styles/className';
import classNames from 'classnames';
import * as Icons from '@ant-design/icons';
import React from 'react';
import { css } from '@emotion/react';
import {
    Alert,
    Breadcrumb,
    Button,
    Checkbox,
    Dropdown,
    Input,
    InputRef,
    Menu,
    Modal,
    Select,
    Tooltip,
    notification,
} from 'antd';
import { VirtuosoGrid } from 'react-virtuoso';
import styled from '@emotion/styled';
import {
    DeletableTree,
    MultiKeyMap,
    MultiValueSet,
    both,
    groupJoinArray,
    keyNames,
    left,
    right,
} from '@flocon-trpg/utils';
import { Provider, atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import produce from 'immer';
import { DialogFooter } from '@/components/ui/DialogFooter/DialogFooter';
import { useLatest } from 'react-use';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { Option } from '@kizahasi/option';
import { joinPath, sanitizeFoldername } from '@flocon-trpg/core';
import { mergeStyles } from '@/utils/mergeStyles';

export const image = 'image';
export const sound = 'sound';
export const text = 'text';
export const others = 'others';
const file = 'file';
const folder = 'folder';
const virtualFolder = 'virtualFolder';

const none = '__none__';

const columnGap = '4px 0';

type FilePathBase = {
    key: string;

    /** ファイルのフィルター設定で用いる識別子を表します。フィルター設定を使わない場合は undefined を渡してください。*/
    fileType?: string;

    /** 画像のサムネイルを表します。省略した場合はiconが代わりに表示されます。 */
    thumb?: React.ReactNode;

    /** ファイルのアイコンを表します。thumbが指定されている場合はそちらが優先されます。 */
    icon?: typeof image | typeof sound | typeof text | typeof others;

    /** ユーザーがファイルを選択したときの動作を示します（ただし、複数選択モードが有効になっているときに選択されたときは除きます）。コンテキストメニューから選択しようとしたときもトリガーされます。undefined の場合は、コンテキストメニューからの選択は非表示になります。 */
    onSelect?: () => void;

    /** ユーザーがファイルそのものを閲覧しようとしたときの動作を示します。 */
    onOpen?: () => void;

    onDelete?: () => Promise<void>;

    onClipboard?: () => void;
};

export type FilePath = FilePathBase & {
    /** ファイルのパスを表します。`''`である要素は存在しないものとして扱われます。
     *
     * このコンポーネントにおいて、どのようなファイル名で表示されてほしいか、どのようなフォルダに入っていてほしいかを表す値であるため、必ずしも実際のパスと等しくする必要はありません。
     *
     * @example ['foo.png'], ['alpha', 'beta', 'gamma.mp3']
     */
    path: readonly string[];
};

export type FileTypes = {
    /** 使用可能なフィルターを設定します。 */
    fileTypes: readonly {
        /** これとFilePathBase.fileTypeが等しいファイルをフィルターの対象にします。 */
        fileType: string;

        /** UIに表示されるフィルターの名前です。 */
        name: string;
    }[];

    /** null以外の値を渡した場合、デフォルトで選択されるフィルターのfileTypeを指定できます。null以外の値を渡した場合でも、ユーザーはフィルターを変更することができます。 */
    defaultFileTypeFilter: string | null;
};

type IsLocked = (absolutePath: readonly string[]) => boolean;

type EnsuredFolderPath = {
    /** ファイルのパスを表します。`''`である要素は存在しないものとして扱われます。 */
    path: readonly string[];

    /** このフォルダの上部に追加で表示するコンポーネントを指定できます。 */
    header?: React.ReactNode;
};

const defaultHeight = 350;

export type Props = {
    files: readonly FilePath[];

    // VirtuosoGridの仕様により、heightを指定しないと表示されない。指定しない場合はdefaultHeightが使われる
    height: number | null;

    style?: React.CSSProperties;
    fileTypes?: FileTypes;

    /** ファイルの削除処理が完了したときにトリガーされます。複数のファイルが削除されるときは、最後のファイルが削除されたときにトリガーされます。 */
    onDelete?: () => void;

    /** trueが返されたファイルパスでは、ファイルおよびフォルダの作成と削除ができなくなり、複数選択モードが無効化されます。 */
    isLocked: IsLocked;

    onFileCreate: (absolutePath: readonly string[]) => void;

    /** ファイルの有無にかかわらず、常に表示するフォルダを指定できます。 */
    ensuredFolderPaths: readonly EnsuredFolderPath[];
};

type FilePathNode = FilePathBase & {
    type: typeof file;

    /** FilePath.path から `''` の要素を取り除いたものと等しい。*/
    absolutePathSource: readonly string[];

    /** ファイルがあるパス。ファイル名の部分は含まない。*/
    absolutePath: readonly string[];

    /** ファイル名。 */
    name: string;
};

type FolderMap = MultiKeyMap<
    string,
    {
        files: readonly FilePathNode[];
    }
>;

type Folder = {
    type: typeof folder;
    multiKeyMap: FolderMap;
    key: string;
    name: string;
};

/** 仮想的なフォルダ。FilePathBase.pathのみでは空のフォルダが扱えないため、これによって表現されます。存在しないフォルダにファイルを新規作成するために、ユーザーによって作成された仮のフォルダなどの用途で利用されます。*/
type VirtualFolder = {
    type: typeof virtualFolder;

    /** フォルダがあるパス。フォルダ名の部分は含まない。*/
    absolutePath: readonly string[];

    /** フォルダ名。*/
    name: string;
};

type VirtualFolderNode = VirtualFolder & {
    key: string;
    header: React.ReactNode | undefined;
};

type Node = FilePathNode | Folder | VirtualFolderNode;

const useCreateNodes = () => {
    const virtualFolders = useAtomValue(virtualFoldersAtom);
    const rootFolder = useAtomValue(rootFolderAtom);
    const currentDirectory = useAtomValue(currentDirectoryAtom);

    return React.useMemo(() => {
        let currentFolderMap: FolderMap = rootFolder;
        for (const dir of currentDirectory) {
            // これがないと、vitrualFolderを開いたときにFolderMapにもvirtualFolderと同じフォルダが追加されてしまう。
            if (currentFolderMap.get([dir]) === undefined) {
                return [];
            }

            currentFolderMap = currentFolderMap.createSubMap([dir]);
        }
        if (currentFolderMap == null) {
            return [];
        }

        const fileNodes = currentFolderMap.get([])?.files ?? [];
        const folderNodes = [...currentFolderMap.getChildren()].map(([, $folder]) => {
            const key = $folder.absolutePath.reduce(
                (seed, elem) => `${seed}/${elem}`,
                'FileBrowser@Folder/'
            );
            const name = $folder.absolutePath[$folder.absolutePath.length - 1] ?? '';
            return {
                type: folder,
                multiKeyMap: $folder,
                key,
                name,
                absolutePath: $folder.absolutePath,
            } as const;
        });
        const virtualFolderNodes: VirtualFolderNode[] = [
            ...virtualFolders.createSubTree(currentDirectory, () => ({})).getChildren(),
        ].flatMap(([name, $folder]) => {
            const equals = <T,>(x: readonly T[], y: readonly T[]): boolean => {
                return groupJoinArray(x, y).every(elem => {
                    if (elem.type !== both) {
                        return false;
                    }
                    return elem.left === elem.right;
                });
            };

            if (folderNodes.some(f => equals(f.absolutePath, $folder.absolutePath))) {
                return [];
            }

            const key = $folder.absolutePath.reduce(
                (seed, elem) => `${seed}/${elem}`,
                'FileBrowser@VirtualFolder/'
            );
            return [
                {
                    type: virtualFolder,
                    absolutePath: $folder.absolutePath,
                    key,
                    name,
                    header: $folder.value.value?.header,
                } as const,
            ];
        });

        const nodes: Node[] = [...fileNodes, ...folderNodes, ...virtualFolderNodes];
        nodes.sort((x, y) => {
            if (x.type === folder || x.type === virtualFolder) {
                if (y.type === folder || y.type === virtualFolder) {
                    return x.name.localeCompare(y.name);
                }
                return -1;
            }
            if (y.type === folder || y.type === virtualFolder) {
                return 1;
            }

            return x.name.localeCompare(y.name);
        });
        return nodes;
    }, [currentDirectory, rootFolder, virtualFolders]);
};

type DeleteStatus =
    | {
          type: 'none';
      }
    | {
          type: 'asking' | 'deleting' | 'aborted' | 'finished';
          files: readonly FileToDelete[];
      };

// 要素はabsolute path
const selectedFilesAtom = atom(new MultiValueSet<string>());
const useToggleSelectedFile = () => {
    const setSelectedFiles = useSetAtom(selectedFilesAtom);
    return React.useCallback(
        (absolutePath: readonly string[]) => {
            setSelectedFiles(oldValue => {
                const newValue = oldValue.clone();
                if (oldValue.has(absolutePath)) {
                    newValue.delete(absolutePath);
                } else {
                    newValue.add(absolutePath);
                }
                return newValue;
            });
        },
        [setSelectedFiles]
    );
};

// 要素はabsolute path
const selectedFoldersAtom = atom(new MultiValueSet<string>());
const useToggleSelectedFolder = () => {
    const setSelectedFolders = useSetAtom(selectedFoldersAtom);
    return React.useCallback(
        (absolutePath: readonly string[]) => {
            setSelectedFolders(oldValue => {
                const newValue = oldValue.clone();
                if (oldValue.has(absolutePath)) {
                    newValue.delete(absolutePath);
                } else {
                    newValue.add(absolutePath);
                }
                return newValue;
            });
        },
        [setSelectedFolders]
    );
};

const currentDirectoryAtomCore = atom<readonly string[]>([]);
/** 現在表示しているディレクトリを表します。 */
const currentDirectoryAtom = atom(
    get => get(currentDirectoryAtomCore),
    (get, set, update: (oldValue: readonly string[]) => readonly string[]) => {
        const oldValue = get(currentDirectoryAtomCore);
        const newValue = update(oldValue);
        set(currentDirectoryAtomCore, newValue);
        set(isMultipleSelectModeAtom, false);
        set(selectedFilesAtom, new MultiValueSet());
        set(selectedFoldersAtom, new MultiValueSet());
    }
);
const propsAtom = atom<Props | null>(null);
const isLockedValueAtom = atom(get => {
    const isLocked = get(propsAtom)?.isLocked;
    if (isLocked == null) {
        return false;
    }
    const currentDirectory = get(currentDirectoryAtom);
    return isLocked(currentDirectory);
});
const isMultipleSelectModeAtom = atom(false);
const rootFolderAtom = atom<FolderMap>(new MultiKeyMap<string, { files: FilePathNode[] }>());
const deleteStatusAtom = atom<DeleteStatus>({ type: 'none' });
const fileTypeFilterAtom = atom<string | null>(null);
const fileNameFilterAtom = atom<string>('');
/** ユーザーが作成したVirtualFolderの一覧を表します。 */
const tempVirtualFoldersAtom = atom(new DeletableTree<string, undefined>(Option.some(undefined)));
const useAddTempVirtualFolder = () => {
    const setVirtualFolders = useSetAtom(tempVirtualFoldersAtom);
    return React.useCallback(
        (newValue: VirtualFolder) => {
            setVirtualFolders(oldValue => {
                const result = oldValue.map(x => x.value);
                result.ensure(
                    [...newValue.absolutePath, newValue.name],
                    () => undefined,
                    () => undefined
                );
                return result;
            });
        },
        [setVirtualFolders]
    );
};
const ensuredVirtualFoldersAtom = atom(
    new DeletableTree<string, Omit<EnsuredFolderPath, 'path'>>(Option.some({}))
);
const virtualFoldersAtom = atom(get => {
    const tempVirtualFolders = get(tempVirtualFoldersAtom);
    const ensuredVirtualFolders = get(ensuredVirtualFoldersAtom);
    const result = new DeletableTree<string, Omit<EnsuredFolderPath, 'path'>>();
    for (const elem of tempVirtualFolders.traverse()) {
        result.ensure(
            elem.absolutePath,
            () => ({}),
            () => ({})
        );
    }
    for (const elem of ensuredVirtualFolders.traverse()) {
        result.ensure(
            elem.absolutePath,
            () => elem.value,
            () => ({})
        );
    }
    return result;
});
const isDeleteModalVisibleAtom = atom(false);

const useIsSelected = (node: Node): boolean => {
    const selectedFiles = useAtomValue(selectedFilesAtom);
    const selectedFolders = useAtomValue(selectedFoldersAtom);
    return React.useMemo(() => {
        if (node.type === folder) {
            return selectedFolders.has(node.multiKeyMap.absolutePath);
        }
        return selectedFiles.has(node.absolutePath);
    }, [node, selectedFiles, selectedFolders]);
};

const useRequestDeleteFiles = () => {
    const rootFolder = useAtomValue(rootFolderAtom);
    const [deleteStatus, setDeleteStatus] = useAtom(deleteStatusAtom);
    const setIsModalVisible = useSetAtom(isDeleteModalVisibleAtom);

    return React.useCallback(
        ({
            files: selectedFiles,
            folders: selectedFolders,
        }: {
            files: readonly { absolutePath: readonly string[] }[];
            folders: readonly { absolutePath: readonly string[] }[];
        }) => {
            if (deleteStatus.type === 'deleting') {
                notification.warn({
                    placement: 'bottomRight',
                    message:
                        '現在行われている削除が全て完了するまで、他のファイルを削除することはできません。',
                });
                setIsModalVisible(true);
                return;
            }

            const files = new Set<FilePathNode>();

            for (const selectedFile of selectedFiles) {
                const directoryPath = [...selectedFile.absolutePath];
                const filename = directoryPath.pop();
                if (filename == null) {
                    continue;
                }
                rootFolder.get(directoryPath)?.files.forEach(file => {
                    if (file.name === filename) {
                        files.add(file);
                    }
                });
            }

            for (const selectedFolder of selectedFolders) {
                for (const { value } of rootFolder
                    .createSubMap(selectedFolder.absolutePath)
                    .traverse()) {
                    value.files.forEach(file => files.add(file));
                }
            }

            if (files.size === 0) {
                notification.info({
                    placement: 'bottomRight',
                    message: 'ファイルが選択されていないか、全て存在しません。',
                });
                return;
            }
            const filesToDelete = toFilesToDelete([...files]);
            setDeleteStatus(() => ({ type: 'asking', files: filesToDelete }));
            setIsModalVisible(true);
        },
        [deleteStatus.type, rootFolder, setDeleteStatus, setIsModalVisible]
    );
};

const useRequestDeleteSelectedFiles = () => {
    const selectedFiles = useAtomValue(selectedFilesAtom);
    const selectedFolders = useAtomValue(selectedFoldersAtom);
    const confirmDelete = useRequestDeleteFiles();

    return React.useCallback(() => {
        const $selectedFiles = [...selectedFiles.toIterator()].map(absolutePath => ({
            absolutePath,
        }));
        const $selectedFolders = [...selectedFolders.toIterator()].map(absolutePath => ({
            absolutePath,
        }));
        return confirmDelete({
            files: $selectedFiles,
            folders: $selectedFolders,
        });
    }, [confirmDelete, selectedFiles, selectedFolders]);
};

const FileTypeFilterSelect = () => {
    const fileTypes = useAtomSelector(propsAtom, props => props?.fileTypes);
    const [fileTypeFilter, setFileTypeFilter] = useAtom(fileTypeFilterAtom);

    if (fileTypes == null) {
        return null;
    }

    const options = fileTypes.fileTypes.map(fileType => (
        <Select.Option key={fileType.fileType} value={fileType.fileType}>
            {fileType.name}
        </Select.Option>
    ));

    const fileTypeFilterValue = fileTypeFilter ?? none;
    return (
        <Select
            style={{ width: 120 }}
            value={fileTypeFilterValue}
            onChange={newValue => {
                if (newValue === none) {
                    setFileTypeFilter(null);
                    return;
                }
                setFileTypeFilter(newValue);
            }}
        >
            <Select.Option value={none}>全てのファイル</Select.Option>
            {options}
        </Select>
    );
};

const AddressBar: React.FC = () => {
    const [currentDirectory, setCurrentDirectory] = useAtom(currentDirectoryAtom);
    const [fileNameFilter, setFileNameFilter] = useAtom(fileNameFilterAtom);

    const breadcrumbItems = currentDirectory.map(dir => (
        <Breadcrumb.Item key={keyNames('FileBrowser', 'AddressBar', 'Breadcrumb', dir)}>
            {dir}
        </Breadcrumb.Item>
    ));

    return (
        <div className={classNames(flex, flexRow, itemsCenter)}>
            <Button
                size='small'
                disabled={currentDirectory.length === 0}
                onClick={() =>
                    setCurrentDirectory(oldValue => {
                        const newValue = [...oldValue];
                        newValue.pop();
                        return newValue;
                    })
                }
            >
                <Icons.ArrowUpOutlined />
            </Button>
            <Breadcrumb style={{ paddingLeft: 4 }}>
                <Breadcrumb.Item>{'(ルート)'}</Breadcrumb.Item>
                {breadcrumbItems}
            </Breadcrumb>
            <div style={{ flex: 1 }} />
            <FileTypeFilterSelect />
            <Input
                style={{ width: 240 }}
                value={fileNameFilter}
                placeholder='ファイル名で検索'
                onChange={e => setFileNameFilter(e.target.value)}
            />
        </div>
    );
};

type FileToDelete = {
    status: 'waiting' | 'deleting' | 'deleted' | 'error';
    file: FilePathNode;
};

const toFilesToDelete = (source: readonly FilePathNode[]): readonly FileToDelete[] => {
    return source
        .map(file => ({ status: 'waiting', file } as const))
        .sort((x, y) => {
            for (const group of groupJoinArray(
                x.file.absolutePathSource,
                y.file.absolutePathSource
            )) {
                switch (group.type) {
                    case left:
                        return 1;
                    case right:
                        return -1;
                    case both: {
                        const compareResult = group.left.localeCompare(group.right);
                        if (compareResult !== 0) {
                            return compareResult;
                        }
                    }
                }
            }
            return 0;
        });
};

const FilesToDeleteTable: React.FC<{
    items: readonly FileToDelete[];
    style?: React.CSSProperties;
}> = ({ items, style }) => {
    return (
        <div className={classNames(flex, flexColumn)} style={style}>
            {items.map(item => (
                <div key={item.file.key} className={classNames(flex, flexRow)}>
                    <div style={{ width: 20 }}>
                        {item.status === 'deleted' ? (
                            <Icons.CheckOutlined />
                        ) : item.status === 'deleting' ? (
                            <Icons.LoadingOutlined />
                        ) : item.status === 'error' ? (
                            <Icons.WarningOutlined />
                        ) : null}
                    </div>
                    <div>{joinPath(item.file.absolutePathSource).string}</div>
                </div>
            ))}
        </div>
    );
};

const DeleteConfirmModal = () => {
    const [isModalVisible, setIsModalVisible] = useAtom(isDeleteModalVisibleAtom);
    const [deleteStatus, setDeleteStatus] = useAtom(deleteStatusAtom);

    let message: string;
    let button: JSX.Element;
    switch (deleteStatus.type) {
        case 'none':
        case 'finished':
            message = '削除が完了しました。';
            break;
        case 'asking':
            message =
                deleteStatus.files.length === 0
                    ? 'ファイルが選択されていません。'
                    : `次の${deleteStatus.files.length}個のファイルを削除しますか？`;
            break;
        case 'deleting':
            message = 'ファイルを削除中です…';
            break;
        case 'aborted':
            message = '削除がキャンセルされました。';
            break;
    }
    const buttonStyle: React.CSSProperties = {
        width: 100,
    };
    switch (deleteStatus.type) {
        case 'none':
        case 'finished':
            button = (
                <Button style={buttonStyle} type='primary' danger disabled>
                    削除
                </Button>
            );
            break;
        case 'asking':
        case 'aborted':
            button = (
                <Button
                    style={buttonStyle}
                    type='primary'
                    danger
                    disabled={deleteStatus.files.length === 0}
                    onClick={() => {
                        setDeleteStatus(() => ({
                            type: 'deleting',
                            files: deleteStatus.files,
                        }));
                    }}
                >
                    {deleteStatus.type === 'aborted' ? '削除を再開' : '削除'}
                </Button>
            );
            break;
        case 'deleting':
            button = (
                <Button
                    style={buttonStyle}
                    onClick={() => {
                        setDeleteStatus(() => ({ type: 'aborted', files: deleteStatus.files }));
                    }}
                >
                    キャンセル
                </Button>
            );
            break;
    }

    const canClose = deleteStatus.type !== 'deleting';
    const onClose = () => {
        switch (deleteStatus.type) {
            case 'deleting':
                return;
            default:
                break;
        }
        setDeleteStatus(() => ({ type: 'none' }));
        setIsModalVisible(false);
    };
    return (
        <Modal
            visible={isModalVisible}
            footer={
                <DialogFooter
                    close={{ textType: 'close', onClick: onClose, disabled: !canClose }}
                    custom={button}
                />
            }
            onCancel={onClose}
            closable={canClose}
        >
            <div className={classNames(flex, flexColumn)} style={{ gap: '4px 0' }}>
                <div>{message}</div>
                <FilesToDeleteTable
                    items={deleteStatus.type === 'none' ? [] : deleteStatus.files}
                    style={{ height: 200, overflowY: 'auto' }}
                />
            </div>
        </Modal>
    );
};

const ModalToCreateFolder: React.FC<{ visible: boolean; onClose: () => void }> = ({
    visible,
    onClose,
}) => {
    const currentDirectory = useAtomValue(currentDirectoryAtom);
    const [folderName, setFolderName] = React.useState('');
    const addVirtualFolder = useAddTempVirtualFolder();
    const isFolderNameInvalid = sanitizeFoldername(folderName) !== folderName;
    const inputRef = React.useRef<InputRef | null>(null);

    React.useEffect(() => {
        if (visible) {
            inputRef.current?.focus();
        }
    }, [visible]);

    const onOk = () => {
        if (isFolderNameInvalid) {
            return;
        }
        addVirtualFolder({
            type: virtualFolder,
            absolutePath: currentDirectory,
            name: folderName,
        });
        setFolderName('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            title='新しいフォルダの作成'
            onCancel={onClose}
            footer={
                <DialogFooter
                    ok={{
                        textType: 'create',
                        disabled: isFolderNameInvalid,
                        onClick: () => {
                            onOk();
                        },
                    }}
                    close={{ textType: 'cancel', onClick: onClose }}
                />
            }
        >
            <div className={classNames(flex, flexColumn)} style={{ gap: 4 }}>
                <Input
                    ref={inputRef}
                    placeholder='フォルダ名'
                    value={folderName}
                    onChange={e => setFolderName(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            onOk();
                        }
                    }}
                />
                <div>空のフォルダは後で自動的に消去されます。</div>
                {isFolderNameInvalid && (
                    <Alert
                        type='error'
                        showIcon
                        message='無効なフォルダ名です。フォルダ名が長すぎないか、半角スラッシュが含まれていないか確認してください。'
                    />
                )}
            </div>
        </Modal>
    );
};

const ActionBar: React.FC = () => {
    const [isMultipleSelectMode, setIsMultipleSelectMode] = useAtom(isMultipleSelectModeAtom);
    const setSelectedFiles = useSetAtom(selectedFilesAtom);
    const setSelectedFolders = useSetAtom(selectedFoldersAtom);
    const requestDeleteSelectedFiles = useRequestDeleteSelectedFiles();
    const currentDirectory = useAtomValue(currentDirectoryAtom);
    const isLockedValue = useAtomValue(isLockedValueAtom);
    const onFileCreate = useAtomSelector(propsAtom, props => props?.onFileCreate);
    const [isModalToCreateFolderVisible, setIsModalToCreateFolderVisible] = React.useState(false);

    const rowGap = '0 4px';

    return (
        <div className={classNames(flex, flexColumn)} style={{ gap: columnGap }}>
            <div className={classNames(flex, flexRow, itemsCenter)} style={{ gap: rowGap }}>
                <Tooltip
                    overlay={
                        isLockedValue
                            ? 'このフォルダにおけるファイルの作成は無効化されています。'
                            : undefined
                    }
                >
                    <Button
                        disabled={isLockedValue}
                        onClick={() => {
                            if (isLockedValue) {
                                return;
                            }
                            if (onFileCreate == null) {
                                return;
                            }
                            onFileCreate(currentDirectory);
                        }}
                    >
                        ファイルを作成
                    </Button>
                </Tooltip>
                <Tooltip
                    overlay={
                        isLockedValue
                            ? 'このフォルダにおけるフォルダの作成は無効化されています。'
                            : undefined
                    }
                >
                    <Button
                        disabled={isLockedValue}
                        onClick={() => {
                            if (isLockedValue) {
                                return;
                            }
                            setIsModalToCreateFolderVisible(true);
                        }}
                    >
                        フォルダを作成
                    </Button>
                </Tooltip>
            </div>
            <div
                className={classNames(flex, flexRow, itemsCenter)}
                style={{
                    height: 32,
                    gap: rowGap,
                }}
            >
                <Tooltip
                    overlay={
                        isLockedValue
                            ? 'このフォルダでは複数選択モードは無効化されています。'
                            : undefined
                    }
                >
                    <Checkbox
                        disabled={isLockedValue}
                        checked={isMultipleSelectMode}
                        onClick={() => setIsMultipleSelectMode(prevValue => !prevValue)}
                    >
                        複数選択モード
                    </Checkbox>
                </Tooltip>
                {isMultipleSelectMode && (
                    <Button
                        onClick={() => {
                            setSelectedFiles(new MultiValueSet());
                            setSelectedFolders(new MultiValueSet());
                        }}
                    >
                        選択を全て解除
                    </Button>
                )}
                {isMultipleSelectMode && (
                    <Button onClick={() => requestDeleteSelectedFiles()}>
                        選択されたファイルを全て削除
                    </Button>
                )}
                <ModalToCreateFolder
                    visible={isModalToCreateFolderVisible}
                    onClose={() => setIsModalToCreateFolderVisible(false)}
                />
            </div>
        </div>
    );
};

const cellFileStyle: React.CSSProperties = {
    maxWidth: 80,
    height: 60,
    maxHeight: 70,
    padding: 6,
};

const CellFile: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div
            className={classNames(
                selfCenter,
                justifySelfCenter,
                flex,
                itemsCenter,
                justifyItemsCenter
            )}
            style={cellFileStyle}
        >
            {children}
        </div>
    );
};

// :hoverのborder-colorはantdのチェックボックスの青色と同じ
const cellElementCss = css`
    position: relative;
    width: 100px;
    height: 100px;
    color: white;
    cursor: pointer;
    user-select: none;
    margin: 2px;
    padding: 2px;
    border-style: solid;
    border-color: rgba(122, 122, 122, 0.5);
    border-width: 1px;
    transition: all 0.3s;

    :hover {
        border-color: rgba(23, 125, 220, 1);
    }
`;

const NodeView: React.FC<{
    node: Node;
}> = ({ node }) => {
    const isSelectMode = useAtomValue(isMultipleSelectModeAtom);
    const [currentDirectory, setCurrentDirectory] = useAtom(currentDirectoryAtom);
    const setVirtualFolders = useSetAtom(tempVirtualFoldersAtom);
    const toggleSelectedFile = useToggleSelectedFile();
    const toggleSelectedFolder = useToggleSelectedFolder();
    const isSelected = useIsSelected(node);
    const requestDeleteFiles = useRequestDeleteFiles();

    const size = 40;
    let fileElement: React.ReactNode;
    switch (node.type) {
        case virtualFolder:
            // TODO: アイコンを点線にするとよりわかりやすい
            fileElement = (
                <CellFile>
                    <Icons.FolderOutlined style={{ fontSize: size, opacity: 0.5 }} />
                </CellFile>
            );
            break;
        case folder: {
            fileElement = (
                <CellFile>
                    <Icons.FolderOutlined style={{ fontSize: size }} />
                </CellFile>
            );
            break;
        }
        case file: {
            if (node.thumb != null && node.thumb !== true && node.thumb !== false) {
                fileElement = <CellFile>{node.thumb}</CellFile>;
                break;
            }
            switch (node.icon) {
                case sound:
                    fileElement = (
                        <CellFile>
                            <div style={{ position: 'relative', width: 40, height: 40 }}>
                                <Icons.FileOutlined
                                    style={{ fontSize: size, position: 'absolute' }}
                                />
                                <Icons.SoundOutlined
                                    style={{
                                        fontSize: 20,
                                        position: 'absolute',
                                        left: 10,
                                        top: 15,
                                    }}
                                />
                            </div>
                        </CellFile>
                    );
                    break;
                case image:
                    fileElement = (
                        <CellFile>
                            <Icons.FileImageOutlined style={{ fontSize: size }} />
                        </CellFile>
                    );
                    break;
                case text:
                    fileElement = (
                        <CellFile>
                            <Icons.FileTextOutlined style={{ fontSize: size }} />
                        </CellFile>
                    );
                    break;
                default:
                    fileElement = (
                        <CellFile>
                            <Icons.FileUnknownOutlined style={{ fontSize: size }} />
                        </CellFile>
                    );
                    break;
            }
        }
    }

    const onSelect = (() => {
        if (isSelectMode) {
            if (node.type === virtualFolder) {
                return () => toggleSelectedFolder(node.absolutePath);
            }
            if (node.type === folder) {
                return () => toggleSelectedFolder(node.multiKeyMap.absolutePath);
            }
            return () => toggleSelectedFile(node.absolutePath);
        }

        if (node.type === folder || node.type === virtualFolder) {
            return () =>
                setCurrentDirectory(oldValue => {
                    const newValue = [...oldValue];
                    newValue.push(node.name);
                    return newValue;
                });
        }

        if (node.onSelect == null) {
            return node.onOpen;
        }
        return node.onSelect;
    })();

    const createMenuKey = (key: string | number) => keyNames('FileBrowser', 'CellElement', key);
    const menu = (
        <Menu
            items={[
                onSelect == null
                    ? null
                    : {
                          key: createMenuKey(1),
                          label: '選択',
                          onClick: onSelect,
                      },
                node.type === folder || node.type === virtualFolder || node.onOpen == null
                    ? null
                    : {
                          key: createMenuKey(2),
                          label: 'ファイルを開く',
                          onClick: node.onOpen,
                      },
                node.type === folder || node.type === virtualFolder || node.onClipboard == null
                    ? null
                    : {
                          key: createMenuKey(3),
                          label: 'コマンドに使用するリンクとしてクリップボードにコピー',
                          onClick: node.onClipboard,
                      },
                {
                    key: createMenuKey(4),
                    label: '削除',
                    onClick: () => {
                        {
                            if (node.type === virtualFolder) {
                                setVirtualFolders(oldValue => {
                                    const newValue = oldValue.map(x => x.value);
                                    newValue.delete(currentDirectory);
                                    return newValue;
                                });
                                return;
                            }
                            if (node.type === folder) {
                                requestDeleteFiles({
                                    files: [],
                                    folders: [{ absolutePath: node.multiKeyMap.absolutePath }],
                                });
                                return;
                            }
                            requestDeleteFiles({
                                files: [{ absolutePath: node.absolutePath }],
                                folders: [],
                            });
                        }
                    },
                },
            ]}
        />
    );

    return (
        <Dropdown overlay={menu} trigger={['contextMenu']}>
            <div
                className={classNames(flex, flexColumn)}
                css={cellElementCss}
                tabIndex={0}
                onClick={() => onSelect && onSelect()}
                onKeyDown={e => {
                    if (e.code === 'Space') {
                        onSelect && onSelect();
                    }
                }}
            >
                {isSelectMode && node.type !== virtualFolder && (
                    <Checkbox
                        style={{ position: 'absolute', left: 2, top: 0 }}
                        tabIndex={-1}
                        checked={isSelected}
                    />
                )}
                {fileElement}
                <div
                    style={{
                        textAlign: 'center',
                        lineHeight: '1.333333',
                        overflow: 'hidden',
                        height: 30,
                        textOverflow: 'ellipsis',
                    }}
                >
                    {node.name}
                </div>
            </div>
        </Dropdown>
    );
};

const ListContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
`;

const NodesGrid: React.FC = () => {
    const nodes = useCreateNodes();
    const ensuredVirtualFolders = useAtomValue(ensuredVirtualFoldersAtom);
    const currentDirectory = useAtomValue(currentDirectoryAtom);
    const ensuredVirtualFolder = ensuredVirtualFolders.get(currentDirectory);
    const fileTypeFilter = useAtomValue(fileTypeFilterAtom);
    const fileNameFilter = useAtomValue(fileNameFilterAtom);
    const filteredNodes = React.useMemo(() => {
        return nodes.filter(node => {
            if (fileTypeFilter != null && node.type === file && node.fileType !== fileTypeFilter) {
                return false;
            }

            if (fileNameFilter !== '' && node.name.indexOf(fileNameFilter) < 0) {
                return false;
            }
            return true;
        });
    }, [fileNameFilter, fileTypeFilter, nodes]);

    const header: React.ReactNode = ensuredVirtualFolder.isNone
        ? undefined
        : ensuredVirtualFolder.value.header;

    let main: JSX.Element;
    if (nodes.length === 0) {
        main = (
            <div style={{ padding: 4, fontSize: '1.3rem' }}>
                このフォルダにはフォルダおよびファイルがありません。
            </div>
        );
    } else if (filteredNodes.length === 0) {
        main = (
            <div style={{ padding: 4, fontSize: '1.3rem' }}>
                フォルダおよび条件にマッチするファイルがありません。
            </div>
        );
    } else {
        main = (
            <VirtuosoGrid
                totalCount={filteredNodes.length}
                components={{
                    List: ListContainer as any,
                }}
                itemContent={index => <NodeView node={filteredNodes[index]!} />}
                computeItemKey={index => filteredNodes[index]!.key}
            />
        );
    }

    return (
        <div className={classNames(flex, flexColumn)} style={{ gap: '16px', height: '100%' }}>
            {header}
            {main}
        </div>
    );
};

const useStartAutoDeleteFiles = () => {
    const onDelete = useAtomSelector(propsAtom, props => props?.onDelete);
    const onDeleteRef = useLatest(onDelete);
    const [deleteStatus, setDeleteStatus] = useAtom(deleteStatusAtom);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [hasDeleted, setHasDeleted] = React.useState(false);
    const deleteStatusFiles = deleteStatus.type === 'none' ? undefined : deleteStatus.files;
    const deleteStatusFilesRef = useLatest(deleteStatusFiles);

    React.useEffect(() => {
        if (isDeleting) {
            return;
        }
        if (deleteStatus.type !== 'deleting') {
            if (hasDeleted) {
                onDeleteRef.current && onDeleteRef.current();
                setHasDeleted(false);
            }
            return;
        }
        const fileToDelete = deleteStatusFilesRef.current?.find(file => file.status === 'waiting');
        if (fileToDelete == null) {
            setDeleteStatus(oldValue => {
                return {
                    type: 'finished',
                    files: oldValue.type === 'none' ? [] : oldValue.files,
                };
            });
            notification.info({
                placement: 'bottomRight',
                message: 'ファイルの削除が完了しました。',
            });
            return;
        }

        const setFileStatus = (file: FileToDelete, newValue: FileToDelete['status']) => {
            setDeleteStatus(oldValue => {
                if (oldValue.type === 'none') {
                    return oldValue;
                }
                const index = oldValue.files.findIndex(
                    oldFile => oldFile.file.key === file.file.key
                );
                if (index < 0) {
                    return oldValue;
                }
                return produce(oldValue, oldValue => {
                    oldValue.files[index]!.status = newValue;
                });
            });
        };

        setIsDeleting(true);
        setFileStatus(fileToDelete, 'deleting');
        const onDelete = () => {
            if (fileToDelete.file.onDelete == null) {
                return Promise.resolve(undefined);
            }
            return fileToDelete.file.onDelete();
        };
        onDelete()
            .then(() => {
                setFileStatus(fileToDelete, 'deleted');
                setHasDeleted(true);
                setIsDeleting(false);
            })
            .catch(e => {
                notification.error({
                    placement: 'bottomRight',
                    message: 'ファイルの削除に失敗しました。',
                    description: joinPath(fileToDelete.file.absolutePathSource).string,
                });
                console.error('ファイルの削除に失敗しました。', e);
                setFileStatus(fileToDelete, 'error');
                setIsDeleting(false);
            });
    }, [
        deleteStatus.type,
        deleteStatusFilesRef,
        hasDeleted,
        isDeleting,
        onDeleteRef,
        setDeleteStatus,
    ]);
};

const FileBrowserWithoutJotaiProvider: React.FC<Props> = props => {
    useStartAutoDeleteFiles();

    const setProps = useSetAtom(propsAtom);
    React.useEffect(() => {
        setProps(props);
    }, [props, setProps]);

    const defaultFileTypeFilterProp = props.fileTypes?.defaultFileTypeFilter ?? null;
    const setFileFilter = useSetAtom(fileTypeFilterAtom);
    React.useEffect(() => {
        setFileFilter(defaultFileTypeFilterProp);
    }, [defaultFileTypeFilterProp, setFileFilter]);

    const setEnsuredVirtualFolders = useSetAtom(ensuredVirtualFoldersAtom);
    React.useEffect(() => {
        const newState = new DeletableTree<string, Omit<EnsuredFolderPath, 'path'>>();
        for (const path of props.ensuredFolderPaths) {
            newState.ensure(
                joinPath(path.path).array,
                () => path,
                () => ({})
            );
        }
        setEnsuredVirtualFolders(newState);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setEnsuredVirtualFolders, ...props.ensuredFolderPaths]);

    const setRootFolder = useSetAtom(rootFolderAtom);
    const rootFoler: FolderMap = React.useMemo(() => {
        const folder = new MultiKeyMap<
            string,
            {
                files: FilePathNode[];
            }
        >();
        for (const filePath of props.files) {
            const directory = [...filePath.path];
            const filename = directory.pop();
            if (filename == null) {
                throw new Error('This should not happen.');
            }
            const folderNode = folder.ensure(directory, () => ({
                files: [],
            }));
            folderNode.files.push({
                ...filePath,
                type: file,
                name: filename,
                absolutePath: directory,
                absolutePathSource: joinPath(filePath.path).array,
            });
        }
        return folder;
    }, [props.files]);
    React.useEffect(() => {
        setRootFolder(rootFoler);
    }, [rootFoler, setRootFolder]);

    return (
        <div
            className={classNames(flex, flexColumn)}
            style={mergeStyles(
                { gap: columnGap, height: props.height ?? defaultHeight },
                props.style
            )}
        >
            <ActionBar />
            <AddressBar />
            <NodesGrid />
            <DeleteConfirmModal />
        </div>
    );
};

export const FileBrowser: React.FC<Props> = props => {
    return (
        <Provider>
            <FileBrowserWithoutJotaiProvider {...props} />
        </Provider>
    );
};
