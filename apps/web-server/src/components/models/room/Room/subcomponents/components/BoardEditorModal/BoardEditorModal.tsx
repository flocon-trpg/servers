import { State, boardTemplate, simpleId } from '@flocon-trpg/core';
import { Divider, InputNumber, Modal } from 'antd';
import { DrawerProps } from 'antd/lib/drawer';
import { atom, useAtom } from 'jotai';
import React from 'react';
import { useMemoOne } from 'use-memo-one';
import { useBoards } from '../../hooks/useBoards';
import { CreateModeParams, UpdateModeParams, useStateEditor } from '../../hooks/useStateEditor';
import { roomConfigAtom } from '@/atoms/roomConfigAtom/roomConfigAtom';
import { FileView } from '@/components/models/file/FileView/FileView';
import { useSetRoomStateWithImmer } from '@/components/models/room/Room/subcomponents/hooks/useSetRoomStateWithImmer';
import { CollaborativeInput } from '@/components/ui/CollaborativeInput/CollaborativeInput';
import { CopyToClipboardButton } from '@/components/ui/CopyToClipboardButton/CopyToClipboardButton';
import { DialogFooter } from '@/components/ui/DialogFooter/DialogFooter';
import { Table, TableRow } from '@/components/ui/Table/Table';
import { useImmerUpdateAtom } from '@/hooks/useImmerUpdateAtom';
import { useMyUserUid } from '@/hooks/useMyUserUid';
import { create, update } from '@/utils/constants';
import { FilePathModule } from '@/utils/file/filePath';
import { image } from '@/utils/fileType';

type BoardState = State<typeof boardTemplate>;

export type BoardEditorModalType =
    | {
          type: typeof create;

          // ボードを作成した際に、自動的にそのボードをアクティブにするために使われる。
          // 現時点ではこれがnullになることはないが、ボードエディターからこのModalを開くときはboardEditorPanelIdが指定できないためそれを想定してnullを型に加えている。
          boardEditorPanelId: string | null;
      }
    | {
          type: typeof update;
          stateId: string;
      };

export const boardEditorModalAtom = atom<BoardEditorModalType | null>(null);

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

const defaultBoard: BoardState = {
    $v: 2,
    $r: 1,

    // createするときはこれに自身のIDを入れなければならない
    ownerParticipantId: undefined,

    name: '',

    // cellColumnCountとcellRowCountは現在使われていない
    cellColumnCount: 0,
    cellRowCount: 0,

    cellHeight: 50,
    cellWidth: 50,
    cellOffsetX: 0,
    cellOffsetY: 0,
    backgroundImage: undefined,
    backgroundImageZoom: 1,

    dicePieces: {},
    imagePieces: {},
    shapePieces: {},
    stringPieces: {},
};

