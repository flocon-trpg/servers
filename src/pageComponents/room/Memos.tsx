import React from 'react';
import * as Icons from '@ant-design/icons';
import { useSelector } from '../../store';
import { useMemos } from '../../hooks/state/useMemos';
import BufferedTextArea from '../../components/BufferedTextArea';
import { MemoState, replace, textDiff, toTextUpOperation, update } from '@kizahasi/flocon-core';
import { useOperate } from '../../hooks/useOperate';
import { Button, Popover, Tree } from 'antd';
import { DataNode } from 'rc-tree/lib/interface';
import { simpleId } from '../../utils/generators';
import BufferedInput from '../../components/BufferedInput';

/*
DataNodeの仕様:

leafならば、メモを表す。keyはmemoIdと等しい。
leafでない場合は、ディレクトリを表す。keyは、例えば下のようなディレクトリ構造（a～dはすべてディレクトリとする。ただし、実際は空のディレクトリは存在できないのでそのようなことはあり得ない）の場合、aは'/a'、bは'/a/b'、cは'/a/b/c'としなければならない（全てのキーを一意にしなければならないため。初めが必ず/なのは、もし/がないとrootにあるディレクトリがleafと区別できないため）。
a
├ b
│ └ c
└ d

x∈メモ, y∈メモまたはディレクトリ というx,yが存在し、x≠yかつxとyが同じディレクトリに存在するとき、xの名前とyの名前は重複しても構わない（重複を禁止する処理を書くのが面倒なので）。
*/

// 例えばdirが['a','b','c']のとき、dirKeysは['/a', '/a/b', '/a/b/c']のようにして渡さなければならない。
// rootの場合は、currentNodeに{ children: DataNode[] }を渡す。rootでない場合はDataNodeを渡す。
// 戻り値は必ずleafである。
const ensureLeafCore = (dirKeys: string[], memoId: string, currentNode: DataNode | { children: DataNode[] }): DataNode => {
    const dirKey = dirKeys.shift();
    if (dirKey == null) {
        if (currentNode.children == null) {
            currentNode.children = [];
        }
        const found = currentNode.children.find(x => x.key == memoId);
        if (found != null) {
            return found;
        }
        const newLeaf: DataNode = {
            key: memoId,
            icon: <Icons.FileOutlined />,
            isLeaf: true,
            selectable: true,
        };
        currentNode.children.push(newLeaf);
        return newLeaf;
    }

    if (currentNode.children == null) {
        currentNode.children = [];
    }
    const found = currentNode.children.find(x => x.key === dirKey);
    if (found != null) {
        return ensureLeafCore(dirKeys, memoId, found);
    }
    const newDirectory: DataNode = {
        key: dirKey,
        icon: <Icons.FolderOutlined />,
        isLeaf: false,
        selectable: false,
        children: [],
    };
    currentNode.children.push(newDirectory);
    return ensureLeafCore(dirKeys, memoId, newDirectory);
};

// 例えばdirが['a','b','c']のとき、dirにはそのまま['a','b','c']を渡す。
const ensureLeaf = (dir: string[], memoId: string, root: DataNode[]): DataNode => {
    const dirKeys: string[] = [];
    dir.reduce((seed, elem) => {
        const toPush = `${seed}/${elem}`;
        dirKeys.push(toPush);
        return toPush;
    }, '');
    return ensureLeafCore(dirKeys, memoId, { children: root });
};

const createTreeData = (source: ReadonlyMap<string, MemoState>): DataNode[] => {
    const root: DataNode[] = [];
    source.forEach((value, key) => {
        const leaf = ensureLeaf(value.dir, key, root);
        leaf.title = value.name;
    });
    return root;
};

type MemoSelectorProps = {
    onChange: (newId: string) => void;
}

const MemoSelector: React.FC<MemoSelectorProps> = ({ onChange }: MemoSelectorProps) => {
    const memos = useMemos();
    const memosArray: DataNode[] | undefined = React.useMemo(() => {
        if (memos == null) {
            return undefined;
        }
        return createTreeData(memos);
    }, [memos]);
    if (memosArray == null) {
        return null;
    }

    return <Tree
        treeData={memosArray}
        showIcon
        onSelect={e => {
            e.forEach(key => {
                if (typeof key !== 'string') {
                    return;
                }
                onChange(key);
            });
        }} />;
};

type MemoProps = {
    memoId: string | undefined;
    state: MemoState | undefined;
}

const Memo: React.FC<MemoProps> = ({ memoId, state }: MemoProps) => {
    const operate = useOperate();

    if (memoId == null) {
        return <div>表示するメモが指定されていません。</div>;
    }

    if (state == null) {
        return <div>指定されたメモが見つかりません。削除された可能性があります。</div>;
    }

    return <div
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <BufferedInput
            bufferDuration='default'
            value={state.name}
            onChange={e => operate({
                $version: 1,
                memos: {
                    [memoId]: {
                        type: update,
                        update: {
                            $version: 1,
                            name: { newValue: e.currentValue },
                        }
                    }
                }
            })} />
        <BufferedTextArea
            style={{ flex: 1, height: '100%', resize: 'none' }}
            bufferDuration='default'
            value={state.text}
            onChange={e => {
                const diff2 = textDiff({ prev: e.previousValue, next: e.currentValue });
                operate({
                    $version: 1,
                    memos: {
                        [memoId]: {
                            type: update,
                            update: {
                                $version: 1,
                                text: diff2 === undefined ? undefined : toTextUpOperation(diff2),
                            }
                        }
                    }
                });
            }} />
    </div>;
};

type Props = {
    selectedMemoId: string | undefined;
    onSelectedMemoIdChange: (newId: string) => void;
}

export const Memos: React.FC<Props> = ({
    selectedMemoId,
    onSelectedMemoIdChange
}: Props) => {
    const operate = useOperate();
    const memos = useMemos();
    const memo = selectedMemoId == null ? undefined : memos?.get(selectedMemoId);
    const [popoverVisible, setPopoverVisible] = React.useState(false);

    return <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            <Button onClick={() => {
                const id = simpleId();
                operate({
                    $version: 1,
                    memos: {
                        [id]: {
                            type: replace,
                            replace: {
                                newValue: {
                                    $version: 1,
                                    text: '',
                                    textType: 'Plain',
                                    name: 'New memo',
                                    dir: [],
                                }
                            }
                        }
                    }
                });
                onSelectedMemoIdChange(id);
            }}>新規作成</Button>
            <Popover
                trigger='click'
                onVisibleChange={newValue => setPopoverVisible(newValue)}
                visible={popoverVisible}
                content={<MemoSelector onChange={newId => {
                    onSelectedMemoIdChange(newId);
                    setPopoverVisible(false);
                }} />}
                placement='bottom'>
                <Button>メモ一覧</Button>
            </Popover>
        </div>
        <Memo memoId={selectedMemoId} state={memo} />
    </div>;
};