import React from 'react';
import * as Icons from '@ant-design/icons';
import { useMemos } from '../../../hooks/state/useMemos';
import { State, memoTemplate, simpleId } from '@flocon-trpg/core';
import { Button, Dropdown, Input, Menu, Modal, Popover, Tree } from 'antd';
import { DataNode } from 'rc-tree/lib/interface';
import classNames from 'classnames';
import {
    cancelRnd,
    flex,
    flex1,
    flexAuto,
    flexColumn,
    flexNone,
    flexRow,
    itemsCenter,
} from '../../../utils/className';
import _ from 'lodash';
import moment from 'moment';
import { useSetRoomStateWithImmer } from '../../../hooks/useSetRoomStateWithImmer';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { defaultTriggerSubMenuAction } from '../../../utils/variables';
import { CollaborativeInput } from '../../ui/CollaborativeInput';

type MemoState = State<typeof memoTemplate>;

const padding = 4;
const splitterPadding = 8;

const dirToKey = (dir: readonly string[]): string => {
    return dir.reduce(
        (seed, elem) => `${seed}:${elem.replaceAll('/', '//').replaceAll(':', '/:')}`,
        ''
    );
};

class Dir {
    public constructor(public readonly dir: string[]) {}

    public append(newDir: string): Dir {
        return new Dir([...this.dir, newDir]);
    }

    public get dirName(): string | undefined {
        return _.last(this.dir);
    }

    public get reactKey(): string {
        return dirToKey(this.dir);
    }
}

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
const ensureLeafCore = (
    dir: Dir[],
    memoId: string,
    currentNode: DataNode | { children: DataNode[] }
): DataNode => {
    const firstDir = dir.shift();
    if (firstDir == null) {
        if (currentNode.children == null) {
            currentNode.children = [];
        }
        const found = currentNode.children.find(x => x.key == memoId);
        if (found != null) {
            return found;
        }
        const newLeaf: DataNode = {
            key: `${memoId}`,
            icon: <Icons.FileFilled />,
            isLeaf: true,
            selectable: true,
        };
        currentNode.children.push(newLeaf);
        return newLeaf;
    }

    if (currentNode.children == null) {
        currentNode.children = [];
    }
    const found = currentNode.children.find(x => x.key === firstDir.reactKey);
    if (found != null) {
        return ensureLeafCore(dir, memoId, found);
    }
    const newDirectory: DataNode = {
        key: firstDir.reactKey,
        title: firstDir.dirName,
        icon: <Icons.FolderFilled />,
        isLeaf: false,
        selectable: false,
        children: [],
    };
    currentNode.children.push(newDirectory);
    return ensureLeafCore(dir, memoId, newDirectory);
};

// 例えばdirが['a','b','c']のとき、dirにはそのまま['a','b','c']を渡す。['/a', '/a/b', '/a/b/c'] のように変換する処理はこの関数内で行われるのでする必要はない。
const ensureLeaf = (dir: string[], memoId: string, root: DataNode[]): DataNode => {
    const dirAsDir: Dir[] = [];
    dir.reduce((seed, elem) => {
        const toPush = seed.append(elem);
        dirAsDir.push(toPush);
        return toPush;
    }, new Dir([]));
    return ensureLeafCore(dirAsDir, memoId, { children: root });
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
};

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

    return (
        <Tree
            className={cancelRnd}
            style={{ minWidth: 300 }}
            treeData={memosArray}
            showIcon
            onSelect={e => {
                e.forEach(key => {
                    if (typeof key !== 'string') {
                        return;
                    }
                    onChange(key);
                });
            }}
        />
    );
};

