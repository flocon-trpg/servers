/** @jsxImportSource @emotion/react */
import * as Icons from '@ant-design/icons';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { joinPath } from '@flocon-trpg/core';
import {
    DeletableTree,
    DualKeyMap,
    MultiKeyMap,
    MultiValueSet,
    Tree,
    arrayEquals,
    both,
    groupJoinArray,
    keyNames,
    left,
    loggerRef,
    right,
} from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import {
    Alert,
    App,
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
} from 'antd';
import { ItemType } from 'antd/lib/menu/interface';
import classNames from 'classnames';
import { produce } from 'immer';
import {
    useAtom as useAtomCore,
    useAtomValue as useAtomValueCore,
    useSetAtom as useSetAtomCore,
} from 'jotai/react';
import { Atom, PrimitiveAtom, atom, createStore, getDefaultStore } from 'jotai/vanilla';
import React from 'react';
import { useDeepCompareEffect, useLatest } from 'react-use';
import { VirtuosoGrid } from 'react-virtuoso';
import { DialogFooter } from '@/components/ui/DialogFooter/DialogFooter';
import { useAtomSelector as useAtomSelectorCore } from '@/hooks/useAtomSelector';
import {
    flex,
    flexColumn,
    flexRow,
    itemsCenter,
    justifyItemsCenter,
    justifySelfCenter,
    selfCenter,
} from '@/styles/className';
import { mergeStyles } from '@/utils/mergeStyles';

export const image = 'image';
export const sound = 'sound';
export const text = 'text';
export const others = 'others';
const file = 'file';
const folder = 'folder';

const none = '__none__';

const columnGap = '4px 0';

const protectedErrorMessage = 'このフォルダでは無効化されています。';

type Store = ReturnType<typeof createStore>;

type Path = {
    path: readonly string[];

    /** ファイルの場合は`FilePathBase.id`と等しい値です。ファイル以外の場合は常にundefinedとなります。 */
    id: string | undefined;
};

type RenameResult = {
    oldPath: readonly string[];

    currentPath: readonly string[];

    /** ファイルの場合は`FilePathBase.id`と等しい値です。ファイル以外の場合は常にundefinedとなります。 */
    id: string | undefined;
};

type NameIdPair = {
    name: string;

    id: string | undefined;
};

/*
# onDeleteとonMoveOrRenameの実装に関して

ファイルの削除およびリネームの処理はPropsではなくFilePathに書く仕様としている。

メリット:
- Propsで書く場合は、FilePathにmetadataなどといった形でFirebaseのStorageReferenceなどを渡し、それを取得する必要がある。このようなmetadataは、atomで管理する都合上、ジェネリックス化することは困難でanyかunknownで管理せざるを得ない(atomを使わずpropsで渡せば回避できるが)。これらの手間が省ける。
- 処理を途中で中断できる。

デメリット:
- 例えば100個のファイルを削除もしくはリネームする場合、1個のファイルを変更するリクエストを100回実行する必要がある。これは特にAPIサーバー内蔵アップローダーにおける懸念点。

デメリットに関しては、大量のファイルを削除もしくはリネームする頻度が比較的少ないと思われることを考えると、operateよりは負荷が小さいと思われるため、許容範囲であると判断した。
*/
type FilePathBase = {
    /** ファイルのフィルター設定で用いる識別子を表します。フィルター設定を使わない場合は undefined を渡してください。*/
    fileType?: string;

    /** 画像のサムネイルを表します。nullishの場合はiconが代わりに表示されます。 */
    thumb?: React.ReactNode;

    /** ファイルのアイコンを表します。thumbが指定されている場合はそちらが優先されます。 */
    icon?: typeof image | typeof sound | typeof text | typeof others;

    /** ユーザーがファイルを選択したときの動作を示します（ただし、複数選択モードが有効になっているときに選択されたときは除きます）。コンテキストメニューから選択しようとしたときもトリガーされます。undefined の場合は、コンテキストメニューからの選択は非表示になります。 */
    onSelect?: () => void;

    /** ユーザーがファイルそのものを閲覧しようとしたときの動作を示します。 */
    onOpen?: () => void;

    onDelete?: () => Promise<void>;

    onClipboard?: () => void;

    onMoveOrRename: (params: {
        currentPath: readonly string[];
        newPath: readonly string[];
    }) => Promise<void>;

    /** パスが完全に重複するファイルが存在する場合は、これで区別する必要があります。*/
    id: string | undefined;
};

export type FilePath = FilePathBase & {
    /** ファイルのパスを表します。`''`である要素は存在しないものとして扱われます。パスが重複するファイルが複数あってはなりません。
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

type IsProtected = (absolutePath: readonly string[]) => boolean;

const defaultHeight = 350;

export type Props = {
    jotaiStore: Store;

    files: readonly FilePath[];

    // VirtuosoGridの仕様により、heightを指定しないと表示されない。指定しない場合はdefaultHeightが使われる
    height: number | null;

    style?: React.CSSProperties;

    fileTypes?: FileTypes;

    /** ファイルの削除処理が完了したときにトリガーされます。複数のファイルが削除されるときは、最後のファイルが削除されたときにトリガーされます。 */
    onDelete?: (deletedFiles: readonly Path[]) => void;

    /** ファイルのリネーム処理が完了したときにトリガーされます。複数のファイルがリネームされるときは、最後のファイルがリネームされたときにトリガーされます。 */
    onRename?: (renamedFiles: readonly RenameResult[]) => void;

    onFileCreate?: (absolutePath: readonly string[]) => void;

    canMove: (
        /** 例えば`folder1`というフォルダに`a.png`と`b.png`と`c.png`というファイルがあってこれらのうち`a.png`と`b.png`のみを`folder2`フォルダに移動しようとした場合、`currentDirectoryPath`は`['folder1']`、newDirectoryPathは`['folder2']`となります。ファイル名が`a.png`と`b.png`であるという情報の取得は、現時点では必要とされていないためサポートしていません。 */ params: {
            currentDirectoryPath: readonly string[];

            /** cutの際はnullに、pasteの際はnon-nullになります。 */
            newDirectoryPath: readonly string[] | null;
        },
    ) => Result<void>;

    canRename: (params: {
        directoryPath: readonly string[];

        oldName: string;

        /** ユーザーがrenameを開始しようとした際はnullに、新しい名前を決めた際はnon-nullになります。 */
        newName: string | null;

        nodeType: Node['type'];
    }) => Result<void>;

    canCreateFolder: (params: {
        directoryPath: readonly string[];

        foldername: string;
    }) => Result<void>;

    /** trueが返されたファイルパスでは、ファイルおよびフォルダの作成とリネームと移動と削除などが無効化されます。 */
    isProtected: IsProtected;

    fileCreateLabel: string;

    /** 検索バーのplaceholderを設定します。 */
    searchPlaceholder: string;

    /** ファイルの有無にかかわらず、常に表示するフォルダを指定できます。 */
    ensuredFolderPaths: readonly {
        path: readonly string[];
    }[];

    /** 指定されたパスで他のコンポーネントを表示させるようにします。現時点ではpathが完全一致したときにのみ置き換えられますが、子孫もすべて置き換えの対象とするかもしれません。 */
    overridingElements: readonly {
        path: readonly string[];
        element: JSX.Element;
    }[];
};

const defaultProps: Props = {
    jotaiStore: getDefaultStore(),
    files: [],
    height: null,
    isProtected: () => false,
    onFileCreate: () => undefined,
    ensuredFolderPaths: [],
    overridingElements: [],
    fileCreateLabel: '(fileCreateLabel)',
    searchPlaceholder: '(searchPlaceholder)',
    canMove: () => Result.error('(defaultProps)'),
    canRename: () => Result.error('(defaultProps)'),
    canCreateFolder: () => Result.error('(canCreateFolder)'),
};

type FilePathNode = FilePathBase & {
    type: typeof file;

    key: string;

    path: undefined;

    /** ファイルがあるパス。ファイル名の部分は含みません。FilePath.path から `''` の要素とファイル名の要素を取り除いたものと等しいです。*/
    folderPath: readonly string[];

    /** ファイル名。 */
    name: string;
};

type FolderTree = DeletableTree<
    string,
    {
        /** 1つ目のkeyはnameと等しく、2つ目はidと等しくなります。 */
        files: DualKeyMap<string, string | undefined, FilePathNode>;
    }
>;

type Folder = {
    type: typeof folder;
    key: string;
    folderPath: readonly string[];
    name: string;
};

class Node {
    constructor(readonly source: FilePathNode | Folder) {}

    get key() {
        return this.source.key;
    }

    get type() {
        return this.source.type;
    }

    get name() {
        return this.source.name;
    }

