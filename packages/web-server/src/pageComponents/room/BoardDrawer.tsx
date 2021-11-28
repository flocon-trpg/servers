import { Col, Drawer, InputNumber, Row } from 'antd';
import React from 'react';
import { DrawerFooter } from '../../layouts/DrawerFooter';
import { InputFile } from '../../components/InputFile';
import { DrawerProps } from 'antd/lib/drawer';
import { FilesManagerDrawer } from '../../components/FilesManagerDrawer';
import { FilesManagerDrawerType } from '../../utils/types';
import { Gutter } from 'antd/lib/grid/row';
import { StateEditorParams, useStateEditor } from '../../hooks/useStateEditor';
import { BufferedInput } from '../../components/BufferedInput';
import { useBoards } from '../../hooks/state/useBoards';
import {  BoardState, simpleId, } from '@flocon-trpg/core';
import { useMyUserUid } from '../../hooks/useMyUserUid';
import { FilePath } from '../../utils/filePath';
import { useAtom } from 'jotai';
import { boardEditorDrawerAtom } from '../../atoms/overlay/boardDrawerAtom';
import { create, update } from '../../utils/constants';
import { roomConfigAtom } from '../../atoms/roomConfig/roomConfigAtom';
import { useImmerUpdateAtom } from '../../atoms/useImmerUpdateAtom';
import { useSetRoomStateWithImmer } from '../../hooks/useSetRoomStateWithImmer';

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
};

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

export const BoardDrawer: React.FC = () => {
    const myUserUid = useMyUserUid();
    const setRoomState = useSetRoomStateWithImmer();
    const [drawerType, setDrawerType] = useAtom(boardEditorDrawerAtom);
    const setRoomConfigAtom = useImmerUpdateAtom(roomConfigAtom);
    const boards = useBoards();
    let stateEditorParams: StateEditorParams<BoardState | undefined>;
    switch (drawerType?.type) {
        case create:
        case undefined:
            stateEditorParams = {
                type: create,
                initState: defaultBoard,
            };
            break;
        case update:
            stateEditorParams = {
                type: update,
                state: boards?.get(drawerType.stateId),
                onUpdate: nextState => {
                    setRoomState(roomState => {
                        roomState.boards[drawerType.stateId] = nextState;
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
    if (drawerType?.type === create) {
        onOkClick = () => {
            const id = simpleId();
            setRoomState(roomState => {
                roomState.boards[id] = {
                    ...board,
                    ownerParticipantId: myUserUid
                };
            })
            resetBoardToCreate(defaultBoard);
            setDrawerType(null);
            setRoomConfigAtom(roomConfig => {
                if (drawerType.boardEditorPanelId == null) {
                    return;
                }
                const originBoardEditorPanel =
                    roomConfig?.panels.boardEditorPanels[drawerType.boardEditorPanelId];
                if (originBoardEditorPanel == null) {
                    return;
                }
                originBoardEditorPanel.activeBoardId = id;
            });
        };
    }

    let onDestroy: (() => void) | undefined = undefined;
    if (drawerType?.type === update) {
        onDestroy = () => {
            setRoomState(roomState => {
                delete roomState.boards[drawerType.stateId]
            })
            setDrawerType(null);
        };
    }

    return (
        <Drawer
            {...drawerBaseProps}
            title={drawerType?.type === create ? 'ボードの新規作成' : 'ボードの編集'}
            visible={drawerType != null}
            closable
            onClose={() => setDrawerType(null)}
            footer={
                <DrawerFooter
                    close={{
                        textType: drawerType?.type === create ? 'cancel' : 'close',
                        onClick: () => setDrawerType(null),
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
            </div>
            <FilesManagerDrawer
                drawerType={filesManagerDrawerType}
                onClose={() => setFilesManagerDrawerType(null)}
            />
        </Drawer>
    );
};