const sortedDir = (memos: ReturnType<typeof useMemos>) => {
    if (memos == null) {
        return [];
    }
    return [...memos]
        .flatMap(([, memo]) => {
            // {dir: ['a', 'b', 'c']} => [[], ['a'], ['a','b'], ['a','b','c']]
            function* allDir() {
                let result: string[] = [];
                yield result;
                for (const d of memo.dir) {
                    result = [...result, d];
                    yield result;
                }
            }

            return [...allDir()].map(dir => ({ dir }));
        })
        .sort((x, y) => {
            for (let i = 0; ; i++) {
                const xElem = x.dir[i];
                const yElem = y.dir[i];
                if (xElem == null) {
                    if (yElem == null) {
                        // x.dirとy.dirがdeep equalなときにここに来る。
                        return 0;
                    }
                    return -1;
                }
                if (yElem == null) {
                    return 1;
                }
                if (xElem === yElem) {
                    continue;
                }
                return xElem.localeCompare(yElem);
            }
        })
        .reduce((seed, elem) => {
            const last = _.last(seed);
            if (!_.isEqual(elem.dir, last?.dir)) {
                seed.push({ dir: elem.dir });
            }
            return seed;
        }, [] as { dir: string[] }[]);
};

const dirToElement = (dir: string[]) => {
    if (dir.length === 0) {
        return '（ルート）';
    }
    const children = dir.map((d, i) => {
        return (
            <React.Fragment key={i}>
                {i !== 0 && ' / '}
                <Icons.FolderFilled />
                {' ' + d}
            </React.Fragment>
        );
    });
    return <span>{children}</span>;
};

type DirSelectProps = {
    memoId: string;
};

const defaultNewDirName = '新規グループ';
const DirSelect = ({ memoId }: DirSelectProps) => {
    const memos = useMemos();
    const selectedMemo = memos?.get(memoId);
    const setRoomState = useSetRoomStateWithImmer();
    const [newGroupModalState, setNewGroupModalState] = React.useState(false);
    const [newDirName, setNewDirName] = React.useState(defaultNewDirName);

    const dirNames = React.useMemo(() => sortedDir(memos), [memos]);
    const dirMenuItems: ItemType[] = React.useMemo(() => {
        const moveItems = dirNames.map(({ dir }): ItemType => {
            return {
                key: `MEMO-DIRSELECT-${dirToKey(dir)}`,
                label: dirToElement(dir),
                onClick: () => {
                    setRoomState(roomState => {
                        const memo = roomState.memos?.[memoId];
                        if (memo == null) {
                            return;
                        }
                        memo.dir = [...dir];
                    });
                },
            };
        });
        return [
            ...moveItems,
            { type: 'divider' },
            {
                key: `MEMO-NEWDIR`,
                label: 'グループを新規作成して移動',
                onClick: () => setNewGroupModalState(true),
            },
        ];
    }, [dirNames, memoId, setRoomState]);

    const moveMemoOverlay = (
        <Menu items={dirMenuItems} triggerSubMenuAction={defaultTriggerSubMenuAction} />
    );

    return (
        <div className={classNames(flex, flexRow)}>
            <Dropdown overlay={moveMemoOverlay} trigger={['click']}>
                <Button>移動</Button>
            </Dropdown>
            <Modal
                width={600}
                className={cancelRnd}
                title='グループの新規作成と移動'
                visible={newGroupModalState}
                onCancel={() => {
                    setNewDirName(defaultNewDirName);
                    setNewGroupModalState(false);
                }}
                onOk={() => {
                    setRoomState(roomState => {
                        const memo = roomState.memos?.[memoId];
                        if (memo == null) {
                            return;
                        }
                        memo.dir = [...memo.dir, newDirName];
                    });
                    setNewDirName(defaultNewDirName);
                    setNewGroupModalState(false);
                }}
            >
                <div className={classNames(flex, flexColumn)}>
                    <div className={classNames(flex, flexRow, itemsCenter)}>
                        <div
                            className={classNames(flex, flexRow, itemsCenter)}
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            {selectedMemo && dirToElement(selectedMemo.dir)}
                        </div>
                        <div style={{ padding: '0 4px' }}>{'/'}</div>
                        <Input
                            onChange={e => {
                                setNewDirName(e.target.value);
                            }}
                            value={newDirName}
                        />
                    </div>
                    <div style={{ paddingTop: 8 }}>
                        同じ名前のグループが既に存在する場合、グループは新規作成されず、メモはその既に存在するグループ内に移動します。
                    </div>
                </div>
            </Modal>
        </div>
    );
};

