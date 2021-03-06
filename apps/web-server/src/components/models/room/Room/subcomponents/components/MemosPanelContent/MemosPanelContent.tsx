import React from 'react';
import { useMemos } from '../../hooks/useMemos';
import { State, joinPath, memoTemplate, simpleId } from '@flocon-trpg/core';
import { Button, Modal } from 'antd';
import classNames from 'classnames';
import {
    flex,
    flex1,
    flexAuto,
    flexColumn,
    flexNone,
    flexRow,
    itemsCenter,
} from '@/styles/className';
import moment from 'moment';
import { useSetRoomStateWithImmer } from '@/hooks/useSetRoomStateWithImmer';
import { CollaborativeInput } from '@/components/ui/CollaborativeInput/CollaborativeInput';
import { FileBrowser, FilePath, text } from '@/components/models/file/FileBrowser/FileBrowser';
import { DialogFooter } from '@/components/ui/DialogFooter/DialogFooter';
import { stretchedModalWidth } from '@/utils/variables';

type MemoState = State<typeof memoTemplate>;

const padding = 4;
const splitterPadding = 8;

const MemoBrowserModal: React.FC<{
    visible: boolean;
    /** @param selectedMemoId - 選択されたメモのIDが変更される場合はnon-null、変更されない場合はnullの値となります。 */
    onClose: (selectedMemoId: string | null) => void;
}> = ({ visible, onClose }) => {
    const memos = useMemos();
    const setRoomState = useSetRoomStateWithImmer();

    const files: FilePath[] = React.useMemo(() => {
        if (memos == null) {
            return [];
        }
        return [...memos].map(([memoId, memo]): FilePath => {
            const path = joinPath(memo.dir, [`${memo.name}(ID:${memoId})`]).array;
            return {
                path,
                icon: text,
                onDelete: () => {
                    setRoomState(roomState => {
                        if (roomState.memos == null) {
                            return;
                        }
                        delete roomState.memos[memoId];
                    });
                    return Promise.resolve(undefined);
                },
                onOpen: () => {
                    onClose(memoId);
                },
            };
        });
    }, [memos, onClose, setRoomState]);

    return (
        <Modal
            visible={visible}
            onCancel={() => onClose(null)}
            footer={<DialogFooter close={{ textType: 'close', onClick: () => onClose(null) }} />}
            width={stretchedModalWidth}
        >
            <FileBrowser
                files={files}
                height={null}
                isLocked={() => false}
                ensuredFolderPaths={[]}
                onFileCreate={absolutePath => {
                    const newMemoId = simpleId();
                    setRoomState(roomState => {
                        const dir = [...absolutePath];
                        const name = dir.pop();
                        if (name == null) {
                            return;
                        }
                        if (roomState.memos == null) {
                            roomState.memos = {};
                        }
                        roomState.memos[newMemoId] = {
                            $v: 1,
                            $r: 1,
                            dir,
                            name,
                            text: '',
                            textType: 'Plain',
                        };
                    });
                    onClose(newMemoId);
                }}
            />
        </Modal>
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

export const MemosPanelContent: React.FC<Props> = ({
    selectedMemoId,
    onSelectedMemoIdChange,
}: Props) => {
    const setRoomState = useSetRoomStateWithImmer();
    const memos = useMemos();
    const memo = selectedMemoId == null ? undefined : memos?.get(selectedMemoId);
    const [modalVisible, setModalVisible] = React.useState(false);

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
                <Button onClick={() => setModalVisible(true)}>他のメモを開く</Button>
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
            <MemoBrowserModal
                visible={modalVisible}
                onClose={newSelectedMemoId => {
                    if (newSelectedMemoId != null) {
                        onSelectedMemoIdChange(newSelectedMemoId);
                    }
                    setModalVisible(false);
                }}
            />
        </div>
    );
};