    get id() {
        if (this.source.type === file) {
            return this.source.id;
        }
        return undefined;
    }

    get folderPath(): readonly string[] {
        return this.source.folderPath;
    }

    get path(): readonly string[] {
        return [...this.folderPath, this.name];
    }
}

type FileToDelete = {
    status: 'waiting' | 'deleting' | 'deleted' | 'error';
    file: FilePathNode;
};

type AskingDeleteStatus = {
    type: 'asking';

    files: readonly FileToDelete[];

    /** 削除するフォルダを指定します。これらの中にファイルが含まれる場合はfilesに含める必要があります。 */
    folders: readonly { path: readonly string[] }[];
};

type DeleteStatus =
    | {
          type: 'none';
      }
    | {
          type: 'deleting' | 'aborted' | 'finished';
          files: readonly FileToDelete[];
          /** 削除するフォルダを指定します。これらの中にファイルが含まれる場合はfilesに含める必要があります。 */
          folders: readonly { path: readonly string[] }[];
      }
    | AskingDeleteStatus;

type FileToRename = {
    status: 'waiting' | 'renaming' | 'renamed' | 'error';
    file: FilePathNode;
    newPath: readonly string[];
};

type AskingRenameStatus = {
    type: 'asking';

    files: readonly FileToRename[];

    /** リネームするフォルダを指定します。これらの中にファイルが含まれる場合はfilesに含める必要があります。 */
    folders: readonly { currentPath: readonly string[]; newPath: readonly string[] }[];
};

type RenameStatus =
    | {
          type: 'none';
      }
    | {
          type: 'renaming' | 'aborted' | 'finished';
          files: readonly FileToRename[];
          /** リネームするフォルダを指定します。これらの中にファイルが含まれる場合はfilesに含める必要があります。 */
          folders: readonly { currentPath: readonly string[]; newPath: readonly string[] }[];
      }
    | AskingRenameStatus;

type PathStateBase = {
    rootFolder: FolderTree;

    // 要素はabsolute path
    currentDirectory: readonly string[];

    isMultipleSelectMode: boolean;

    ensuredFolders: Tree<string, null>;

    overridingElements: Tree<string, JSX.Element | null>;

    // 現在のcurrentDirectoryにおいて選択されているファイルおよびフォルダの名前。
    // selectedFilesは、first keyがnameでsecond keyがid。DualKeyMapの仕様の都合上、valueはundefinedではなくnullとしている。
    selectedFiles: DualKeyMap<string, string | undefined, null>;
    selectedFolders: ReadonlySet<string>;

    // cutされたファイルおよびフォルダの名前。
    // cutFilesは、first keyがnameでsecond keyがid。DualKeyMapの仕様の都合上、valueはundefinedではなくnullとしている。
    cutFiles: DualKeyMap<string, string | undefined, null>;
    cutFolders: ReadonlySet<string>;
    /** cutされたファイルやフォルダが属するフォルダ。 */
    cutAt: readonly string[];
};

/** ファイルパスを移動した際の新しいパスを返します。この関数はpureです。
 *
 * 例えば`a/b/f1.png`と`a/b/f2.png`と`c/f3.png`がある状態で、`a`のフォルダ内で、`b`を切り取ってから`c`フォルダ内に貼り付けて`c/b/f1.png`と`c/b/f2.png`と`c/f3.png`の状態にする場合、`nodePath`は`['a', 'b']`、`cutAt`は`['a']`、`newPath`は`['c']`になります。`cutAt`は必ず`nodePath.slice(0,n)`(nは0以上の整数)で取得できる値となります。*/
const movePath = ({
    nodePath,
    cutAt,
    destFolderPath,
}: {
    nodePath: readonly string[];
    cutAt: readonly string[];
    destFolderPath: readonly string[];
}) => {
    const result = [...nodePath];
    // a/b/f1.pngをb/f1.pngに変換。
    result.splice(0, cutAt.length);
    // b/f1.pngをc/b/f1.pngに変換。
    return [...destFolderPath, ...result];
};

type PathList = {
    readonly files: readonly Path[];
    readonly folders: readonly { path: readonly string[] }[];
};

// メソッドはすべてimmutable
class PathState {
    private constructor(private readonly members: PathStateBase) {
        Object.freeze(members);
    }

    static init(): PathState {
        return new PathState({
            rootFolder: new DeletableTree(),
            currentDirectory: [],
            isMultipleSelectMode: false,
            ensuredFolders: new Tree(null),
            overridingElements: new Tree(null),
            selectedFiles: new DualKeyMap(),
            selectedFolders: new Set(),
            cutFiles: new DualKeyMap(),
            cutFolders: new Set(),
            cutAt: [],
        });
    }

    deleteFolderIfEmpty(path: readonly string[]): PathState | null {
        if (this.members.rootFolder.get(path).isNone) {
            return null;
        }

        const newValue = this.members.rootFolder.clone();
        const subtree = this.members.rootFolder
            .createSubTree(path, () => ({ files: new DualKeyMap() }))
            .traverse();
        for (const { value } of subtree) {
            if (value.files.size !== 0) {
                return null;
            }
        }
        newValue.delete(path);
        return new PathState({ ...this.members, rootFolder: newValue });
    }

    renameFolderIfEmpty(
        currentPath: readonly string[],
        newPath: readonly string[],
    ): PathState | null {
        const subtree = this.members.rootFolder.createSubTreeIfExists(currentPath)?.traverse();
        if (subtree == null) {
            return null;
        }
        const newValue = this.members.rootFolder.clone();
        for (const { value, absolutePath } of subtree) {
            if (value.files.size !== 0) {
                return null;
            }
            newValue.delete(absolutePath);
            newValue.ensure(
                movePath({ nodePath: absolutePath, cutAt: currentPath, destFolderPath: newPath }),
                oldValue => {
                    if (oldValue.isNone) {
                        return { files: new DualKeyMap() };
                    }
                    return oldValue.value;
                },
                () => ({ files: new DualKeyMap() }),
            );
        }
        return new PathState({ ...this.members, rootFolder: newValue });
    }

    updateRootFolder(files: readonly FilePath[]) {
        const newRootFolder = new DeletableTree<
            string,
            {
                files: DualKeyMap<string, string | undefined, FilePathNode>;
            }
        >();

        for (const filePath of files) {
            const folderPath = [...joinPath(filePath.path).array];
            const filename = folderPath.pop();
            if (filename == null) {
                throw new Error('This should not happen.');
            }
            const folderNode = newRootFolder.ensure(
                folderPath,
                oldValue => {
                    if (oldValue.isNone) {
                        return {
                            files: new DualKeyMap(),
                        };
                    }
                    return oldValue.value;
                },
                () => ({ files: new DualKeyMap() }),
            );
            folderNode.files.set(
                { first: filename, second: filePath.id },
                {
                    ...filePath,
                    type: file,
                    key:
                        joinPath(filePath.path).string +
                        (filePath.id == null ? '' : '@' + filePath.id) +
                        '@FileBrowser@File',
                    name: filename,
                    folderPath,
                    path: undefined,
                },
            );
        }

        // 空のフォルダを以前の状態に戻す処理
        for (const { absolutePath } of this.members.rootFolder.traverse()) {
            newRootFolder.ensure(
                absolutePath,
                oldValue => {
                    if (oldValue.isNone) {
                        return {
                            files: new DualKeyMap(),
                        };
                    }
                    return oldValue.value;
                },
                () => ({ files: new DualKeyMap() }),
            );
        }

        return new PathState({ ...this.members, rootFolder: newRootFolder });
    }

    updateEnsuredFolders(ensuredFolders: readonly { path: readonly string[] }[]): PathState {
        const newValue = new Tree<string, null>(null);
        for (const path of ensuredFolders) {
            newValue.ensure(
                joinPath(path.path).array,
                () => null,
                () => null,
            );
        }
        return new PathState({ ...this.members, ensuredFolders: newValue });
    }

    updateOverridingElements(overridingElements: Props['overridingElements']): PathState {
        const newValue = new Tree<string, JSX.Element | null>(null);
        for (const elem of overridingElements) {
            newValue.ensure(
                joinPath(elem.path).array,
                () => elem.element,
                () => null,
            );
        }
        return new PathState({ ...this.members, overridingElements: newValue });
    }

