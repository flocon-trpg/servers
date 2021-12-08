import { Col, Divider, InputNumber, Modal, Row } from 'antd';
import React from 'react';
import { DrawerFooter } from '../../../ui/DrawerFooter';
import { InputFile } from '../file/InputFile';
import { DrawerProps } from 'antd/lib/drawer';
import { FilesManagerDrawer } from '../file/FilesManagerDrawer';
import { FilesManagerDrawerType } from '../../../../utils/types';
import { Gutter } from 'antd/lib/grid/row';
import { StateEditorParams, useStateEditor } from '../../../../hooks/useStateEditor';
import { BufferedInput } from '../../../ui/BufferedInput';
import { useBoards } from '../../../../hooks/state/useBoards';
import { BoardState, simpleId } from '@flocon-trpg/core';
import { useMyUserUid } from '../../../../hooks/useMyUserUid';
import { FilePath } from '../../../../utils/file/filePath';
import { atom, useAtom } from 'jotai';
import { create, update } from '../../../../utils/constants';
import { roomConfigAtom } from '../../../../atoms/roomConfig/roomConfigAtom';
import { useImmerUpdateAtom } from '../../../../atoms/useImmerUpdateAtom';
import { useSetRoomStateWithImmer } from '../../../../hooks/useSetRoomStateWithImmer';
import { CopyToClipboardButton } from '../../../ui/CopyToClipboardButton';

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
    stringPieces: {},
};

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

export const BoardEditorModal: React.FC = () => {
    const myUserUid = useMyUserUid();
    const setRoomState = useSetRoomStateWithImmer();
    const [modalValue, setModalValue] = useAtom(boardEditorModalAtom);
    const setRoomConfigAtom = useImmerUpdateAtom(roomConfigAtom);
    const boards = useBoards();
    let stateEditorParams: StateEditorParams<BoardState | undefined> | undefined;
    switch (modalValue?.type) {
        case undefined:
            stateEditorParams = undefined;
            break;
        case create:
            stateEditorParams = {
                type: create,
                initState: defaultBoard,
            };
            break;
        case update:
            stateEditorParams = {
                type: update,
                state: boards?.get(modalValue.stateId),
                onUpdate: nextState => {
                    setRoomState(roomState => {
                        roomState.boards[modalValue.stateId] = nextState;
                    });
                },
            };
            break;
    }
    const {
        uiState: board,
        updateUiState: updateBoard,
        resetUiState: resetBoardToCreate,
    } = useStateEditor(stateEditorParams);
    const [filesManagerDrawerType, setFilesManagerDrawerType] =
        React.useState<FilesManagerDrawerType | null>(null);

    if (myUserUid == null || board == null) {
        return null;
    }

    let onOkClick: (() => void) | undefined = undefined;
    if (modalValue?.type === create) {
        onOkClick = () => {
            const id = simpleId();
            setRoomState(roomState => {
                roomState.boards[id] = {
                    ...board,
                    ownerParticipantId: myUserUid,
                };
            });
            resetBoardToCreate(defaultBoard);
            setModalValue(null);
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
        };
    }

    let onDestroy: (() => void) | undefined = undefined;
    if (modalValue?.type === update) {
        onDestroy = () => {
            setRoomState(roomState => {
                delete roomState.boards[modalValue.stateId];
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
                <DrawerFooter
                    close={{
                        textType: modalValue?.type === create ? 'cancel' : 'close',
                        onClick: () => setModalValue(null),
                    }}
                    ok={onOkClick == null ? undefined : { textType: 'create', onClick: onOkClick }}
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
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>名前</Col>
                    <Col span={inputSpan}>
                        <BufferedInput
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
                    </Col>
                </Row>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>背景画像</Col>
                    <Col span={inputSpan}>
                        <InputFile
                            filePath={board.backgroundImage ?? undefined}
                            onPathChange={path =>
                                updateBoard(board => {
                                    if (board == null) {
                                        return;
                                    }
                                    board.backgroundImage =
                                        path == null ? undefined : FilePath.toOt(path);
                                })
                            }
                            openFilesManager={setFilesManagerDrawerType}
                        />
                    </Col>
                </Row>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>背景画像の拡大率</Col>
                    <Col span={inputSpan}>
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
                    </Col>
                </Row>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>グリッドの大きさ</Col>
                    <Col span={inputSpan}>
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
                    </Col>
                </Row>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>グリッドの基準点</Col>
                    <Col span={inputSpan}>
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
                    </Col>
                </Row>
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
            <FilesManagerDrawer
                drawerType={filesManagerDrawerType}
                onClose={() => setFilesManagerDrawerType(null)}
            />
        </Modal>
    );
};
