import { Col, Drawer, Input, InputNumber, Row } from 'antd';
import React from 'react';
import DrawerFooter from '../../layouts/DrawerFooter';
import { simpleId } from '../../utils/generators';
import { replace } from '../../stateManagers/states/types';
import InputFile from '../../components/InputFile';
import { DrawerProps } from 'antd/lib/drawer';
import FilesManagerDrawer from '../../components/FilesManagerDrawer';
import { FilePath, FilesManagerDrawerType } from '../../utils/types';
import { Gutter } from 'antd/lib/grid/row';
import { StateEditorParams, useStateEditor } from '../../hooks/useStateEditor';
import { useOperate } from '../../hooks/useOperate';
import { useSelector } from '../../store';
import BufferedInput from '../../components/BufferedInput';
import { useBoards } from '../../hooks/state/useBoards';
import { useMe } from '../../hooks/useMe';
import { boardDiff, BoardState, UpOperation, toBoardUpOperation } from '@kizahasi/flocon-core';
import { useDispatch } from 'react-redux';
import {
    create,
    roomDrawerAndPopoverAndModalModule,
    update,
} from '../../modules/roomDrawerAndPopoverAndModalModule';
import { useMyUserUid } from '../../hooks/useMyUserUid';

const notFound = 'notFound';

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

const defaultBoard: BoardState = {
    $version: 1,
    name: '',
    cellColumnCount: 0,
    cellRowCount: 0,
    cellHeight: 50,
    cellWidth: 50,
    cellOffsetX: 0,
    cellOffsetY: 0,
    backgroundImage: null,
    backgroundImageZoom: 1,
};

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