    createNodes() {
        const readonlyCurrentFolderMap =
            this.members.rootFolder.createSubTreeIfExists(this.members.currentDirectory) ??
            new DeletableTree();

        const fileNodes = readonlyCurrentFolderMap.get([]).value?.files ?? new DualKeyMap();
        const folderNodes = new Map<string, Folder>();
        for (const [name, $folder] of readonlyCurrentFolderMap.getChildren()) {
            const folderPath = [...$folder.absolutePath];
            folderPath.pop();

            folderNodes.set(name, {
                type: folder,
                key: joinPath($folder.absolutePath).string + '@FileBrowser@Folder',
                folderPath,
                name,
            });
        }
        for (const [name, $folder] of this.members.ensuredFolders
            .createSubTreeIfExists(this.members.currentDirectory)
            ?.getChildren() ?? []) {
            const key = $folder.absolutePath.reduce(
                (seed, elem) => `${seed}/${elem}`,
                'FileBrowser@EnsuredFolder/',
            );

            const folderPath = [...$folder.absolutePath];
            folderPath.pop();

            folderNodes.set(name, {
                type: folder,
                folderPath,
                key,
                name,
            } as const);
        }

        const nodes: Node[] = [
            ...fileNodes.toArray().map(([, value]) => new Node(value)),
            ...[...folderNodes].map(([, value]) => new Node(value)),
        ];
        nodes.sort((x, y) => {
            if (x.type === folder) {
                if (y.type === folder) {
                    return x.name.localeCompare(y.name);
                }
                return -1;
            }
            if (y.type === folder) {
                return 1;
            }

            return x.name.localeCompare(y.name);
        });
        return nodes;
    }

    tryGetEnsuredFolder(path: readonly string[]) {
        return this.members.ensuredFolders.get(path);
    }

    tryGetOverridingElement(path: readonly string[]) {
        return this.members.overridingElements.get(path).value ?? null;
    }

