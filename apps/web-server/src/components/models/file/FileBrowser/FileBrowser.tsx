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
    DualKeyMap,
    MultiKeyMap,
    MultiValueSet,
    arrayEquals,
    both,
    groupJoinArray,
    keyNames,
    left,
    right,
    toBeNever,
} from '@flocon-trpg/utils';
import { Provider, atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import produce from 'immer';
import { DialogFooter } from '@/components/ui/DialogFooter/DialogFooter';
import { useLatest } from 'react-use';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { Option } from '@kizahasi/option';
import { joinPath } from '@flocon-trpg/core';
import { mergeStyles } from '@/utils/mergeStyles';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { Result } from '@kizahasi/result';

export const image = 'image';
export const sound = 'sound';
export const text = 'text';
export const others = 'others';
const file = 'file';
const folder = 'folder';
const virtualFolder = 'virtualFolder';

const none = '__none__';

const columnGap = '4px 0';

type Path = {
    path: readonly string[];

    /** ファイルの場合は`FilePathBase.id`と等しい値です。ファイル以外の場合は常にundefinedとなります。 */
    id: string | undefined;
};

type NameIdPair = {
    name: string;

    id: string | undefined;
};

type FilePathBase = {
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

type EnsuredVirtualFolderPath = {
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

    /** ファイルのリネーム処理が完了したときにトリガーされます。複数のファイルがリネームされるときは、最後のファイルがリネームされたときにトリガーされます。 */
    onRename?: () => void;

    canMove: (
        /** 例えば`folder1`というフォルダに`a.png`と`b.png`と`c.png`というファイルがあってこれらのうち`a.png`と`b.png`のみを`folder2`フォルダに移動しようとした場合、`currentDirectoryPath`は`['folder1']`、newDirectoryPathは`['folder2']`となります。ファイル名が`a.png`と`b.png`であるという情報の取得は、現時点では必要とされていないためサポートしていません。 */ params: {
            currentDirectoryPath: readonly string[];

            /** cutの際はnullに、pasteの際はnon-nullになります。 */
            newDirectoryPath: readonly string[] | null;
        }
    ) => Result<void>;

    canRename: (params: {
        directoryPath: readonly string[];

        oldName: string;

        /** ユーザーがrenameを開始しようとした際はnullに、新しい名前を決めた際はnon-nullになります。 */
        newName: string | null;

        nodeType: Node['type'];
    }) => Result<void>;

    canCreateTempVirtualFolder: (params: {
        directoryPath: readonly string[];

        foldername: string;
    }) => Result<void>;

    /** trueが返されたファイルパスでは、ファイルおよびフォルダの作成とリネームと移動と削除などが無効化されます。 */
    isProtected: IsProtected;

    onFileCreate: (absolutePath: readonly string[]) => void;

    fileCreateLabel: string;

    /** 検索バーのplaceholderを設定します。 */
    searchPlaceholder: string;

    /** ファイルの有無にかかわらず、常に表示するフォルダを指定できます。 */
    ensuredVirtualFolderPaths: readonly EnsuredVirtualFolderPath[];
};

const defaultProps: Props = {
    files: [],
    height: null,
    isProtected: () => false,
    onFileCreate: () => undefined,
    ensuredVirtualFolderPaths: [],
    fileCreateLabel: '(fileCreateLabel)',
    searchPlaceholder: '(searchPlaceholder)',
    canMove: () => Result.error('(defaultProps)'),
    canRename: () => Result.error('(defaultProps)'),
    canCreateTempVirtualFolder: () => Result.error('(canCreateTempVirtualFolder)'),
};

type FilePathNode = FilePathBase & {
    type: typeof file;

    key: string;

    /** FilePath.path から `''` の要素を取り除いたものと等しいです。*/
    path: readonly string[];

    /** ファイルがあるパス。ファイル名の部分は含みません。*/
    folderPath: readonly string[];

    /** ファイル名。 */
    name: string;
};

type FolderMap = MultiKeyMap<
    string,
    {
        /** 1つ目のkeyはnameと等しく、2つ目はidと等しくなります。 */
        files: DualKeyMap<string, string | undefined, FilePathNode>;
    }
>;

type Folder = {
    type: typeof folder;
    multiKeyMap: FolderMap;
    key: string;
    name: string;
};

/** ユーザーによって作成された仮想フォルダ。FilePathBase.pathのみでは空のフォルダが表現できないため、代わりにこれを用います。*/
// 一時的な仮想フォルダであり、また通常のファイルやフォルダと比べて消えたときの悪影響が小さいため、コンポーネントのunmountなどのタイミングで自動的に消えることがあります。
type TempVirtualFolder = {
    type: typeof virtualFolder;

    /** フォルダがあるパス。フォルダ名の部分は含みません。*/
    folderPath: readonly string[];

    /** フォルダ名。*/
    name: string;
};

type VirtualFolderNode = TempVirtualFolder & {
    key: string;

    // TempVirtualFolder由来の場合は常にundefinedになる
    header: React.ReactNode;
};

class Node {
    constructor(readonly source: FilePathNode | Folder | VirtualFolderNode) {}

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
        switch (this.source.type) {
            case virtualFolder:
                return this.source.folderPath;
            case folder:
                return this.source.multiKeyMap.absolutePath;
            case file:
                return this.source.folderPath;
        }
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

    /** temp virtual folderのrenameに用いられます。temp virtual folderでないfolderの場合は無視されます。 */
    tempVirtualFolders: readonly { path: readonly string[] }[];
};

type DeleteStatus =
    | {
          type: 'none';
      }
    | {
          type: 'deleting' | 'aborted' | 'finished';
          files: readonly FileToDelete[];
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

    /** temp virtual folderのrenameに用いられます。temp virtual folderでないfolderの場合は無視されます。 */
    tempVirtualFolders: readonly { currentPath: readonly string[]; newPath: readonly string[] }[];
};

type RenameStatus =
    | {
          type: 'none';
      }
    | {
          type: 'renaming' | 'aborted' | 'finished';
          files: readonly FileToRename[];
      }
    | AskingRenameStatus;

type PathStateBase = {
    rootFolder: FolderMap;

    // 要素はabsolute path
    currentDirectory: readonly string[];

    isMultipleSelectMode: boolean;

    // 要素はabsolute path
    tempVirtualFolders: DeletableTree<string, undefined>;

    ensuredVirtualFolders: DeletableTree<string, Omit<EnsuredVirtualFolderPath, 'path'>>;

    // 現在のcurrentDirectoryにおいて選択されているファイルおよびフォルダの名前。virtual folderにも対応している。
    // selectedFilesは、first keyがnameでsecond keyがid。
    selectedFiles: DualKeyMap<string, string | undefined, undefined>;
    selectedFolders: ReadonlySet<string>;

    // cutされたファイルおよびフォルダの名前。virtual folderにも対応している。
    // cutFilesは、first keyがnameでsecond keyがid。
    cutFiles: DualKeyMap<string, string | undefined, undefined>;
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
        const newTempVirtualFolders = members.tempVirtualFolders.clone();
        // 通常のフォルダが存在するため、必要なくなったtemp virtual folderをすべて削除する処理
        for (const { absolutePath } of members.tempVirtualFolders.traverse()) {
            if (members.rootFolder.get(absolutePath) == null) {
                newTempVirtualFolders.ensure(
                    absolutePath,
                    () => undefined,
                    () => undefined
                );
            }
        }
        members.tempVirtualFolders = newTempVirtualFolders;

        Object.freeze(members);
    }

    static init(): PathState {
        return new PathState({
            rootFolder: new MultiKeyMap(),
            currentDirectory: [],
            isMultipleSelectMode: false,
            tempVirtualFolders: new DeletableTree(),
            ensuredVirtualFolders: new DeletableTree(Option.some({})),
            selectedFiles: new DualKeyMap(),
            selectedFolders: new Set(),
            cutFiles: new DualKeyMap(),
            cutFolders: new Set(),
            cutAt: [],
        });
    }

    deleteTempVirtualFolderRecursively(path: readonly string[]) {
        const newValue = this.members.tempVirtualFolders.clone();
        newValue.delete(path);
        return new PathState({ ...this.members, tempVirtualFolders: newValue });
    }

    renameTempVirtualFolderRecursively(currentPath: readonly string[], newPath: readonly string[]) {
        const newValue = this.members.tempVirtualFolders.clone();
        for (const tempVirtualFolder of this.members.tempVirtualFolders
            .createSubTree(currentPath, () => undefined)
            .traverse()) {
            newValue.delete(tempVirtualFolder.absolutePath);
            newValue.ensure(
                newPath,
                () => undefined,
                () => undefined
            );
        }
        return new PathState({ ...this.members, tempVirtualFolders: newValue });
    }

    updateRootFolder(files: readonly FilePath[]) {
        const rootFolder = new MultiKeyMap<
            string,
            {
                files: DualKeyMap<string, string | undefined, FilePathNode>;
            }
        >();
        for (const filePath of files) {
            const directory = [...joinPath(filePath.path).array];
            const filename = directory.pop();
            if (filename == null) {
                throw new Error('This should not happen.');
            }
            const folderNode = rootFolder.ensure(directory, () => ({
                files: new DualKeyMap(),
            }));
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
                    folderPath: directory,
                    path: joinPath(filePath.path).array,
                }
            );
        }
        return new PathState({ ...this.members, rootFolder });
    }

    updateEnsuredVirtualFolders(
        ensuredVirtualFolders: readonly EnsuredVirtualFolderPath[]
    ): PathState {
        const newValue = new DeletableTree<string, Omit<EnsuredVirtualFolderPath, 'path'>>();
        for (const path of ensuredVirtualFolders) {
            newValue.ensure(
                joinPath(path.path).array,
                () => path,
                () => ({})
            );
        }
        return new PathState({ ...this.members, ensuredVirtualFolders: newValue });
    }

    createNodes() {
        let currentFolderMap: FolderMap = this.members.rootFolder;
        for (const dir of this.members.currentDirectory) {
            currentFolderMap = currentFolderMap.createSubMap([dir]);
        }

        const fileNodes = currentFolderMap.get([])?.files ?? new DualKeyMap();
        const folderNodes = [...currentFolderMap.getChildren()].flatMap(([, $folder]) => {
            let hasFile = false;
            for (const node of $folder.traverse()) {
                if (node.value.files.size >= 1) {
                    hasFile = true;
                    break;
                }
            }
            // これがないと、vitrualFolderを開いたときにFolderMapにもvirtualFolderと同じフォルダが追加されてしまう。
            if (!hasFile) {
                return [];
            }
            const name = $folder.absolutePath[$folder.absolutePath.length - 1] ?? '';
            return [
                {
                    type: folder,
                    multiKeyMap: $folder,
                    key: joinPath($folder.absolutePath).string + '@FileBrowser@Folder',
                    name,
                    absolutePath: $folder.absolutePath,
                } as const,
            ];
        });

        const virtualFolderNodes = new MultiKeyMap<string, VirtualFolderNode>();
        for (const [name, $folder] of this.members.tempVirtualFolders
            .createSubTree(this.members.currentDirectory, () => undefined)
            .getChildren()) {
            if (folderNodes.some(f => arrayEquals(f.absolutePath, $folder.absolutePath))) {
                continue;
            }

            const key = $folder.absolutePath.reduce(
                (seed, elem) => `${seed}/${elem}`,
                'FileBrowser@VirtualFolder/'
            );

            const folderPath = [...$folder.absolutePath];
            folderPath.pop();

            virtualFolderNodes.set($folder.absolutePath, {
                type: virtualFolder,
                folderPath: folderPath,
                key,
                name,
                header: undefined,
            } as const);
        }
        for (const [name, $folder] of this.members.ensuredVirtualFolders
            .createSubTree(this.members.currentDirectory, () => ({}))
            .getChildren()) {
            if (folderNodes.some(f => arrayEquals(f.absolutePath, $folder.absolutePath))) {
                continue;
            }

            const key = $folder.absolutePath.reduce(
                (seed, elem) => `${seed}/${elem}`,
                'FileBrowser@VirtualFolder/'
            );

            const folderPath = [...$folder.absolutePath];
            folderPath.pop();

            // tempVirtualFolders→ensuredVirtualFolders の順に処理することによって、tempVirtualFoldersとensuredVirtualFoldersで重複しているフォルダは後者が優先されるようにしている。
            virtualFolderNodes.set($folder.absolutePath, {
                type: virtualFolder,
                folderPath,
                key,
                name,
                header: $folder.value.value?.header,
            } as const);
        }

        const nodes: Node[] = [
            ...fileNodes.toArray().map(([, value]) => new Node(value)),
            ...folderNodes.map(value => new Node(value)),
            ...[...virtualFolderNodes.traverse()].map(({ value }) => new Node(value)),
        ];
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
    }

    tryGetEnsuredVirtualFolder(path: readonly string[]) {
        return this.members.ensuredVirtualFolders.get(path);
    }

    #setFileSelected(filename: NameIdPair) {
        const newValue = this.members.selectedFiles.clone();
        newValue.set({ first: filename.name, second: filename.id }, undefined);
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
            newValue.set(mapKey, undefined);
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

    addTempVirtualFolder(newValue: TempVirtualFolder) {
        const tempVirtualFolders = this.members.tempVirtualFolders.clone();
        tempVirtualFolders.ensure(
            [...newValue.folderPath, newValue.name],
            () => undefined,
            () => undefined
        );
        return new PathState({ ...this.members, tempVirtualFolders });
    }

    #virtualFoldersCache: DeletableTree<string, Omit<EnsuredVirtualFolderPath, 'path'>> | null =
        null;
    get virtualFolders() {
        if (this.#virtualFoldersCache == null) {
            const newValue = new DeletableTree<string, Omit<EnsuredVirtualFolderPath, 'path'>>();
            for (const elem of this.members.tempVirtualFolders.traverse()) {
                newValue.ensure(
                    elem.absolutePath,
                    () => ({}),
                    () => ({})
                );
            }
            for (const elem of this.members.ensuredVirtualFolders.traverse()) {
                newValue.ensure(
                    elem.absolutePath,
                    () => elem.value,
                    () => ({})
                );
            }
            this.#virtualFoldersCache = newValue;
        }
        return this.#virtualFoldersCache;
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

        if (nodeSource.type === folder || nodeSource.type === virtualFolder) {
            return this.cd(oldValue => {
                const newValue = [...oldValue];
                newValue.push(nodeSource.name);
                return newValue;
            });
        }

        if (nodeSource.onSelect == null) {
            nodeSource.onOpen && nodeSource.onOpen();
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
                case virtualFolder:
                    folders.add(node.path);
                    continue;
                case folder:
                    folders.add(node.path);
                    continue;
                case file:
                    files.set([...node.source.path, node.id], node.source);
                    continue;
                default:
                    toBeNever(node.source);
            }
        }
        return {
            files: [...files.traverse()].map(({ value }) => ({
                path: value.path,
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
            this.members.rootFolder.get(directoryPath)?.files.forEach(elem => {
                if (elem.name === filename && elem.id === file.id) {
                    result.add(elem);
                }
            });
        }

        for (const folder of folders) {
            for (const { value } of this.members.rootFolder.createSubMap(folder.path).traverse()) {
                value.files.forEach(file => result.add(file));
            }
        }

        return [...result];
    }

    listSelectedTempFolders() {
        const result: { path: readonly string[] }[] = [];
        for (const selectedFoldername of this.members.selectedFolders) {
            const selectedFolderPath = [...this.members.currentDirectory, selectedFoldername];
            const selectedTempFolder = this.members.tempVirtualFolders.get(selectedFolderPath);
            if (selectedTempFolder.isNone) {
                continue;
            }
            if (this.members.rootFolder.get(selectedFolderPath) != null) {
                continue;
            }
            result.push({ path: selectedFolderPath });
        }
        return result;
    }

    isCut(node: Node) {
        if (!arrayEquals(this.members.cutAt, this.currentDirectory)) {
            return false;
        }
        switch (node.type) {
            case virtualFolder:
            case folder:
                return this.members.cutFolders.has(node.name);
            case file:
                return this.members.cutFiles.has({ first: node.name, second: node.id });
            default:
                toBeNever(node.type);
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

    canToggleMultipleSelectMode(props: Props) {
        return !this.isCurrentDirectoryProtected(props);
    }

    toggleMultipleSelectMode(): PathState {
        return new PathState({
            ...this.members,
            isMultipleSelectMode: !this.members.isMultipleSelectMode,
        });
    }

    canCut(props: Props) {
        return (
            !this.isCurrentDirectoryProtected(props) &&
            props.canMove({ currentDirectoryPath: this.currentDirectory, newDirectoryPath: null })
        );
    }

    cutOne(props: Props, node: Node): PathState {
        if (!this.canCut(props)) {
            return this;
        }

        const newCutFiles = new DualKeyMap<string, string | undefined, undefined>();
        const newCutFolders = new Set<string>();
        switch (node.type) {
            case file: {
                newCutFiles.set({ first: node.name, second: node.id }, undefined);
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
        if (!this.canCut(props)) {
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

    canCreateFile(props: Props) {
        return !this.isCurrentDirectoryProtected(props);
    }

    createFile(props: Props) {
        if (!this.canCreateFile(props)) {
            return;
        }
        props.onFileCreate && props.onFileCreate(this.members.currentDirectory);
    }

    #requestDeleting(source: readonly FilePathNode[]): FileToDelete[] {
        return source
            .map(file => ({ status: 'waiting', file } as const))
            .sort((x, y) => {
                for (const group of groupJoinArray(x.file.path, y.file.path)) {
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

    canRequestDeleting(props: Props, node: Node) {
        return !props.isProtected(node.folderPath);
    }

    requestDeleting(props: Props, node: Node): AskingDeleteStatus | null {
        if (!this.canRequestDeleting(props, node)) {
            return null;
        }
        const source = this.listFiles(this.toPathList([node]));
        return {
            type: 'asking',
            files: this.#requestDeleting(source),
            tempVirtualFolders: node.type === virtualFolder ? [{ path: node.path }] : [],
        };
    }

    canRequestDeletingSelectedNodes(props: Props) {
        return !props.isProtected(this.currentDirectory);
    }

    requestDeletingSelectedNodes(props: Props): AskingDeleteStatus | null {
        if (!this.canRequestDeletingSelectedNodes(props)) {
            return null;
        }
        const source = this.listFiles(this.selectedPaths);
        const files = this.#requestDeleting(source);
        return {
            type: 'asking',
            files,
            tempVirtualFolders: this.selectedPaths.folders,
        };
    }

    canRequestPasting(props: Props, destDirectoryPath: readonly string[]) {
        return props.canMove({
            currentDirectoryPath: this.members.cutAt,
            newDirectoryPath: destDirectoryPath,
        });
    }

    requestPasting(props: Props, destFolderPath: readonly string[]): AskingRenameStatus | null {
        if (!this.canRequestPasting(props, destFolderPath)) {
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
                    nodePath: file.path,
                    cutAt: this.members.cutAt,
                    destFolderPath,
                }),
            };
        });
        return {
            type: 'asking',
            files,
            tempVirtualFolders: [...this.members.cutFolders].map(foldername => {
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

    canRequestRenaming(props: Props, node: Node, newName: string | null) {
        return props.canRename({
            directoryPath: node.folderPath,
            oldName: node.name,
            newName,
            nodeType: node.type,
        });
    }

    requestRenaming(
        props: Props,
        node: Node,
        newName: string
    ): AskingRenameStatus | { type: 'executed'; newState: PathState } | null {
        if (!this.canRequestRenaming(props, node, newName)) {
            return null;
        }
        const destPath = [...node.folderPath, newName];
        if (node.source.type === virtualFolder) {
            const newState = this.renameTempVirtualFolderRecursively(node.path, destPath);
            return { type: 'executed', newState };
        }
        const files: FileToRename[] = this.listFiles(this.toPathList([node])).map(file => ({
            status: 'waiting',
            file,
            newPath: destPath,
        }));
        return {
            type: 'asking',
            files,

            // この関数を実行した際、tempVirtualFolderは全てリネーム済みのため、[]を渡している。
            tempVirtualFolders: [],
        };
    }
}

const pathStateAtom = atom(PathState.init());
const propsAtom = atom<Props>(defaultProps);
const deleteStatusAtom = atom<DeleteStatus>({ type: 'none' });
const renameStatusAtom = atom<RenameStatus>({ type: 'none' });
const fileTypeFilterAtom = atom<string | null>(null);
const fileNameFilterAtom = atom<string>('');

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
    const isLocked = useAtomValue(isProtectedAtom);
    const setVisible = useSetAtom(isModalToCreateFolderVisibleAtom);

    return React.useMemo(
        () => ({
            disabled: isLocked,
            showModal: () => setVisible(true),
        }),
        [isLocked, setVisible]
    );
};

const useTrySetDeleteStatusAsAsking = () => {
    const [deleteStatus, setDeleteStatus] = useAtom(deleteStatusAtom);
    const setIsModalVisible = useSetAtom(isDeleteConfirmModalVisibleAtom);

    return React.useCallback(
        (askingDeleteStatus: AskingDeleteStatus) => {
            if (deleteStatus.type === 'deleting') {
                notification.warn({
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
        [deleteStatus.type, setDeleteStatus, setIsModalVisible]
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
        [pathState, props]
    );

    const execute = React.useCallback(
        (node: Node) => {
            const newStatus = pathState.requestDeleting(props, node);
            if (newStatus == null) {
                return;
            }
            setAsAsking(newStatus);
        },
        [pathState, props, setAsAsking]
    );

    return React.useMemo(
        () => ({
            execute,
            canExecute,
        }),
        [execute, canExecute]
    );
};

const useTrySetRenameStatusAsAsking = () => {
    const [renameStatus, setRenameStatus] = useAtom(renameStatusAtom);
    const setIsModalVisible = useSetAtom(isRenameConfirmModalVisibleAtom);

    return React.useCallback(
        (askingRenameStatus: AskingRenameStatus) => {
            if (renameStatus.type === 'renaming') {
                notification.warn({
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
        [renameStatus.type, setRenameStatus, setIsModalVisible]
    );
};

const useRequestPastingAction = () => {
    const props = useAtomValue(propsAtom);
    const setAsAsking = useTrySetRenameStatusAsAsking();
    const [pathState, setPathState] = useAtom(pathStateAtom);

    const canExecute = React.useCallback(
        (
            /** 貼り付け先のフォルダを指定できます。指定せず、current directoryに貼り付ける場合はnullを渡します。virtual folderにも対応しています。 */
            targetFolder: string | null
        ) => {
            const destPath =
                targetFolder == null
                    ? pathState.currentDirectory
                    : [...pathState.currentDirectory, targetFolder];
            return pathState.canRequestPasting(props, destPath);
        },
        [pathState, props]
    );

    const execute = React.useCallback(
        (
            /** 貼り付け先のフォルダを指定できます。指定せず、current directoryに貼り付ける場合はnullを渡します。virtual folderにも対応しています。 */
            targetFolder: string | null
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
        [pathState, props, setAsAsking, setPathState]
    );

    return React.useMemo(
        () => ({
            execute,
            canExecute,
        }),
        [execute, canExecute]
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
        [pathState, props]
    );

    const execute = React.useCallback(
        (node: Node, newName: string) => {
            const newStatus = pathState.requestRenaming(props, node, newName);
            setPathState(pathState => pathState.unselect());
            if (newStatus == null) {
                return;
            }
            if (newStatus.type === 'executed') {
                setPathState(newStatus.newState);
                return;
            }
            setAsAsking(newStatus);
        },
        [pathState, props, setAsAsking, setPathState]
    );

    return React.useMemo(
        () => ({
            execute,
            canExecute,
        }),
        [execute, canExecute]
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

const AddressBar: React.FC = () => {
    const [pathState, setPathState] = useAtom(pathStateAtom);
    const searchPlaceholder = useAtomSelector(propsAtom, props => props.searchPlaceholder);
    const currentDirectory = React.useMemo(
        () => pathState.currentDirectory,
        [pathState.currentDirectory]
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
                size='small'
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
                    <div>{joinPath(item.file.path).string}</div>
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
                    message = '削除するファイルやフォルダが見つかりませんでした。';
                } else {
                    message = `次の${deleteStatus.files.length}個のファイルを削除しますか？(空のフォルダはリストに表示されませんが、あわせて削除されます)`;
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
                        if (deleteStatus.type === 'asking') {
                            setPathState(pathState => {
                                let newPathState = pathState;
                                for (const { path } of deleteStatus.tempVirtualFolders) {
                                    newPathState =
                                        pathState.deleteTempVirtualFolderRecursively(path);
                                }
                                return newPathState;
                            });
                        }
                        setDeleteStatus(() => {
                            return {
                                type: 'deleting',
                                files: deleteStatus.files,
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
        if (!canClose) {
            return;
        }
        setDeleteStatus(() => ({ type: 'none' }));
        setIsModalVisible(false);
    };
    return (
        <Modal
            visible={isModalVisible}
            title='削除の確認'
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
                        {joinPath(item.file.path).string} → {joinPath(item.newPath).string}
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
                    message = `次の${renameStatus.files.length}個のファイルを移動もしくはリネームしますか？（空のフォルダは表示されませんが、あわせて移動もしくはリネームされます）`;
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
                <Button style={buttonStyle} type='primary' danger disabled>
                    移動/リネーム
                </Button>
            );
            break;
        case 'asking':
        case 'aborted':
            button = (
                <Button
                    style={buttonStyle}
                    type='primary'
                    disabled={renameStatus.files.length === 0}
                    onClick={() => {
                        if (renameStatus.type === 'asking') {
                            setPathState(pathState => {
                                let newPathState = pathState;
                                for (const {
                                    currentPath,
                                    newPath,
                                } of renameStatus.tempVirtualFolders) {
                                    newPathState = pathState.renameTempVirtualFolderRecursively(
                                        currentPath,
                                        newPath
                                    );
                                }
                                return newPathState;
                            });
                        }
                        setRenameStatus(() => {
                            return {
                                type: 'renaming',
                                files: renameStatus.files,
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
                        setRenameStatus(() => ({ type: 'aborted', files: renameStatus.files }));
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
            visible={isModalVisible}
            title='移動、リネームの確認'
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
            visible={state != null}
            title='リネーム'
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
            props.canCreateTempVirtualFolder({
                directoryPath: pathState.currentDirectory,
                foldername,
            }).error,
        [foldername, pathState.currentDirectory, props]
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
            pathState.addTempVirtualFolder({
                type: virtualFolder,
                folderPath: pathState.currentDirectory,
                name: foldername,
            })
        );
        setFoldername('');
        setVisible(false);
    };

    return (
        <Modal
            visible={visible}
            title='新しいフォルダの作成'
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
                <div>
                    新しく作るフォルダの名前を入力してください。
                    <br />
                    ファイルが1つもない空のフォルダは、ブラウザを閉じた際などに自動的に消去されます。ファイルおよびファイルにアクセスするために必要なフォルダが自動的に消去されることはありません。
                </div>
                <Input
                    ref={inputRef}
                    placeholder='フォルダ名'
                    value={foldername}
                    onChange={e => setFoldername(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            onOk();
                        }
                    }}
                />
                {foldernameError != null && (
                    <Alert type='error' showIcon message={foldernameError} />
                )}
            </div>
        </Modal>
    );
};

const cellFileStyle: React.CSSProperties = {
    maxWidth: 80,
    height: 60,
    maxHeight: 70,
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
                justifyItemsCenter
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

    let menuItems: ItemType[];
    if (node == null) {
        const selectedItemsMenu: ItemType[] = pathState.isSelectedAny
            ? [
                  {
                      key: createMenuKey('選択されているファイルを切り取り'),
                      label: '選択されているファイルを切り取り',
                      disabled: !pathState.canCut(props),
                      onClick: () => {
                          setPathState(pathState => pathState.cutSelected(props));
                      },
                  },
                  {
                      key: createMenuKey('選択されているファイルをすべて削除'),
                      label: '選択されているファイルをすべて削除',
                      disabled: !requestDeletingSelectedNodesAction.canExecute,
                      onClick: () => {
                          requestDeletingSelectedNodesAction.execute();
                      },
                  },
                  { type: 'divider' },
              ]
            : [];
        menuItems = [
            ...selectedItemsMenu,
            {
                key: createMenuKey('fileCreateLabel'),
                label: props.fileCreateLabel,
                disabled: !pathState.canCreateFile(props),
                onClick: () => {
                    props.onFileCreate(pathState.currentDirectory);
                },
            },
            {
                key: createMenuKey('フォルダを作成'),
                label: 'フォルダを作成',
                disabled: createFolderAction.disabled,
                onClick: () => {
                    createFolderAction.showModal();
                },
            },
            pathState.isCutAny
                ? {
                      key: createMenuKey('貼り付け'),
                      label: '貼り付け',
                      disabled: requestPastingAction.canExecute(null).isError,
                      onClick: () => {
                          requestPastingAction.execute(null);
                      },
                  }
                : null,
        ];
    } else {
        menuItems = [
            {
                key: createMenuKey('選択'),
                label: '選択',
                onClick: () => setPathState(pathState.select(props, node)),
            },
            node.source.type === folder ||
            node.source.type === virtualFolder ||
            node.source.onOpen == null
                ? null
                : {
                      key: createMenuKey('開く'),
                      label: '開く',
                      onClick: node.source.onOpen,
                  },
            node.source.type === folder ||
            node.source.type === virtualFolder ||
            node.source.onClipboard == null
                ? null
                : {
                      key: createMenuKey('コマンドに使用するリンクとしてクリップボードにコピー'),
                      label: 'コマンドに使用するリンクとしてクリップボードにコピー',
                      onClick: node.source.onClipboard,
                  },
            {
                key: createMenuKey('切り取り'),
                label: '切り取り',
                disabled: !pathState.canCut(props),
                onClick: () => {
                    setPathState(pathState => pathState.cutOne(props, node).unselect());
                },
            },
            pathState.isCutAny && node.type !== file
                ? {
                      key: createMenuKey('貼り付け'),
                      label: '貼り付け',
                      disabled: requestPastingAction.canExecute(node.name).isError,
                      onClick: () => {
                          requestPastingAction.execute(node.name);
                      },
                  }
                : null,
            {
                key: createMenuKey('リネーム'),
                label: 'リネーム',
                disabled: requestRenamingAction.canExecute(node, null).isError,
                onClick: () => {
                    setRenameInputModal({
                        currentName: node.name,
                        onOk: newName => requestRenamingAction.execute(node, newName),
                        canOk: newName => !requestRenamingAction.canExecute(node, newName).isError,
                    });
                },
            },
            {
                key: createMenuKey('削除'),
                label: '削除',
                disabled: !requestDeletingNodeAction.canExecute(node),
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
        case folder:
        case virtualFolder: {
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
                        height: 30,
                        textOverflow: 'ellipsis',
                    }}
                >
                    <Tooltip title={node.name} placement='bottom'>
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

    const ensuredVirtualFolder = React.useMemo(() => {
        return pathState.tryGetEnsuredVirtualFolder(pathState.currentDirectory);
    }, [pathState]);

    const header: React.ReactNode = ensuredVirtualFolder.isNone
        ? undefined
        : ensuredVirtualFolder.value.header;

    let main: JSX.Element;
    if (nodes.length === 0) {
        main = (
            <div style={{ padding: 4, fontSize: '1.3rem', height: '100%', backgroundColor }}>
                このフォルダには、フォルダおよびファイルがありません。
            </div>
        );
    } else if (filteredNodes.length === 0) {
        main = (
            <div style={{ padding: 4, fontSize: '1.3rem', height: '100%', backgroundColor }}>
                フォルダおよび条件にマッチするファイルがありません。
            </div>
        );
    } else {
        main = (
            <VirtuosoGrid
                style={{ backgroundColor }}
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
        <div
            className={classNames(flex, flexColumn)}
            style={{
                gap: '16px',
                height: '100%',
            }}
        >
            {header}
            <Dropdown overlay={<ContextMenu node={null} />} trigger={['contextMenu']}>
                {main}
            </Dropdown>
        </div>
    );
};

const useStartAutoDeleteFiles = () => {
    const onDelete = useAtomSelector(propsAtom, props => props?.onDelete);
    const onDeleteRef = useLatest(onDelete);
    const [deleteStatus, setDeleteStatus] = useAtom(deleteStatusAtom);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [hasDeleted, setHasDeleted] = React.useState(false);
    const deleteStatusValue = deleteStatus.type === 'none' ? undefined : deleteStatus.files;
    const deleteStatusValueRef = useLatest(deleteStatusValue);

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
        const fileToDelete = deleteStatusValueRef.current?.find(file => file.status === 'waiting');
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
                    description: joinPath(fileToDelete.file.path).string,
                });
                console.error('ファイルの削除に失敗しました。', e);
                setFileStatus(fileToDelete, 'error');
                setIsDeleting(false);
            });
    }, [
        deleteStatus.type,
        deleteStatusValueRef,
        hasDeleted,
        isDeleting,
        onDeleteRef,
        setDeleteStatus,
    ]);
};

const useStartAutoRenameFiles = () => {
    const onRename = useAtomSelector(propsAtom, props => props?.onRename);
    const onRenameRef = useLatest(onRename);
    const [renameStatus, setRenameStatus] = useAtom(renameStatusAtom);
    const [isRenaming, setIsRenaming] = React.useState(false);
    const [hasRenamed, setHasRenamed] = React.useState(false);
    const renameStatusValue = renameStatus.type === 'none' ? undefined : renameStatus.files;
    const renameStatusValueRef = useLatest(renameStatusValue);
    const setPathState = useSetAtom(pathStateAtom);

    React.useEffect(() => {
        if (isRenaming) {
            return;
        }
        if (renameStatus.type !== 'renaming') {
            if (hasRenamed) {
                onRenameRef.current && onRenameRef.current();
                setPathState(pathState => pathState.resetCutState());
                setHasRenamed(false);
            }
            return;
        }
        const fileToDelete = renameStatusValueRef.current?.find(file => file.status === 'waiting');
        if (fileToDelete == null) {
            setRenameStatus(oldValue => {
                return {
                    type: 'finished',
                    files: oldValue.type === 'none' ? [] : oldValue.files,
                };
            });
            notification.info({
                placement: 'bottomRight',
                message: 'ファイルの移動もしくはリネームが完了しました。',
            });
            return;
        }

        const setFileStatus = (file: FileToRename, newValue: FileToRename['status']) => {
            setRenameStatus(oldValue => {
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

        setIsRenaming(true);
        setFileStatus(fileToDelete, 'renaming');
        const onRename = () => {
            if (fileToDelete.file.onMoveOrRename == null) {
                return Promise.resolve(undefined);
            }
            return fileToDelete.file.onMoveOrRename({
                currentPath: fileToDelete.file.path,
                newPath: fileToDelete.newPath,
            });
        };
        onRename()
            .then(() => {
                setFileStatus(fileToDelete, 'renamed');
                setHasRenamed(true);
                setIsRenaming(false);
            })
            .catch(e => {
                notification.error({
                    placement: 'bottomRight',
                    message: 'ファイルのリネームに失敗しました。',
                    description: joinPath(fileToDelete.file.path).string,
                });
                console.error('ファイルのリネームに失敗しました。', e);
                setFileStatus(fileToDelete, 'error');
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
    ]);
};

const FileBrowserWithoutJotaiProvider: React.FC<Props> = props => {
    useStartAutoDeleteFiles();
    useStartAutoRenameFiles();

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

    React.useEffect(() => {
        setPathState(pathState =>
            pathState.updateEnsuredVirtualFolders(props.ensuredVirtualFolderPaths)
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setPathState, ...props.ensuredVirtualFolderPaths]);

    React.useEffect(() => {
        setPathState(pathState => pathState.updateRootFolder(props.files));
    }, [props.files, setPathState]);

    return (
        <div
            className={classNames(flex, flexColumn)}
            style={mergeStyles(
                { gap: columnGap, height: props.height ?? defaultHeight },
                props.style
            )}
        >
            <AddressBar />
            <NodesGrid />
            <DeleteConfirmModal />
            <RenameConfirmModal />
            <RenameInputModal />
            <CreateFolderModal />
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