const BoardDrawer: React.FC = () => {
    const myUserUid = useMyUserUid();
    const dispatch = useDispatch();
    const operate = useOperate();
    const drawerType = useSelector(
        state => state.roomDrawerAndPopoverAndModalModule.boardDrawerType
    );
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
                state: boards?.get(drawerType.stateKey),
                onUpdate: ({ prevState, nextState }) => {
                    if (prevState == null || nextState == null) {
                        return;
                    }
                    const diffOperation = boardDiff({ prevState, nextState });
                    if (diffOperation == null) {
                        return;
                    }
                    const operation: UpOperation = {
                        $version: 1,
                        boards: {
                            [drawerType.stateKey.createdBy]: {
                                [drawerType.stateKey.id]: {
                                    type: update,
                                    update: toBoardUpOperation(diffOperation),
                                },
                            },
                        },
                    };
                    operate(operation);
                },
            };
            break;
    }
    const {
        uiState: board,
        updateUiState: setBoard,
        resetUiState: resetBoardToCreate,
    } = useStateEditor(stateEditorParams);
    const [
        filesManagerDrawerType,
        setFilesManagerDrawerType,
    ] = React.useState<FilesManagerDrawerType | null>(null);

    if (myUserUid == null || board == null) {
        return null;
    }

    const updateBoard = (partialState: Partial<BoardState>) => {
        switch (drawerType?.type) {
            case create:
                setBoard({ ...board, ...partialState });
                return;
            case update: {
                const diffOperation = boardDiff({
                    prevState: board,
                    nextState: { ...board, ...partialState },
                });
                if (diffOperation == null) {
                    return;
                }
                const operation: UpOperation = {
                    $version: 1,
                    boards: {
                        [drawerType.stateKey.createdBy]: {
                            [drawerType.stateKey.id]: {
                                type: update,
                                update: toBoardUpOperation(diffOperation),
                            },
                        },
                    },
                };
                operate(operation);
                return;
            }
        }
    };

    let onOkClick: (() => void) | undefined = undefined;
    if (drawerType?.type === create) {
        onOkClick = () => {
            const id = simpleId();
            const operation: UpOperation = {
                $version: 1,
                boards: {
                    [myUserUid]: {
                        [id]: {
                            type: replace,
                            replace: {
                                newValue: board,
                            },
                        },
                    },
                },
            };
            operate(operation);
            setBoard(defaultBoard);
            resetBoardToCreate();
            dispatch(roomDrawerAndPopoverAndModalModule.actions.set({ boardDrawerType: null }));
        };
    }

    let onDestroy: (() => void) | undefined = undefined;
    if (drawerType?.type === update) {
        onDestroy = () => {
            const operation: UpOperation = {
                $version: 1,
                boards: {
                    [drawerType.stateKey.createdBy]: {
                        [drawerType.stateKey.id]: {
                            type: replace,
                            replace: {
                                newValue: undefined,
                            },
                        },
                    },
                },
            };
            operate(operation);
            dispatch(roomDrawerAndPopoverAndModalModule.actions.set({ boardDrawerType: null }));
        };
    }

    return (
        <Drawer
            {...drawerBaseProps}
            title={drawerType?.type === create ? 'Boardの新規作成' : 'Boardの編集'}
            visible={drawerType != null}
            closable
            onClose={() =>
                dispatch(roomDrawerAndPopoverAndModalModule.actions.set({ boardDrawerType: null }))
            }
            footer={
                <DrawerFooter
                    close={{
                        textType: drawerType?.type === create ? 'cancel' : 'close',
                        onClick: () =>
                            dispatch(
                                roomDrawerAndPopoverAndModalModule.actions.set({
                                    boardDrawerType: null,
                                })
                            ),
                    }}
                    ok={onOkClick == null ? undefined : { textType: 'create', onClick: onOkClick }}
                    destroy={
                        onDestroy == null
                            ? undefined
                            : {
                                  modal: {
                                      title: 'Boardの削除の確認',
                                      content: `このBoard "${board.name}" を削除します。よろしいですか？`,
                                  },
                                  onClick: onDestroy,
                              }
                    }
                />
            }
        >
            <div>
                <Row gutter={gutter} align="middle">
                    <Col flex="auto" />
                    <Col flex={0}>名前</Col>
                    <Col span={inputSpan}>
                        <BufferedInput
                            bufferDuration="default"
                            size="small"
                            value={board.name}
                            onChange={e => {
                                if (e.previousValue === e.currentValue) {
                                    return;
                                }
                                updateBoard({ name: e.currentValue });
                            }}
                        />
                    </Col>
                </Row>
                <Row gutter={gutter} align="middle">
                    <Col flex="auto" />
                    <Col flex={0}>背景画像</Col>
                    <Col span={inputSpan}>
                        <InputFile
                            filePath={board.backgroundImage ?? undefined}
                            onPathChange={path =>
                                updateBoard({
                                    backgroundImage: path == null ? undefined : FilePath.toOt(path),
                                })
                            }
                            openFilesManager={setFilesManagerDrawerType}
                        />
                    </Col>
                </Row>
                <Row gutter={gutter} align="middle">
                    <Col flex="auto" />
                    <Col flex={0}>背景画像の拡大率</Col>
                    <Col span={inputSpan}>
                        <InputNumber
                            size="small"
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
                                    ? updateBoard({ backgroundImageZoom: newValue / 100 })
                                    : undefined
                            }
                        />
                    </Col>
                </Row>
                <Row gutter={gutter} align="middle">
                    <Col flex="auto" />
                    <Col flex={0}>グリッドの数</Col>
                    <Col span={inputSpan}>
                        <span>x=</span>
                        <InputNumber
                            size="small"
                            style={{ width: 80 }}
                            value={board.cellColumnCount}
                            onChange={newValue =>
                                typeof newValue === 'number'
                                    ? updateBoard({ cellColumnCount: newValue })
                                    : undefined
                            }
                        />
                        <span style={{ marginLeft: 10 }}>y=</span>
                        <InputNumber
                            size="small"
                            style={{ width: 80 }}
                            value={board.cellRowCount}
                            onChange={newValue =>
                                typeof newValue === 'number'
                                    ? updateBoard({ cellRowCount: newValue })
                                    : undefined
                            }
                        />
                    </Col>
                </Row>
                <Row gutter={gutter} align="middle">
                    <Col flex="auto" />
                    <Col flex={0}>グリッドの大きさ</Col>
                    <Col span={inputSpan}>
                        {/* cellWidth === cellHeight という前提だが、もし異なる場合は代表してcellWidthの値を用いることにしている */}
                        <InputNumber
                            size="small"
                            value={board.cellWidth}
                            onChange={newValue =>
                                typeof newValue === 'number'
                                    ? updateBoard({ cellWidth: newValue, cellHeight: newValue })
                                    : undefined
                            }
                        />
                    </Col>
                </Row>
                <Row gutter={gutter} align="middle">
                    <Col flex="auto" />
                    <Col flex={0}>グリッドの基準点</Col>
                    <Col span={inputSpan}>
                        <span>x=</span>
                        <InputNumber
                            size="small"
                            value={board.cellOffsetX}
                            onChange={newValue =>
                                typeof newValue === 'number'
                                    ? updateBoard({ cellOffsetX: newValue })
                                    : undefined
                            }
                        />
                        <span style={{ marginLeft: 10 }}>y=</span>
                        <InputNumber
                            size="small"
                            value={board.cellOffsetY}
                            onChange={newValue =>
                                typeof newValue === 'number'
                                    ? updateBoard({ cellOffsetY: newValue })
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

export default BoardDrawer;