    #setFileSelected(filename: NameIdPair) {
        const newValue = this.members.selectedFiles.clone();
        newValue.set({ first: filename.name, second: filename.id }, null);
        return new PathState({
            ...this.members,
            selectedFiles: newValue,
        });
    }

    #toggleSelectedFile(filename: NameIdPair) {
        const oldValue = this.members.selectedFiles;
        const newValue = this.members.selectedFiles.clone();
        const mapKey = { first: filename.name, second: filename.id };
        if (oldValue.has(mapKey)) {
            newValue.delete(mapKey);
        } else {
            newValue.set(mapKey, null);
        }
        return new PathState({ ...this.members, selectedFiles: newValue });
    }

    #setFolderSelected(foldername: string) {
        const newValue = new Set(this.members.selectedFolders);
        newValue.add(foldername);
        return new PathState({
            ...this.members,
            selectedFolders: newValue,
        });
    }

    #toggleSelectedFolder(foldername: string) {
        const oldValue = this.members.selectedFolders;
        const newValue = new Set(this.members.selectedFolders);
        if (oldValue.has(foldername)) {
            newValue.delete(foldername);
        } else {
            newValue.add(foldername);
        }
        return new PathState({ ...this.members, selectedFolders: newValue });
    }

    get currentDirectory() {
        return this.members.currentDirectory;
    }

    cd(update: (oldValue: readonly string[]) => readonly string[]) {
        return new PathState({
            ...this.members,
            currentDirectory: update(this.members.currentDirectory),
            isMultipleSelectMode: false,
            selectedFiles: new DualKeyMap(),
            selectedFolders: new Set(),
        });
    }

    createFolder(path: readonly string[]) {
        const rootFolder = this.members.rootFolder.clone();
        rootFolder.ensure(
            path,
            oldValue => {
                if (oldValue.isNone) {
                    return { files: new DualKeyMap() };
                }
                return oldValue.value;
            },
            () => ({ files: new DualKeyMap() }),
        );
        return new PathState({ ...this.members, rootFolder });
    }

    /** 実行すると、FilePathNodeのonSelectやonOpenが実行されることがあります。 */
    select(props: Props, node: Node): PathState {
        const nodeSource = node.source;
        if (this.members.isMultipleSelectMode) {
            if (nodeSource.type === file) {
                return this.#toggleSelectedFile(nodeSource);
            }
            return this.#toggleSelectedFolder(nodeSource.name);
        }

        if (nodeSource.type === folder) {
            return this.cd(oldValue => {
                const newValue = [...oldValue];
                newValue.push(nodeSource.name);
                return newValue;
            });
        }

        if (nodeSource.onSelect == null) {
            nodeSource.onOpen?.();
        } else {
            nodeSource.onSelect();
        }
        return this;
    }

    setAsSelected(node: Node) {
        if (node.source.type === file) {
            return this.#setFileSelected(node.source);
        }
        return this.#setFolderSelected(node.source.name);
    }

    isSelected(node: Node) {
        if (node.source.type === file) {
            return this.members.selectedFiles.has({
                first: node.source.name,
                second: node.source.id,
            });
        }
        return this.members.selectedFolders.has(node.source.name);
    }

    #isSelectedAnyCache: boolean | null = null;
    get isSelectedAny() {
        if (this.#isSelectedAnyCache == null) {
            this.#isSelectedAnyCache =
                this.members.selectedFiles.size !== 0 || this.members.selectedFolders.size !== 0;
        }
        return this.#isSelectedAnyCache;
    }

    toPathList(nodes: readonly Node[]): PathList {
        // 実際は最後のkey以外はundefinedにならない
        const files = new MultiKeyMap<string | undefined, FilePathNode>();
        const folders = new MultiValueSet<string>();
        for (const node of nodes) {
            switch (node.source.type) {
                case folder:
                    folders.add(node.path);
                    continue;
                case file:
                    files.set([...node.path, node.id], node.source);
                    continue;
            }
        }
        return {
            files: [...files.traverse()].map(({ value }) => ({
                path: new Node(value).path,
                id: value.id,
            })),
            folders: [...folders.toIterator()].map(path => ({ path })),
        };
    }

    #selectedPathsCache: PathList | null = null;
    get selectedPaths(): PathList {
        if (this.#selectedPathsCache == null) {
            this.#selectedPathsCache = {
                files: [...this.members.selectedFiles].map(([key]) => ({
                    path: [...this.members.currentDirectory, key.first],
                    id: key.second,
                })),
                folders: [...this.members.selectedFolders].map(foldername => ({
                    path: [...this.members.currentDirectory, foldername],
                })),
            };
        }
        return this.#selectedPathsCache;
    }

    listFiles({ files, folders }: PathList) {
        const result = new Set<FilePathNode>();

        for (const file of files) {
            const directoryPath = [...file.path];
            const filename = directoryPath.pop();
            this.members.rootFolder.get(directoryPath).value?.files.forEach(elem => {
                if (elem.name === filename && elem.id === file.id) {
                    result.add(elem);
                }
            });
        }

        for (const folder of folders) {
            for (const { value } of this.members.rootFolder
                .createSubTreeIfExists(folder.path)
                ?.traverse() ?? []) {
                value.files.forEach(file => result.add(file));
            }
        }

        return [...result];
    }

    isCut(node: Node) {
        if (!arrayEquals(this.members.cutAt, this.currentDirectory)) {
            return false;
        }
        switch (node.type) {
            case folder:
                return this.members.cutFolders.has(node.name);
            case file:
                return this.members.cutFiles.has({ first: node.name, second: node.id });
        }
    }

    #isCutAnyCache: boolean | null = null;
    get isCutAny() {
        if (this.#isCutAnyCache == null) {
            this.#isCutAnyCache =
                this.members.cutFiles.size !== 0 || this.members.cutFolders.size !== 0;
        }
        return this.#isCutAnyCache;
    }

    isCurrentDirectoryProtected(props: Props) {
        return props.isProtected(this.members.currentDirectory);
    }

    unselect(): PathState {
        return new PathState({
            ...this.members,
            selectedFiles: new DualKeyMap(),
            selectedFolders: new Set(),
        });
    }

    get isMultipleSelectMode() {
        return this.members.isMultipleSelectMode;
    }

    canChangeMultipleSelectMode(props: Props) {
        return !this.isCurrentDirectoryProtected(props);
    }

    changeIsMultipleSelectMode(newValue: boolean): PathState {
        return new PathState({
            ...this.members,
            isMultipleSelectMode: newValue,
        });
    }

    canCut(props: Props): Result<void> {
        if (this.isCurrentDirectoryProtected(props)) {
            return Result.error(protectedErrorMessage);
        }
        return props.canMove({
            currentDirectoryPath: this.currentDirectory,
            newDirectoryPath: null,
        });
    }

    cutOne(props: Props, node: Node): PathState {
        if (this.canCut(props).isError) {
            return this;
        }

        const newCutFiles = new DualKeyMap<string, string | undefined, null>();
        const newCutFolders = new Set<string>();
        switch (node.type) {
            case file: {
                newCutFiles.set({ first: node.name, second: node.id }, null);
                break;
            }
            default: {
                newCutFolders.add(node.name);
                break;
            }
        }
        return new PathState({
            ...this.members,
            cutFiles: newCutFiles,
            cutFolders: newCutFolders,
            cutAt: this.currentDirectory,
        });
    }

    cutSelected(props: Props) {
        if (this.canCut(props).isError) {
            return this;
        }

        return new PathState({
            ...this.members,
            cutFiles: this.members.selectedFiles,
            cutFolders: this.members.selectedFolders,
            cutAt: this.currentDirectory,
            selectedFiles: new DualKeyMap(),
            selectedFolders: new Set(),
        });
    }

    resetCutState() {
        return new PathState({
            ...this.members,
            cutFiles: new DualKeyMap(),
            cutFolders: new Set(),
            cutAt: [],
        });
    }

    canCreateFile(props: Props): Result<void> {
        if (this.isCurrentDirectoryProtected(props)) {
            return Result.error(protectedErrorMessage);
        }
        return Result.ok(undefined);
    }

    createFile(props: Props) {
        if (this.canCreateFile(props).isError) {
            return;
        }
        props.onFileCreate?.(this.members.currentDirectory);
    }

    #requestDeleting(source: readonly FilePathNode[]): FileToDelete[] {
        return source
            .map(file => ({ status: 'waiting', file }) as const)
            .sort((x, y) => {
                for (const group of groupJoinArray(new Node(x.file).path, new Node(y.file).path)) {
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
    }

    canRequestDeleting(props: Props, node: Node): Result<void> {
        if (props.isProtected(node.folderPath)) {
            return Result.error(protectedErrorMessage);
        }
        return Result.ok(undefined);
    }

    requestDeleting(props: Props, node: Node): AskingDeleteStatus | null {
        if (this.canRequestDeleting(props, node).isError) {
            return null;
        }
        const source = this.listFiles(this.toPathList([node]));
        return {
            type: 'asking',
            files: this.#requestDeleting(source),
            folders: node.type === folder ? [{ path: node.path }] : [],
        };
    }

    canRequestDeletingSelectedNodes(props: Props): Result<void> {
        if (props.isProtected(this.currentDirectory)) {
            return Result.error(protectedErrorMessage);
        }
        return Result.ok(undefined);
    }

    requestDeletingSelectedNodes(props: Props): AskingDeleteStatus | null {
        if (this.canRequestDeletingSelectedNodes(props).isError) {
            return null;
        }
        const source = this.listFiles(this.selectedPaths);
        const files = this.#requestDeleting(source);
        return {
            type: 'asking',
            files,
            folders: this.selectedPaths.folders,
        };
    }

    canRequestPasting(props: Props, destDirectoryPath: readonly string[]): Result<void> {
        return props.canMove({
            currentDirectoryPath: this.members.cutAt,
            newDirectoryPath: destDirectoryPath,
        });
    }

    requestPasting(props: Props, destFolderPath: readonly string[]): AskingRenameStatus | null {
        if (this.canRequestPasting(props, destFolderPath).isError) {
            return null;
        }
        const files: FileToRename[] = this.listFiles({
            files: [...this.members.cutFiles].map(([key]) => ({
                path: [...this.members.cutAt, key.first],
                id: key.second,
            })),
            folders: [...this.members.cutFolders].map(foldername => ({
                path: [...this.members.cutAt, foldername],
            })),
        }).map(file => {
            return {
                status: 'waiting',
                file,
                newPath: movePath({
                    nodePath: new Node(file).path,
                    cutAt: this.members.cutAt,
                    destFolderPath,
                }),
            };
        });
        return {
            type: 'asking',
            files,
            folders: [...this.members.cutFolders].map(foldername => {
                const currentPath = [...this.members.cutAt, foldername];
                return {
                    currentPath,
                    newPath: movePath({
                        nodePath: currentPath,
                        cutAt: this.members.cutAt,
                        destFolderPath,
                    }),
                };
            }),
        };
    }

    canRequestRenaming(props: Props, node: Node, newName: string | null): Result<void> {
        return props.canRename({
            directoryPath: node.folderPath,
            oldName: node.name,
            newName,
            nodeType: node.type,
        });
    }

    requestRenaming(props: Props, node: Node, newName: string): AskingRenameStatus | null {
        if (this.canRequestRenaming(props, node, newName).isError) {
            return null;
        }
        const destPath = [...node.folderPath, newName];
        const files: FileToRename[] = this.listFiles(this.toPathList([node])).map(file => ({
            status: 'waiting',
            file,
            newPath: movePath({
                nodePath: new Node(file).path,
                cutAt: node.path,
                destFolderPath: destPath,
            }),
        }));
        return {
            type: 'asking',
            files,
            folders: node.type === folder ? [{ currentPath: node.path, newPath: destPath }] : [],
        };
    }
}

const JotaiStoreContext = React.createContext<Store>(defaultProps.jotaiStore);

const useJotaiStore = () => {
    return React.useContext(JotaiStoreContext);
};

const useAtomValue = <T,>(atom: Atom<T>) => {
    return useAtomValueCore(atom, { store: useJotaiStore() });
};

const useSetAtom = <T,>(atom: PrimitiveAtom<T>) => {
    return useSetAtomCore(atom, { store: useJotaiStore() });
};

const useAtom = <T,>(atom: PrimitiveAtom<T>) => {
    return useAtomCore(atom, { store: useJotaiStore() });
};

const useAtomSelector = <T1, T2>(atom: Atom<T1>, mapping: (value: T1) => T2) => {
    return useAtomSelectorCore(atom, mapping, undefined, { store: useJotaiStore() });
};

const pathStateAtom = atom(PathState.init());
const propsAtom = atom<Props>(defaultProps);
const deleteStatusAtom = atom<DeleteStatus>({ type: 'none' });
const renameStatusAtom = atom<RenameStatus>({ type: 'none' });
const fileTypeFilterAtom = atom<string | null>(null);
const fileNameFilterAtom = atom<string>('');

/** ここにセットされたフォルダは、次回のrootFolder更新時にフォルダが空であれば削除されます。 */
// Props.onRenameやProps.onDeleteの実行後にセットされる。このときにpathStateから直接空のフォルダを削除しようとしても、取得できるpathStateはProps.onRenameやProps.onDeleteの結果がまだ反映されていない状態であるため、削除する場合はフォルダが空かどうかに関わらず削除することになる。これはProps.onRenameやProps.onDeleteでProps.filesの更新が行われるならば空でないフォルダは自動的に修復されるが、そうでないときは削除されたままとなるため、混乱が生じる可能性がある。そこで、削除をリクエストするフォルダをここにためておいて、次のrootFolder更新時で空のフォルダのみ削除するという方針をとっている。
const foldersDeletingOnNextRootFolderUpdateAtom = atom<readonly { path: readonly string[] }[]>([]);

const isDeleteConfirmModalVisibleAtom = atom(false);
const isRenameConfirmModalVisibleAtom = atom(false);
const isModalToCreateFolderVisibleAtom = atom(false);
type RenameInputModalState = {
    currentName: string;
    onOk: (newName: string) => void;
    canOk: (newName: string) => boolean;
};
const renameInputModalStateAtom = atom<RenameInputModalState | null>(null);

const isProtectedAtom = atom(get => {
    const pathState = get(pathStateAtom);
    const props = get(propsAtom);
    return pathState.isCurrentDirectoryProtected(props);
});

const useCreateFolderAction = () => {
    const isProtected = useAtomValue(isProtectedAtom);
    const setVisible = useSetAtom(isModalToCreateFolderVisibleAtom);

    return React.useMemo(
        () => ({
            canExecute: isProtected ? Result.error(protectedErrorMessage) : Result.ok(undefined),
            showModal: () => setVisible(true),
        }),
        [isProtected, setVisible],
    );
};

const useTrySetDeleteStatusAsAsking = () => {
    const [deleteStatus, setDeleteStatus] = useAtom(deleteStatusAtom);
    const setIsModalVisible = useSetAtom(isDeleteConfirmModalVisibleAtom);
    const { notification } = App.useApp();

    return React.useCallback(
        (askingDeleteStatus: AskingDeleteStatus) => {
            if (deleteStatus.type === 'deleting') {
                notification.warning({
                    placement: 'bottomRight',
                    message:
                        '現在行われている削除が全て完了するまで、他のファイルを削除することはできません。',
                });
                setIsModalVisible(true);
                return;
            }
            setDeleteStatus(() => askingDeleteStatus);
            setIsModalVisible(true);
        },
        [deleteStatus.type, notification, setDeleteStatus, setIsModalVisible],
    );
};

const useRequestDeletingSelectedNodesAction = () => {
    const props = useAtomValue(propsAtom);
    const setAsAsking = useTrySetDeleteStatusAsAsking();
    const [pathState, setPathState] = useAtom(pathStateAtom);

    const execute = React.useCallback(() => {
        const newStatus = pathState.requestDeletingSelectedNodes(props);
        setPathState(pathState => pathState.unselect());
        if (newStatus == null) {
            return;
        }
        setAsAsking(newStatus);
    }, [pathState, props, setAsAsking, setPathState]);

    return React.useMemo(() => {
        const canExecute = pathState.canRequestDeletingSelectedNodes(props);
        return {
            execute,
            canExecute,
        };
    }, [execute, pathState, props]);
};

const useRequestDeletingNodeAction = () => {
    const props = useAtomValue(propsAtom);
    const setAsAsking = useTrySetDeleteStatusAsAsking();
    const pathState = useAtomValue(pathStateAtom);

    const canExecute = React.useCallback(
        (node: Node) => {
            return pathState.canRequestDeleting(props, node);
        },
        [pathState, props],
    );

    const execute = React.useCallback(
        (node: Node) => {
            const newStatus = pathState.requestDeleting(props, node);
            if (newStatus == null) {
                return;
            }
            setAsAsking(newStatus);
        },
        [pathState, props, setAsAsking],
    );

    return React.useMemo(
        () => ({
            execute,
            canExecute,
        }),
        [execute, canExecute],
    );
};

const useTrySetRenameStatusAsAsking = () => {
    const [renameStatus, setRenameStatus] = useAtom(renameStatusAtom);
    const setIsModalVisible = useSetAtom(isRenameConfirmModalVisibleAtom);
    const { notification } = App.useApp();

    return React.useCallback(
        (askingRenameStatus: AskingRenameStatus) => {
            if (renameStatus.type === 'renaming') {
                notification.warning({
                    placement: 'bottomRight',
                    message:
                        '現在行われているリネームが全て完了するまで、他のファイルをリネームすることはできません。',
                });
                setIsModalVisible(true);
                return;
            }
            setRenameStatus(() => askingRenameStatus);
            setIsModalVisible(true);
        },
        [renameStatus.type, setRenameStatus, setIsModalVisible, notification],
    );
};

const useRequestPastingAction = () => {
    const props = useAtomValue(propsAtom);
    const setAsAsking = useTrySetRenameStatusAsAsking();
    const [pathState, setPathState] = useAtom(pathStateAtom);

    const canExecute = React.useCallback(
        (
            /** 貼り付け先のフォルダを指定できます。指定せず、current directoryに貼り付ける場合はnullを渡します。 */
            targetFolder: string | null,
        ) => {
            const destPath =
                targetFolder == null
                    ? pathState.currentDirectory
                    : [...pathState.currentDirectory, targetFolder];
            return pathState.canRequestPasting(props, destPath);
        },
        [pathState, props],
    );

    const execute = React.useCallback(
        (
            /** 貼り付け先のフォルダを指定できます。指定せず、current directoryに貼り付ける場合はnullを渡します。 */
            targetFolder: string | null,
        ) => {
            const destPath =
                targetFolder == null
                    ? pathState.currentDirectory
                    : [...pathState.currentDirectory, targetFolder];
            const newStatus = pathState.requestPasting(props, destPath);
            setPathState(pathState => pathState.unselect());
            if (newStatus == null) {
                return;
            }
            setAsAsking(newStatus);
        },
        [pathState, props, setAsAsking, setPathState],
    );

    return React.useMemo(
        () => ({
            execute,
            canExecute,
        }),
        [execute, canExecute],
    );
};

const useRequestRenamingAction = () => {
    const props = useAtomValue(propsAtom);
    const setAsAsking = useTrySetRenameStatusAsAsking();
    const [pathState, setPathState] = useAtom(pathStateAtom);

    const canExecute = React.useCallback(
        (node: Node, newName: string | null) => {
            return pathState.canRequestRenaming(props, node, newName);
        },
        [pathState, props],
    );

    const execute = React.useCallback(
        (node: Node, newName: string) => {
            const newStatus = pathState.requestRenaming(props, node, newName);
            setPathState(pathState => pathState.unselect());
            if (newStatus == null) {
                return;
            }
            setAsAsking(newStatus);
        },
        [pathState, props, setAsAsking, setPathState],
    );

    return React.useMemo(
        () => ({
            execute,
            canExecute,
        }),
        [execute, canExecute],
    );
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

const ActionBar: React.FC = () => {
    const [pathState, setPathState] = useAtom(pathStateAtom);
    const props = useAtomValue(propsAtom);

    return (
        <div className={classNames(flex, flexRow, itemsCenter)}>
            <Checkbox
                disabled={!pathState.canChangeMultipleSelectMode(props)}
                onChange={e =>
                    setPathState(pathState =>
                        pathState.changeIsMultipleSelectMode(e.target.checked),
                    )
                }
                checked={pathState.isMultipleSelectMode}
            >
                複数選択モード
            </Checkbox>
            <Button
                onClick={() => {
                    setPathState(pathState => pathState.resetCutState());
                }}
                disabled={!pathState.isCutAny}
            >
                切り取りをキャンセル
            </Button>
        </div>
    );
};

const AddressBar: React.FC = () => {
    const [pathState, setPathState] = useAtom(pathStateAtom);
    const searchPlaceholder = useAtomSelector(propsAtom, props => props.searchPlaceholder);
    const currentDirectory = React.useMemo(
        () => pathState.currentDirectory,
        [pathState.currentDirectory],
    );
    const [fileNameFilter, setFileNameFilter] = useAtom(fileNameFilterAtom);

    const breadcrumbItems = currentDirectory.map(dir => (
        <Breadcrumb.Item key={keyNames('FileBrowser', 'AddressBar', 'Breadcrumb', dir)}>
            {dir}
        </Breadcrumb.Item>
    ));

    return (
        <div className={classNames(flex, flexRow, itemsCenter)}>
            <Button
                size="small"
                disabled={currentDirectory.length === 0}
                onClick={() =>
                    setPathState(pathState => {
                        return pathState.cd(oldValue => {
                            const newValue = [...oldValue];
                            newValue.pop();
                            return newValue;
                        });
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
                placeholder={searchPlaceholder}
                onChange={e => setFileNameFilter(e.target.value)}
            />
        </div>
    );
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
                    <div>{joinPath(new Node(item.file).path).string}</div>
                </div>
            ))}
        </div>
    );
};

const DeleteConfirmModal: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useAtom(isDeleteConfirmModalVisibleAtom);
    const [deleteStatus, setDeleteStatus] = useAtom(deleteStatusAtom);
    const setPathState = useSetAtom(pathStateAtom);

    let message: string;
    let button: JSX.Element;
    switch (deleteStatus.type) {
        case 'none':
        case 'finished':
            message = '削除が完了しました。';
            break;
        case 'asking':
            {
                if (deleteStatus.files.length === 0) {
                    message = '選択した空のフォルダを削除しますか？';
                } else {
                    message = `次の${deleteStatus.files.length}個のファイルを削除しますか？(フォルダは一覧に表示されませんが、あわせて削除されます)`;
                }
            }
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
                <Button style={buttonStyle} type="primary" danger disabled>
                    削除
                </Button>
            );
            break;
        case 'asking':
        case 'aborted':
            button = (
                <Button
                    style={buttonStyle}
                    type="primary"
                    danger
                    onClick={() => {
                        if (deleteStatus.type === 'asking') {
                            setPathState(pathState => {
                                let newPathState = pathState;
                                for (const { path } of deleteStatus.folders) {
                                    newPathState =
                                        newPathState.deleteFolderIfEmpty(path) ?? newPathState;
                                }
                                return newPathState;
                            });
                        }
                        setDeleteStatus(() => {
                            return {
                                type: 'deleting',
                                files: deleteStatus.files,
                                folders: deleteStatus.folders,
                            };
                        });
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
                        setDeleteStatus(() => ({
                            type: 'aborted',
                            files: deleteStatus.files,
                            folders: deleteStatus.folders,
                        }));
                    }}
                >
                    キャンセル
                </Button>
            );
            break;
    }

    const canClose = deleteStatus.type !== 'deleting';
    const onClose = () => {
        if (!canClose) {
            return;
        }
        setDeleteStatus(() => ({ type: 'none' }));
        setIsModalVisible(false);
    };
    return (
        <Modal
            open={isModalVisible}
            title="削除の確認"
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

const FilesToRenameTable: React.FC<{
    items: readonly FileToRename[];
    style?: React.CSSProperties;
}> = ({ items, style }) => {
    return (
        <div className={classNames(flex, flexColumn)} style={style}>
            {items.map(item => (
                <div key={item.file.key} className={classNames(flex, flexRow)}>
                    <div style={{ width: 20 }}>
                        {item.status === 'renamed' ? (
                            <Icons.CheckOutlined />
                        ) : item.status === 'renaming' ? (
                            <Icons.LoadingOutlined />
                        ) : item.status === 'error' ? (
                            <Icons.WarningOutlined />
                        ) : null}
                    </div>
                    <div>
                        {joinPath(new Node(item.file).path).string} →{' '}
                        {joinPath(item.newPath).string}
                    </div>
                </div>
            ))}
        </div>
    );
};

const RenameConfirmModal: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useAtom(isRenameConfirmModalVisibleAtom);
    const [renameStatus, setRenameStatus] = useAtom(renameStatusAtom);
    const setPathState = useSetAtom(pathStateAtom);

    let message: string;
    let button: JSX.Element;
    switch (renameStatus.type) {
        case 'none':
        case 'finished':
            message = '移動もしくはリネームが完了しました。';
            break;
        case 'asking':
            {
                if (renameStatus.files.length === 0) {
                    message = '選択した空のフォルダを移動もしくはリネームしますか？';
                } else {
                    message = `次の${renameStatus.files.length}個のファイルを移動もしくはリネームしますか？（フォルダは一覧に表示されませんが、あわせて移動もしくはリネームされます）`;
                }
            }
            break;
        case 'renaming':
            message = 'ファイルを移動もしくはリネーム中です…';
            break;
        case 'aborted':
            message = '移動もしくはリネームがキャンセルされました。';
            break;
    }
    const buttonStyle: React.CSSProperties = {
        width: 100,
    };
    switch (renameStatus.type) {
        case 'none':
        case 'finished':
            button = (
                <Button style={buttonStyle} type="primary" danger disabled>
                    移動/リネーム
                </Button>
            );
            break;
        case 'asking':
        case 'aborted':
            button = (
                <Button
                    style={buttonStyle}
                    type="primary"
                    onClick={() => {
                        if (renameStatus.type === 'asking') {
                            setPathState(pathState => {
                                let newPathState = pathState;
                                for (const { currentPath, newPath } of renameStatus.folders) {
                                    newPathState =
                                        newPathState.renameFolderIfEmpty(currentPath, newPath) ??
                                        newPathState;
                                }
                                return newPathState;
                            });
                        }
                        setRenameStatus(() => {
                            return {
                                type: 'renaming',
                                files: renameStatus.files,
                                folders: renameStatus.folders,
                            };
                        });
                    }}
                >
                    {renameStatus.type === 'aborted' ? 'リネームを再開' : 'リネーム'}
                </Button>
            );
            break;
        case 'renaming':
            button = (
                <Button
                    style={buttonStyle}
                    onClick={() => {
                        setRenameStatus(() => ({
                            type: 'aborted',
                            files: renameStatus.files,
                            folders: renameStatus.folders,
                        }));
                    }}
                >
                    キャンセル
                </Button>
            );
            break;
    }

    const canClose = renameStatus.type !== 'renaming';
    const onClose = () => {
        if (!canClose) {
            return;
        }
        setRenameStatus(() => ({ type: 'none' }));
        setIsModalVisible(false);
    };
    return (
        <Modal
            open={isModalVisible}
            title="移動、リネームの確認"
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
                <FilesToRenameTable
                    items={renameStatus.type === 'none' ? [] : renameStatus.files}
                    style={{ height: 200, overflowY: 'auto' }}
                />
            </div>
        </Modal>
    );
};