type MemoProps = {
    memoId: string | undefined;
    memo: MemoState | undefined;
};

const Memo: React.FC<MemoProps> = ({ memoId, memo }: MemoProps) => {
    const setRoomState = useSetRoomStateWithImmer();

    if (memoId == null) {
        return <div style={{ padding }}>表示するメモが指定されていません。</div>;
    }

    if (memo == null) {
        return (
            <div style={{ padding }}>
                指定されたメモが見つかりません。削除された可能性があります。
            </div>
        );
    }

    return (
        <div
            className={classNames(flex1, flex, flexColumn)}
            style={{
                padding: `${padding}px ${padding}px 0 ${padding}px`,
                height: '100%',
                overflow: 'hidden',
            }}
        >
            <div
                className={classNames(flexNone, flex, flexRow, itemsCenter)}
                style={{
                    paddingBottom: padding,
                    // 名前が長いときでも一応おさまるようにheightを設定している
                    height: 30,
                }}
            >
                <CollaborativeInput
                    bufferDuration='default'
                    value={memo.name}
                    style={{ width: '100%' }}
                    placeholder='名前'
                    onChange={e =>
                        setRoomState(prevState => {
                            const memo = prevState.memos?.[memoId];
                            if (memo != null) {
                                memo.name = e.currentValue;
                            }
                        })
                    }
                />
                <div style={{ minWidth: 16 }} />
                <DirSelect memoId={memoId} />
                <Button
                    onClick={() => {
                        Modal.confirm({
                            title: '現在開いているメモを削除してよろしいですか？',
                            onOk: () => {
                                setRoomState(roomState => {
                                    delete roomState.memos?.[memoId];
                                });
                            },
                        });
                    }}
                >
                    削除
                </Button>
            </div>
            <CollaborativeInput
                multiline
                className={classNames(flexAuto)}
                style={{ overflow: 'auto' }}
                bufferDuration='default'
                value={memo.text}
                placeholder='本文'
                onChange={e => {
                    setRoomState(roomState => {
                        if (roomState.memos == null) {
                            roomState.memos = {};
                        }
                        const memo = roomState.memos[memoId];
                        if (memo == null) {
                            return;
                        }
                        memo.text = e.currentValue;
                    });
                }}
            />
        </div>
    );
};

type Props = {
    selectedMemoId: string | undefined;
    onSelectedMemoIdChange: (newId: string) => void;
};

export const Memos: React.FC<Props> = ({ selectedMemoId, onSelectedMemoIdChange }: Props) => {
    const setRoomState = useSetRoomStateWithImmer();
    const memos = useMemos();
    const memo = selectedMemoId == null ? undefined : memos?.get(selectedMemoId);
    const [popoverVisible, setPopoverVisible] = React.useState(false);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}
        >
            <div
                className={classNames(flexNone, flex, flexRow, itemsCenter)}
                style={{
                    padding: `${padding}px ${padding}px ${splitterPadding}px ${padding}px`,
                }}
            >
                <Popover
                    trigger='click'
                    onVisibleChange={newValue => setPopoverVisible(newValue)}
                    visible={popoverVisible}
                    content={
                        <MemoSelector
                            onChange={newId => {
                                onSelectedMemoIdChange(newId);
                                setPopoverVisible(false);
                            }}
                        />
                    }
                    placement='bottom'
                >
                    <Button>他のメモを開く</Button>
                </Popover>
                <Button
                    onClick={() => {
                        const id = simpleId();
                        setRoomState(roomState => {
                            if (roomState.memos == null) {
                                roomState.memos = {};
                            }
                            roomState.memos[id] = {
                                $v: 1,
                                $r: 1,
                                text: '',
                                textType: 'Plain',
                                name: `新規メモ@${moment(new Date()).format(
                                    'YYYY/MM/DD HH:mm:ss'
                                )}`,
                                dir: memo == null ? [] : memo.dir,
                            };
                        });
                        onSelectedMemoIdChange(id);
                    }}
                >
                    新規作成
                </Button>
            </div>
            <Memo memoId={selectedMemoId} memo={memo} />
        </div>
    );
};