export const BoardEditorModal: React.FC = () => {
    const myUserUid = useMyUserUid();
    const setRoomState = useSetRoomStateWithImmer();
    const [modalValue, setModalValue] = useAtom(boardEditorModalAtom);
    const setRoomConfigAtom = useImmerUpdateAtom(roomConfigAtom);
    const boards = useBoards();
    const createMode: CreateModeParams<BoardState | undefined> | undefined = useMemoOne(() => {
        if (modalValue?.type !== create) {
            return undefined;
        }
        return {
            createInitState: () => defaultBoard,
            onCreate: board => {
                if (board == null) {
                    return;
                }
                const id = simpleId();
                setRoomState(roomState => {
                    if (roomState.boards == null) {
                        roomState.boards = {};
                    }
                    roomState.boards[id] = {
                        ...board,
                        ownerParticipantId: myUserUid,
                    };
                });
                setRoomConfigAtom(roomConfig => {
                    if (modalValue.boardEditorPanelId == null) {
                        return;
                    }
                    const originBoardEditorPanel =
                        roomConfig?.panels.boardEditorPanels[modalValue.boardEditorPanelId];
                    if (originBoardEditorPanel == null) {
                        return;
                    }
                    originBoardEditorPanel.activeBoardId = id;
                });
            },
        };
    }, [modalValue, myUserUid, setRoomConfigAtom, setRoomState]);
    const updateMode: UpdateModeParams<BoardState | undefined> | undefined = useMemoOne(() => {
        if (modalValue?.type !== update) {
            return undefined;
        }
        return {
            state: boards?.get(modalValue.stateId),
            onUpdate: nextState => {
                setRoomState(roomState => {
                    if (roomState.boards == null) {
                        roomState.boards = {};
                    }
                    roomState.boards[modalValue.stateId] = nextState;
                });
            },
        };
    }, [boards, modalValue, setRoomState]);
    const {
        state: board,
        updateState: updateBoard,
        ok,
    } = useStateEditor({ createMode, updateMode });

    if (myUserUid == null || board == null) {
        return null;
    }

    let onDestroy: (() => void) | undefined = undefined;
    if (modalValue?.type === update) {
        onDestroy = () => {
            setRoomState(roomState => {
                delete roomState.boards?.[modalValue.stateId];
            });
            setModalValue(null);
        };
    }

    return (
        <Modal
            {...drawerBaseProps}
            title={modalValue?.type === create ? 'ボードの新規作成' : 'ボードの編集'}
            visible={modalValue != null}
            closable
            onCancel={() => setModalValue(null)}
            footer={
                <DialogFooter
                    close={{
                        textType: modalValue?.type === create ? 'cancel' : 'close',
                        onClick: () => setModalValue(null),
                    }}
                    ok={
                        modalValue?.type === create
                            ? {
                                  textType: 'create',
                                  onClick: () => {
                                      ok();
                                      setModalValue(null);
                                  },
                              }
                            : undefined
                    }
                    destroy={
                        onDestroy == null
                            ? undefined
                            : {
                                  modal: {
                                      title: 'ボードの削除の確認',
                                      content: `このボード "${board.name}" を削除します。よろしいですか？`,
                                  },
                                  onClick: onDestroy,
                              }
                    }
                />
            }
        >
            <div>
                <Table>
                    <TableRow label='名前'>
                        <CollaborativeInput
                            bufferDuration='default'
                            size='small'
                            value={board.name}
                            onChange={e => {
                                if (e.previousValue === e.currentValue) {
                                    return;
                                }
                                updateBoard(board => {
                                    if (board == null) {
                                        return;
                                    }
                                    board.name = e.currentValue;
                                });
                            }}
                        />
                    </TableRow>
                    <TableRow label='背景画像'>
                        <FileView
                            style={{ maxWidth: 450 }}
                            maxWidthOfLink={null}
                            filePath={board.backgroundImage ?? undefined}
                            onPathChange={path =>
                                updateBoard(board => {
                                    if (board == null) {
                                        return;
                                    }
                                    board.backgroundImage =
                                        path == null ? undefined : FilePathModule.toOtState(path);
                                })
                            }
                            defaultFileTypeFilter={image}
                            uploaderFileBrowserHeight={null}
                        />
                    </TableRow>
                    <TableRow label='背景画像の拡大率'>
                        <InputNumber
                            size='small'
                            value={board.backgroundImageZoom * 100}
                            min={0}
                            formatter={value => `${value}%`}
                            parser={value => {
                                if (value == null) {
                                    return 100;
                                }
                                const num = Number(value.replace('%', ''));
                                if (isNaN(num)) {
                                    return 100;
                                }
                                return num;
                            }}
                            onChange={newValue =>
                                typeof newValue === 'number'
                                    ? updateBoard(board => {
                                          if (board == null) {
                                              return;
                                          }
                                          board.backgroundImageZoom = newValue / 100;
                                      })
                                    : undefined
                            }
                        />
                    </TableRow>
                    <TableRow label='セルの大きさ'>
                        {/* cellWidth === cellHeight という前提だが、もし異なる場合は代表してcellWidthの値を用いることにしている */}
                        <InputNumber
                            size='small'
                            value={board.cellWidth}
                            onChange={newValue =>
                                typeof newValue === 'number'
                                    ? updateBoard(board => {
                                          if (board == null) {
                                              return;
                                          }
                                          board.cellHeight = newValue;
                                          board.cellWidth = newValue;
                                      })
                                    : undefined
                            }
                        />
                    </TableRow>
                    <TableRow label='セルの基準点'>
                        <span>x=</span>
                        <InputNumber
                            size='small'
                            value={board.cellOffsetX}
                            onChange={newValue =>
                                typeof newValue === 'number'
                                    ? updateBoard(board => {
                                          if (board == null) {
                                              return;
                                          }
                                          board.cellOffsetX = newValue;
                                      })
                                    : undefined
                            }
                        />
                        <span style={{ marginLeft: 10 }}>y=</span>
                        <InputNumber
                            size='small'
                            value={board.cellOffsetY}
                            onChange={newValue =>
                                typeof newValue === 'number'
                                    ? updateBoard(board => {
                                          if (board == null) {
                                              return;
                                          }
                                          board.cellOffsetY = newValue;
                                      })
                                    : undefined
                            }
                        />
                    </TableRow>
                </Table>
                <Divider dashed />
                <CopyToClipboardButton
                    clipboardText={async () => {
                        return JSON.stringify(board);
                    }}
                >
                    クリップボードにエクスポート
                </CopyToClipboardButton>
                <p>
                    {'キャラクターコマ、キャラクター立ち絵コマはエクスポートされません。'}
                    <br />
                    {
                        '自分が閲覧できない値はエクスポートされません。例えば、他のユーザーが作成して非公開にしている値はエクスポートの対象外ですが、自分が作成して非公開にしている値は自分が閲覧可能なためエクスポートの対象内となります。'
                    }
                </p>
            </div>
        </Modal>
    );
};