const RenameInputModal: React.FC = () => {
    const [state, setState] = useAtom(renameInputModalStateAtom);
    const [name, setName] = React.useState('');
    React.useEffect(() => {
        if (state?.currentName == null) {
            return;
        }
        setName(state?.currentName);
    }, [state?.currentName]);

    const onClose = () => {
        setState(null);
    };
    return (
        <Modal
            open={state != null}
            title="リネーム"
            onCancel={onClose}
            footer={
                <DialogFooter
                    ok={{
                        onClick: () => {
                            if (state == null) {
                                return;
                            }
                            if (!state.canOk(name)) {
                                return;
                            }
                            state.onOk(name);
                            setName('');
                            onClose();
                        },
                        disabled: state == null ? true : !state.canOk(name),
                        textType: 'ok',
                    }}
                    close={{ onClick: onClose, textType: 'cancel' }}
                />
            }
        >
            <Input value={name} onChange={e => setName(e.target.value)} />
        </Modal>
    );
};

const CreateFolderModal: React.FC = () => {
    const [pathState, setPathState] = useAtom(pathStateAtom);
    const [foldername, setFoldername] = React.useState('');
    const inputRef = React.useRef<InputRef | null>(null);
    const props = useAtomValue(propsAtom);
    const foldernameError = React.useMemo(
        () =>
            props.canCreateFolder({
                directoryPath: pathState.currentDirectory,
                foldername,
            }).error,
        [foldername, pathState.currentDirectory, props],
    );

    const [visible, setVisible] = useAtom(isModalToCreateFolderVisibleAtom);

    React.useEffect(() => {
        if (visible) {
            inputRef.current?.focus();
        }
    }, [visible]);

    const onOk = () => {
        if (foldernameError != null) {
            return;
        }
        setPathState(pathState =>
            pathState.createFolder([...pathState.currentDirectory, foldername]),
        );
        setFoldername('');
        setVisible(false);
    };

    return (
        <Modal
            open={visible}
            title="新しいフォルダの作成"
            onCancel={() => setVisible(false)}
            footer={
                <DialogFooter
                    ok={{
                        textType: 'create',
                        disabled: foldernameError != null,
                        onClick: () => {
                            onOk();
                        },
                    }}
                    close={{ textType: 'cancel', onClick: () => setVisible(false) }}
                />
            }
        >
            <div className={classNames(flex, flexColumn)} style={{ gap: 4 }}>
                <div>新しく作るフォルダの名前を入力してください。</div>
                <Alert
                    type="info"
                    showIcon
                    message="ファイルが1つもない空のフォルダは、サーバーに保存されません。空のフォルダは、ファイル操作を行いやすくするためにブラウザの画面上でのみ存在する一時的なフォルダであり、ブラウザを閉じた際などに自動的に消去されます。"
                />
                <Input
                    ref={inputRef}
                    placeholder="フォルダ名"
                    value={foldername}
                    onChange={e => setFoldername(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            onOk();
                        }
                    }}
                />
                {foldernameError != null && (
                    <Alert type="error" showIcon message={foldernameError} />
                )}
            </div>
        </Modal>
    );
};

const cellFileStyle: React.CSSProperties = {
    maxWidth: 80,
    height: 60,
    maxHeight: 60,
    padding: 6,
};

const CellFile: React.FC<{ children: React.ReactNode; opacity: number | undefined }> = ({
    children,
    opacity,
}) => {
    return (
        <div
            className={classNames(
                selfCenter,
                justifySelfCenter,
                flex,
                itemsCenter,
                justifyItemsCenter,
            )}
            style={{ ...cellFileStyle, opacity }}
        >
            {children}
        </div>
    );
};

const ContextMenu: React.FC<{
    /** Node上で右クリックした場合はそのNodeを渡します。何もない場所を右クリックした場合はnullを渡します。 */
    node: Node | null;
}> = ({ node }) => {
    const props = useAtomValue(propsAtom);
    const [pathState, setPathState] = useAtom(pathStateAtom);
    const requestDeletingNodeAction = useRequestDeletingNodeAction();
    const requestDeletingSelectedNodesAction = useRequestDeletingSelectedNodesAction();
    const requestPastingAction = useRequestPastingAction();
    const requestRenamingAction = useRequestRenamingAction();
    const createFolderAction = useCreateFolderAction();
    const setRenameInputModal = useSetAtom(renameInputModalStateAtom);

    const createMenuKey = (key: string | number) => keyNames('FileBrowser', 'ContextMenu', key);
    const createLabelBaseWithTooltip = ({
        label,
        result,
    }: {
        label: string;
        result: Result<void>;
    }) => {
        return {
            label: <Tooltip overlay={result.isError ? result.error : undefined}>{label}</Tooltip>,
            disabled: result.isError,
        };
    };

    const selectedItemsMenu: ItemType[] = pathState.isSelectedAny
        ? [
              {
                  ...createLabelBaseWithTooltip({
                      label: '選択されているファイルを切り取り',
                      result: pathState.canCut(props),
                  }),
                  key: createMenuKey('選択されているファイルを切り取り'),
                  onClick: () => {
                      setPathState(pathState => pathState.cutSelected(props));
                  },
              },
              {
                  ...createLabelBaseWithTooltip({
                      label: '選択されているファイルをすべて削除',
                      result: requestDeletingSelectedNodesAction.canExecute,
                  }),
                  key: createMenuKey('選択されているファイルをすべて削除'),
                  onClick: () => {
                      requestDeletingSelectedNodesAction.execute();
                  },
              },
              { type: 'divider' },
          ]
        : [];

    let menuItems: ItemType[];
    if (node == null) {
        menuItems = [
            ...selectedItemsMenu,
            {
                ...createLabelBaseWithTooltip({
                    label: props.fileCreateLabel,
                    result: pathState.canCreateFile(props),
                }),
                key: createMenuKey('fileCreateLabel'),
                onClick: () => {
                    props.onFileCreate?.(pathState.currentDirectory);
                },
            },
            {
                ...createLabelBaseWithTooltip({
                    label: 'フォルダを作成',
                    result: createFolderAction.canExecute,
                }),
                key: createMenuKey('フォルダを作成'),
                onClick: () => {
                    createFolderAction.showModal();
                },
            },
            pathState.isCutAny
                ? {
                      ...createLabelBaseWithTooltip({
                          label: '貼り付け',
                          result: requestPastingAction.canExecute(null),
                      }),
                      key: createMenuKey('貼り付け'),
                      label: '貼り付け',
                      onClick: () => {
                          requestPastingAction.execute(null);
                      },
                  }
                : null,
        ];
    } else {
        menuItems = [
            ...selectedItemsMenu,
            {
                key: createMenuKey('選択'),
                label: '選択',
                onClick: () => setPathState(pathState.select(props, node)),
            },
            node.source.type === folder || node.source.onOpen == null
                ? null
                : {
                      key: createMenuKey('開く'),
                      label: '開く',
                      onClick: node.source.onOpen,
                  },
            node.source.type === folder || node.source.onClipboard == null
                ? null
                : {
                      key: createMenuKey('コマンドに使用するリンクとしてクリップボードにコピー'),
                      label: 'コマンドに使用するリンクとしてクリップボードにコピー',
                      onClick: node.source.onClipboard,
                  },
            {
                ...createLabelBaseWithTooltip({
                    label: '切り取り',
                    result: pathState.canCut(props),
                }),
                key: createMenuKey('切り取り'),
                onClick: () => {
                    setPathState(pathState => pathState.cutOne(props, node).unselect());
                },
            },
            pathState.isCutAny && node.type !== file
                ? {
                      ...createLabelBaseWithTooltip({
                          label: '貼り付け',
                          result: requestPastingAction.canExecute(node.name),
                      }),
                      key: createMenuKey('貼り付け'),
                      onClick: () => {
                          requestPastingAction.execute(node.name);
                      },
                  }
                : null,
            {
                ...createLabelBaseWithTooltip({
                    label: 'リネーム',
                    result: requestRenamingAction.canExecute(node, null),
                }),
                key: createMenuKey('リネーム'),
                onClick: () => {
                    setRenameInputModal({
                        currentName: node.name,
                        onOk: newName => requestRenamingAction.execute(node, newName),
                        canOk: newName => !requestRenamingAction.canExecute(node, newName).isError,
                    });
                },
            },
            {
                ...createLabelBaseWithTooltip({
                    label: '削除',
                    result: requestDeletingNodeAction.canExecute(node),
                }),
                key: createMenuKey('削除'),
                onClick: () => {
                    {
                        requestDeletingNodeAction.execute(node);
                    }
                },
            },
        ];
    }

    return <Menu items={menuItems} />;
};

// :hoverのborder-colorはantdのチェックボックスの青色と同じ
// 画面がファイルやフォルダでいっぱいのときでも、何もないところを右クリックしてMenuを出しやすいように、marginはやや大きめにとっている
const cellElementCss = css`
    position: relative;
    width: 100px;
    height: 100px;
    color: white;
    cursor: pointer;
    user-select: none;
    margin: 6px;
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
    const props = useAtomValue(propsAtom);
    const [pathState, setPathState] = useAtom(pathStateAtom);
    const isCut = React.useMemo(() => pathState.isCut(node), [node, pathState]);

    const size = 40;
    const opacity = isCut ? 0.5 : undefined;
    let fileElement: React.ReactNode;
    switch (node.source.type) {
        case folder: {
            fileElement = (
                <CellFile opacity={opacity}>
                    <Icons.FolderOutlined style={{ fontSize: size }} />
                </CellFile>
            );
            break;
        }
        case file: {
            if (
                node.source.thumb != null &&
                node.source.thumb !== true &&
                node.source.thumb !== false
            ) {
                fileElement = <CellFile opacity={opacity}>{node.source.thumb}</CellFile>;
                break;
            }
            switch (node.source.icon) {
                case sound:
                    fileElement = (
                        <CellFile opacity={opacity}>
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
                        <CellFile opacity={opacity}>
                            <Icons.FileImageOutlined style={{ fontSize: size }} />
                        </CellFile>
                    );
                    break;
                case text:
                    fileElement = (
                        <CellFile opacity={opacity}>
                            <Icons.FileTextOutlined style={{ fontSize: size }} />
                        </CellFile>
                    );
                    break;
                default:
                    fileElement = (
                        <CellFile opacity={opacity}>
                            <Icons.FileUnknownOutlined style={{ fontSize: size }} />
                        </CellFile>
                    );
                    break;
            }
        }
    }

    return (
        <Dropdown overlay={<ContextMenu node={node} />} trigger={['contextMenu']}>
            <div
                className={classNames(flex, flexColumn)}
                css={cellElementCss}
                tabIndex={0}
                onClick={() => setPathState(pathState => pathState.select(props, node))}
                onKeyDown={e => {
                    if (e.code === 'Space') {
                        setPathState(pathState => pathState.select(props, node));
                    }
                }}
                onContextMenu={e =>
                    // これがないと、Nodeを右クリックしてMenuを出したとき、本来は何もないところを右クリックしたときに出るはずのMenuも同時に表示されてしまう
                    e.stopPropagation()
                }
            >
                {pathState.isMultipleSelectMode && (
                    <Checkbox
                        style={{ position: 'absolute', left: 2, top: 0 }}
                        tabIndex={-1}
                        checked={pathState.isSelected(node)}
                    />
                )}
                {fileElement}
                <div
                    style={{
                        textAlign: 'center',
                        lineHeight: '1.333333',
                        overflow: 'hidden',
                        height: 36,
                        textOverflow: 'ellipsis',
                    }}
                >
                    <Tooltip title={node.name} placement="bottom">
                        {node.name}
                    </Tooltip>
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
    // 右クリックでコンテキストメニューが出せる領域がわかりやすいように、背景色を少し変えている
    const backgroundColor = 'rgba(0,0,0,0.3)';

    const pathState = useAtomValue(pathStateAtom);
    const fileTypeFilter = useAtomValue(fileTypeFilterAtom);
    const fileNameFilter = useAtomValue(fileNameFilterAtom);
    const nodes = React.useMemo(() => pathState.createNodes(), [pathState]);
    const filteredNodes = React.useMemo(() => {
        return nodes.filter(node => {
            if (
                fileTypeFilter != null &&
                node.source.type === file &&
                node.source.fileType !== fileTypeFilter
            ) {
                return false;
            }

            if (fileNameFilter !== '' && node.name.indexOf(fileNameFilter) < 0) {
                return false;
            }
            return true;
        });
    }, [fileNameFilter, fileTypeFilter, nodes]);

    const overridingElement = React.useMemo(() => {
        return pathState.tryGetOverridingElement(pathState.currentDirectory);
    }, [pathState]);

    if (overridingElement != null) {
        return overridingElement;
    }

    let main: JSX.Element;
    if (nodes.length === 0) {
        main = (
            <div style={{ padding: 4, height: '100%', backgroundColor }}>
                <p>このフォルダには、フォルダおよびファイルがありません。</p>
                <p>右クリックで開くメニューからフォルダおよびファイルを作成することができます。</p>
            </div>
        );
    } else if (filteredNodes.length === 0) {
        main = (
            <div style={{ padding: 4, height: '100%', backgroundColor }}>
                フォルダおよび条件にマッチするファイルがありません。
            </div>
        );
    } else {
        main = (
            <VirtuosoGrid
                style={{ backgroundColor }}
                totalCount={filteredNodes.length}
                components={{
                    List: ListContainer,
                }}
                itemContent={index => <NodeView node={filteredNodes[index]!} />}
                computeItemKey={index => filteredNodes[index]!.key}
            />
        );
    }

    return (
        <Dropdown overlay={<ContextMenu node={null} />} trigger={['contextMenu']}>
            {main}
        </Dropdown>
    );
};

const useStartAutoDeleteFiles = () => {
    const onDelete = useAtomSelector(propsAtom, props => props?.onDelete);
    const onDeleteRef = useLatest(onDelete);
    const [deleteStatus, setDeleteStatus] = useAtom(deleteStatusAtom);
    const deleteStatusRef = useLatest(deleteStatus);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [hasDeleted, setHasDeleted] = React.useState(false);
    const deleteStatusValue = deleteStatus.type === 'none' ? undefined : deleteStatus.files;
    const deleteStatusValueRef = useLatest(deleteStatusValue);
    const setPathState = useSetAtom(pathStateAtom);
    const foldersDeletingOnNextRootFolderUpdate = useSetAtom(
        foldersDeletingOnNextRootFolderUpdateAtom,
    );
    const { notification } = App.useApp();

    React.useEffect(() => {
        if (isDeleting) {
            return;
        }
        if (deleteStatus.type !== 'deleting') {
            if (hasDeleted) {
                setHasDeleted(false);
            }
            return;
        }
        const fileToDelete = deleteStatusValueRef.current?.find(file => file.status === 'waiting');
        if (fileToDelete == null) {
            setDeleteStatus(oldValue => {
                return {
                    type: 'finished',
                    files: oldValue.type === 'none' ? [] : oldValue.files,
                    folders: oldValue.type === 'none' ? [] : oldValue.folders,
                };
            });
            notification.info({
                placement: 'bottomRight',
                message: 'ファイルの削除が完了しました。',
            });
            onDeleteRef.current?.(
                deleteStatusValueRef.current?.map(file => ({
                    path: new Node(file.file).path,
                    id: file.file.id,
                })) ?? [],
            );
            foldersDeletingOnNextRootFolderUpdate(oldState => {
                if (deleteStatusRef.current.type === 'none') {
                    return oldState;
                }
                return [...oldState, ...deleteStatusRef.current.folders];
            });
            return;
        }

        const setFileStatus = (file: FileToDelete, newValue: FileToDelete['status']) => {
            setDeleteStatus(oldValue => {
                if (oldValue.type === 'none') {
                    return oldValue;
                }
                const index = oldValue.files.findIndex(
                    oldFile => oldFile.file.key === file.file.key,
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
            .catch((e: unknown) => {
                notification.error({
                    placement: 'bottomRight',
                    message: 'ファイルの削除に失敗しました。',
                    description: joinPath(new Node(fileToDelete.file).path).string,
                });
                loggerRef.autoDetectObj.error(e, 'ファイルの削除に失敗しました。');
                setFileStatus(fileToDelete, 'error');
                setIsDeleting(false);
            });
    }, [
        deleteStatus.type,
        deleteStatusRef,
        deleteStatusValueRef,
        hasDeleted,
        isDeleting,
        onDeleteRef,
        setDeleteStatus,
        foldersDeletingOnNextRootFolderUpdate,
        setPathState,
        notification,
    ]);
};

const useStartAutoRenameFiles = () => {
    const onRename = useAtomSelector(propsAtom, props => props?.onRename);
    const onRenameRef = useLatest(onRename);
    const [renameStatus, setRenameStatus] = useAtom(renameStatusAtom);
    const renameStatusRef = useLatest(renameStatus);
    const [isRenaming, setIsRenaming] = React.useState(false);
    const [hasRenamed, setHasRenamed] = React.useState(false);
    const renameStatusValue = renameStatus.type === 'none' ? undefined : renameStatus.files;
    const renameStatusValueRef = useLatest(renameStatusValue);
    const setPathState = useSetAtom(pathStateAtom);
    const setDeletingFoldersOnNextRootFolderUpdate = useSetAtom(
        foldersDeletingOnNextRootFolderUpdateAtom,
    );
    const { notification } = App.useApp();

    React.useEffect(() => {
        if (isRenaming) {
            return;
        }
        if (renameStatus.type !== 'renaming') {
            if (hasRenamed) {
                setHasRenamed(false);
            }
            return;
        }
        const fileToRename = renameStatusValueRef.current?.find(file => file.status === 'waiting');
        if (fileToRename == null) {
            setRenameStatus(oldValue => {
                return {
                    type: 'finished',
                    files: oldValue.type === 'none' ? [] : oldValue.files,
                    folders: oldValue.type === 'none' ? [] : oldValue.folders,
                };
            });
            notification.info({
                placement: 'bottomRight',
                message: 'ファイルの移動もしくはリネームが完了しました。',
            });

            onRenameRef.current?.(
                renameStatusValueRef.current?.map(file => ({
                    id: file.file.id,
                    oldPath: new Node(file.file).path,
                    currentPath: file.newPath,
                })) ?? [],
            );
            setPathState(pathState => {
                return pathState.resetCutState();
            });
            setDeletingFoldersOnNextRootFolderUpdate(oldState => {
                if (renameStatusRef.current.type === 'none') {
                    return oldState;
                }
                return [
                    ...oldState,
                    ...renameStatusRef.current.folders.map(x => ({ path: x.currentPath })),
                ];
            });
            return;
        }

        const setFileStatus = (file: FileToRename, newValue: FileToRename['status']) => {
            setRenameStatus(oldValue => {
                if (oldValue.type === 'none') {
                    return oldValue;
                }
                const index = oldValue.files.findIndex(
                    oldFile => oldFile.file.key === file.file.key,
                );
                if (index < 0) {
                    return oldValue;
                }
                return produce(oldValue, oldValue => {
                    oldValue.files[index]!.status = newValue;
                });
            });
        };

        setIsRenaming(true);
        setFileStatus(fileToRename, 'renaming');
        const onRename = () => {
            if (fileToRename.file.onMoveOrRename == null) {
                return Promise.resolve(undefined);
            }
            return fileToRename.file.onMoveOrRename({
                currentPath: new Node(fileToRename.file).path,
                newPath: fileToRename.newPath,
            });
        };
        onRename()
            .then(() => {
                setFileStatus(fileToRename, 'renamed');
                setHasRenamed(true);
                setIsRenaming(false);
            })
            .catch((e: unknown) => {
                notification.error({
                    placement: 'bottomRight',
                    message: 'ファイルのリネームに失敗しました。',
                    description: joinPath(new Node(fileToRename.file).path).string,
                });
                loggerRef.autoDetectObj.error(e, 'ファイルのリネームに失敗しました。');
                setFileStatus(fileToRename, 'error');
                setIsRenaming(false);
            });
    }, [
        renameStatus.type,
        renameStatusValueRef,
        hasRenamed,
        isRenaming,
        onRenameRef,
        setRenameStatus,
        setPathState,
        renameStatusRef,
        setDeletingFoldersOnNextRootFolderUpdate,
        notification,
    ]);
};

const FileBrowserWithoutJotaiProvider: React.FC<Props> = props => {
    useStartAutoDeleteFiles();
    useStartAutoRenameFiles();

    const foldersDeletingOnNextRootFolderUpdate = useAtomValue(
        foldersDeletingOnNextRootFolderUpdateAtom,
    );

    const setProps = useSetAtom(propsAtom);
    React.useEffect(() => {
        setProps(props);
    }, [props, setProps]);

    const defaultFileTypeFilterProp = props.fileTypes?.defaultFileTypeFilter ?? null;
    const setFileFilter = useSetAtom(fileTypeFilterAtom);
    React.useEffect(() => {
        setFileFilter(defaultFileTypeFilterProp);
    }, [defaultFileTypeFilterProp, setFileFilter]);

    const setPathState = useSetAtom(pathStateAtom);

    useDeepCompareEffect(() => {
        setPathState(pathState => pathState.updateEnsuredFolders(props.ensuredFolderPaths));
    }, [setPathState, props.ensuredFolderPaths]);

    useDeepCompareEffect(() => {
        setPathState(pathState => pathState.updateOverridingElements(props.overridingElements));
    }, [setPathState, props.overridingElements]);

    React.useEffect(() => {
        setPathState(pathState => {
            let newPathState = pathState.updateRootFolder(props.files);
            for (const folder of foldersDeletingOnNextRootFolderUpdate) {
                newPathState = newPathState.deleteFolderIfEmpty(folder.path) ?? newPathState;
            }
            return newPathState;
        });
    }, [foldersDeletingOnNextRootFolderUpdate, props.files, setPathState]);

    return (
        <div
            className={classNames(flex, flexColumn)}
            style={mergeStyles(
                { gap: columnGap, height: props.height ?? defaultHeight },
                props.style,
            )}
        >
            <ActionBar />
            <AddressBar />
            <NodesGrid />
            <DeleteConfirmModal />
            <RenameConfirmModal />
            <RenameInputModal />
            <CreateFolderModal />
        </div>
    );
};

/** 汎用的なファイルブラウザー（ファイルマネージャ）です。 */
export const FileBrowser: React.FC<Props> = props => {
    return (
        <JotaiStoreContext.Provider value={props.jotaiStore}>
            <FileBrowserWithoutJotaiProvider {...props} />
        </JotaiStoreContext.Provider>
    );
};
