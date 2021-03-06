import React from 'react';
import { success, useImageFromGraphQL } from '../../hooks/image';
import * as ReactKonva from 'react-konva';
import { CompositeKey, compositeKeyToString, createStateMap, equals, ReadonlyStateMap, stringToCompositeKey, toJSONString } from '../../@shared/StateMap';
import { Button, Dropdown, Menu } from 'antd';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import DispatchRoomComponentsStateContext from './contexts/DispatchRoomComponentsStateContext';
import { boardDrawerType, characterDrawerType, create, myNumberValueDrawerType } from './RoomComponentsState';
import { useDispatch } from 'react-redux';
import roomConfigModule from '../../modules/roomConfigModule';
import { BoardsPanelConfig, createDefaultBoardConfig } from '../../states/BoardsPanelConfig';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/types/Node';
import { FilePath } from '../../utils/types';
import { __ } from '../../@shared/collection';
import OperateContext from './contexts/OperateContext';
import { OperationElement, replace, update } from '../../stateManagers/states/types';
import * as Icon from '@ant-design/icons';
import { getCellPosition, getCellSize } from './utils';
import { Character } from '../../stateManagers/states/character';
import { Piece } from '../../stateManagers/states/piece';
import { Room } from '../../stateManagers/states/room';
import { Board as StatesBoard } from '../../stateManagers/states/board';
import { MyNumberValue } from '../../stateManagers/states/myNumberValue';
import { Participant } from '../../stateManagers/states/participant';
import { MyKonva } from '../../foundations/MyKonva';

const emptyCharacterOperation = (): Character.PostOperation => ({
    boolParams: new Map(),
    numParams: new Map(),
    numMaxParams: new Map(),
    strParams: new Map(),
    pieces: createStateMap(),
});

const createPiecePostOperation = ({
    e,
    piece,
    board,
}: {
    e: MyKonva.DragEndResult;
    piece: Piece.State;
    board: StatesBoard.State;
}): Piece.PostOperation => {
    const pieceOperation: Piece.PostOperation = {};
    if (piece.isCellMode) {
        if (e.newLocation != null) {
            const position = getCellPosition({ ...e.newLocation, board });
            pieceOperation.cellX = { newValue: position.cellX };
            pieceOperation.cellY = { newValue: position.cellY };
        }
        if (e.newSize != null) {
            const size = getCellSize({ ...e.newSize, board });
            pieceOperation.cellW = { newValue: size.cellW };
            pieceOperation.cellH = { newValue: size.cellH };
        }
    } else {
        if (e.newLocation != null) {
            pieceOperation.x = { newValue: e.newLocation.x };
            pieceOperation.y = { newValue: e.newLocation.y };
        }
        if (e.newSize != null) {
            pieceOperation.w = { newValue: e.newSize.w };
            pieceOperation.h = { newValue: e.newSize.h };
        }
    }
    return pieceOperation;
};

const emptyMyNumberValueOperation = (): MyNumberValue.PostOperation => ({
    pieces: createStateMap(),
});

const character = 'character';
const myNumberValue = 'myNumberValue';

type SelectedPieceKey = {
    type: typeof character;
    characterKey: CompositeKey;
} | {
    type: typeof myNumberValue;
    stateId: string;
}

type BoardProps = {
    roomId: string;
    boardKey: CompositeKey;
    boardsPanelConfigId: string;
    board: StatesBoard.State;
    boardsPanelConfig: BoardsPanelConfig;
    characters: ReadonlyStateMap<Character.State>;
    participants: ReadonlyMap<string, Participant.State>;
    onClick?: (e: KonvaEventObject<MouseEvent>) => void;
    onContextMenu?: (e: KonvaEventObject<PointerEvent>, stateOffset: MyKonva.Vector2) => void; // stateOffsetは、configなどのxy座標を基準にした位置。
    canvasWidth: number;
    canvasHeight: number;
}

const Board: React.FC<BoardProps> = ({ roomId, board, boardKey, boardsPanelConfigId, boardsPanelConfig, characters, participants, onClick, onContextMenu, canvasWidth, canvasHeight }: BoardProps) => {
    const [selectedPieceKey, setSelectedPieceKey] = React.useState<SelectedPieceKey>();
    const [isBackgroundDragging, setIsBackgroundDragging] = React.useState(false); // これがないと、pieceをドラッグでリサイズする際に背景が少し動いてしまう。
    const backgroundImage = useImageFromGraphQL(board.backgroundImage);
    const dispatch = useDispatch();
    const operate = React.useContext(OperateContext);

    const boardConfig = boardsPanelConfig.boards[compositeKeyToString(boardKey)] ?? createDefaultBoardConfig();

    const grid = (() => {
        if (board.cellRowCount <= 0 ||
            board.cellColumnCount <= 0 ||
            board.cellHeight <= 0 ||
            board.cellWidth <= 0) {
            return null;
        }
        const cellWidth = board.cellWidth;
        const cellHeight = board.cellHeight;
        // TODO: Lineの色を変える
        const verticalLines = [...new Array(board.cellRowCount + 1)].map((_, i) => {
            const height = board.cellColumnCount * cellHeight;
            return (<ReactKonva.Line key={i} points={[i * cellWidth + board.cellOffsetX, board.cellOffsetY, i * cellHeight + board.cellOffsetX, height + board.cellOffsetY]} stroke={'red'} tension={1} />);
        });
        const horizontalLines = [...new Array(board.cellColumnCount + 1)].map((_, i) => {
            const width = board.cellRowCount * cellWidth;
            return (<ReactKonva.Line key={i} points={[board.cellOffsetX, i * cellWidth + board.cellOffsetY, width + board.cellOffsetX, i * cellHeight + board.cellOffsetY]} stroke={'red'} tension={1} />);
        });
        return (
            <>
                {verticalLines}
                {horizontalLines}
            </>);
    })();

    const pieces = (() => {
        const characterPieces = __(characters).compact(([characterKey, character]) => {
            const piece = __(character.pieces).find(([boardKey$]) => {
                return boardKey.createdBy === boardKey$.createdBy && boardKey.id === boardKey$.id;
            });
            if (piece == null) {
                return null;
            }
            const [, pieceValue] = piece.value;
            if (character.image == null) {
                // TODO: 画像なしでコマを表示する
                return null;
            }
            return <MyKonva.IconImage
                {...Piece.getPosition({ ...board, state: pieceValue })}
                key={compositeKeyToString(characterKey)}
                filePath={character.image}
                draggable
                listening
                isSelected={selectedPieceKey?.type === 'character' && equals(selectedPieceKey.characterKey, characterKey)}
                onClick={() => setSelectedPieceKey({ type: 'character', characterKey })}
                onDragEnd={e => {
                    const pieceOperation = createPiecePostOperation({e, piece: pieceValue, board});
                    const pieces = createStateMap<OperationElement<Piece.State, Piece.PostOperation>>();
                    pieces.set(boardKey, { type: update, operation: pieceOperation });
                    const operation = Room.createPostOperationSetup();
                    operation.characters.set(characterKey, {
                        type: update,
                        operation: {
                            ...emptyCharacterOperation(),
                            pieces,
                        }
                    });
                    operate(operation);
                }} />;
        }).toArray();

        const myNumberValuePieces = __([...participants])
            .flatMap(([userUid, participant]) => [...participant.myNumberValues].map(x => [userUid, ...x] as const))
            .compact(([userUid, stateId, myNumberValue]) => {
                const piece = __(myNumberValue.pieces).find(([boardKey$, piece]) => {
                    return boardKey.createdBy === boardKey$.createdBy && boardKey.id === boardKey$.id;
                });
                if (piece == null) {
                    return null;
                }
                const [, pieceValue] = piece.value;
                return <MyKonva.MyNumberValue
                    {...Piece.getPosition({ ...board, state: pieceValue })}
                    key={stateId}
                    myNumberValue={myNumberValue}
                    draggable
                    listening
                    isSelected={selectedPieceKey?.type === 'myNumberValue' && (selectedPieceKey.stateId === stateId)}
                    onClick={() => setSelectedPieceKey({ type: 'myNumberValue', stateId })}
                    onDragEnd={e => {
                        const pieceOperation = createPiecePostOperation({ e, piece: pieceValue, board });
                        const pieces = createStateMap<OperationElement<Piece.State, Piece.PostOperation>>();
                        pieces.set(boardKey, { type: update, operation: pieceOperation });
                    
                        const myNumberValuesOperation = new Map<string, OperationElement<MyNumberValue.State, MyNumberValue.PostOperation>>();
                        myNumberValuesOperation.set(stateId, {
                            type: update,
                            operation: {
                                pieces,
                            },
                        });
                        const operation = Room.createPostOperationSetup();
                        operation.participants.set(userUid, {
                            myNumberValues: myNumberValuesOperation,
                        });
                        operate(operation);
                    }} />;
            }).toArray();

        return (
            <ReactKonva.Layer>
                {characterPieces}
                {myNumberValuePieces}
            </ReactKonva.Layer>);
    })();

    const backgroundImageKonva = backgroundImage.type === 'success' ?
        <ReactKonva.Image
            image={backgroundImage.image}
            scaleX={Math.max(board.backgroundImageZoom, 0)}
            scaleY={Math.max(board.backgroundImageZoom, 0)}
            onClick={e => e.evt.preventDefault()} /> :
        null;

    const scale = Math.pow(2, boardConfig.zoom);

    return (
        <ReactKonva.Stage
            width={canvasWidth}
            height={canvasHeight}
            onClick={e => {
                setSelectedPieceKey(undefined);
                onClick == null ? undefined : onClick(e);
            }}
            onContextMenu={e => {
                if (onContextMenu == null) {
                    return;
                }
                // CONSIDER: scale === 0 のケースに対応していない。configのほうで boardConfig.zoom === -Inf にならないようにするほうが自然か。
                onContextMenu(e, {
                    x: (e.evt.offsetX / scale) + boardConfig.offsetX,
                    y: (e.evt.offsetY / scale) + boardConfig.offsetY,
                });
            }}
            offsetX={boardConfig.offsetX}
            offsetY={boardConfig.offsetY}
            scaleX={scale}
            scaleY={scale}
            onWheel={e => {
                e.evt.preventDefault();
                dispatch(roomConfigModule.actions.zoomBoard({
                    roomId,
                    boardKey,
                    panelId: boardsPanelConfigId,
                    zoomDelta: e.evt.deltaY > 0 ? -0.25 : 0.25,
                    prevCanvasWidth: canvasWidth,
                    prevCanvasHeight: canvasHeight,
                }));
            }}>
            {/* background: ドラッグで全体を動かせる */}
            <ReactKonva.Layer
                onMouseDown={e => {
                    if ((e.evt.buttons & 1) !== 0) {
                        setIsBackgroundDragging(true);
                    }
                }}
                onMouseUp={e => {
                    if ((e.evt.buttons & 1) !== 0) {
                        setIsBackgroundDragging(false);
                    }
                }}
                onMouseLeave={() => {
                    setIsBackgroundDragging(false);
                }}
                onMouseMove={e => {
                    // マウスの左ボタンが押下されていない場合は抜ける
                    if ((e.evt.buttons & 1) === 0) {
                        return;
                    }
                    if (!isBackgroundDragging) {
                        return;
                    }
                    const nonZeroScale = scale === 0 ? 0.01 : scale;
                    dispatch(roomConfigModule.actions.updateBoard({
                        roomId,
                        boardKey,
                        panelId: boardsPanelConfigId,
                        offsetXDelta: -e.evt.movementX / nonZeroScale,
                        offsetYDelta: -e.evt.movementY / nonZeroScale,
                    }));
                }}>
                {/* このRectがないと画像がないところで位置をドラッグで変えることができない。ただもっといい方法があるかも */}
                <ReactKonva.Rect
                    x={-100000}
                    y={-100000}
                    width={200000}
                    height={200000} />
                {backgroundImageKonva}
                {grid}
            </ReactKonva.Layer>
            {/* pieces: ドラッグでpieceのみを動かせる */}
            {pieces}
        </ReactKonva.Stage>);
};

type ContextMenuState = {
    x: number;
    y: number;
    charactersOnCursor: ReadonlyArray<{ characterKey: CompositeKey; character: Character.State; piece: Piece.State }>;
    myNumberValuesOnCursor: ReadonlyArray<{ myNumberValueKey: string; myNumberValue: MyNumberValue.State; piece: Piece.State }>;
}

type Props = {
    boards: ReadonlyStateMap<StatesBoard.State>;
    boardsPanelConfig: BoardsPanelConfig;
    boardsPanelConfigId: string;
    characters: ReadonlyStateMap<Character.State>;
    participants: ReadonlyMap<string, Participant.State>;
    roomId: string;
    canvasWidth: number;
    canvasHeight: number;
    me: Participant.State;
    myUserUid: string;
}

const boardsDropDownStyle: React.CSSProperties = {
    position: 'absolute',
    top: 20,
    right: 20,
};

const zoomButtonStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 70,
    right: 20,
};

const Boards: React.FC<Props> = ({ boards, boardsPanelConfig, boardsPanelConfigId, characters, participants, roomId, canvasWidth: width, canvasHeight: height, me, myUserUid }: Props) => {
    const dispatchRoomComponentsState = React.useContext(DispatchRoomComponentsStateContext);
    const dispatch = useDispatch();
    const [contextMenuState, setContextMenuState] = React.useState<ContextMenuState | null>(null);
    const operate = React.useContext(OperateContext);

    const activeBoardKey = (() => {
        if (boardsPanelConfig.activeBoardKey == null) {
            return null;
        }
        return stringToCompositeKey(boardsPanelConfig.activeBoardKey);
    })();
    const boardComponent = (() => {
        if (boards.size === 0) {
            return (
                <div>
                    Boardが1つも存在しません。
                </div>
            );
        }
        if (activeBoardKey == null) {
            return (<div>Boardが選択されていません。</div>);
        }
        const board = boards.get(activeBoardKey);
        if (board == null) {
            return (<div>{`キーが ${toJSONString(activeBoardKey)} であるBoardが見つかりません。他のBoardを選択してください。`}</div>);
        }
        return (<Board
            canvasWidth={width}
            canvasHeight={height}
            board={board}
            roomId={roomId}
            boardKey={activeBoardKey}
            boardsPanelConfig={boardsPanelConfig}
            boardsPanelConfigId={boardsPanelConfigId}
            characters={characters}
            participants={participants}
            onClick={() => setContextMenuState(null)}
            onContextMenu={(e, stateOffset) => {
                e.evt.preventDefault();
                setContextMenuState({
                    x: e.evt.offsetX,
                    y: e.evt.offsetY,
                    charactersOnCursor: __(characters.toArray())
                        .compact(([characterKey, character]) => {
                            const found = character.pieces.toArray()
                                .find(([boardKey, piece]) => {
                                    if (boardKey.createdBy !== activeBoardKey.createdBy || boardKey.id !== activeBoardKey.id) {
                                        return false;
                                    }
                                    return Piece.isCursorOnIcon({ ...board, state: piece, cursorPosition: stateOffset });
                                });
                            if (found === undefined) {
                                return null;
                            }
                            return { characterKey, character, piece: found[1] };
                        })
                        .toArray(),
                    myNumberValuesOnCursor: __([...participants])
                        .flatMap(([userUid, participant]) => [...participant.myNumberValues].map(x => [userUid, ...x] as const))
                        .compact(([userUid, myNumberValueKey, myNumberValue]) => {
                            const found = myNumberValue.pieces.toArray()
                                .find(([boardKey, piece]) => {
                                    if (boardKey.createdBy !== activeBoardKey.createdBy || boardKey.id !== activeBoardKey.id) {
                                        return false;
                                    }
                                    return Piece.isCursorOnIcon({ ...board, state: piece, cursorPosition: stateOffset });
                                });
                            if (found === undefined) {
                                return null;
                            }
                            return { myNumberValueKey, myNumberValue, piece: found[1] };
                        })
                        .toArray(),
                });
            }} />);
    })();
    const dropDownItems = boards.toArray().map(([key, board]) => (
        <Menu.Item
            key={toJSONString(key)}
            onClick={() => dispatch(roomConfigModule.actions.updateBoardPanel({
                panelId: boardsPanelConfigId,
                roomId: roomId,
                panel: {
                    activeBoardKey: compositeKeyToString(key),
                }
            }))}>
            {board.name === '' ? '(名前なし)' : board.name}
        </Menu.Item>));
    const boardsMenu = (
        <Menu>
            <Menu.ItemGroup title="ボード一覧">
                {dropDownItems}
            </Menu.ItemGroup>
            <Menu.Divider />
            <Menu.Item
                icon={<PlusOutlined />}
                onClick={() => dispatchRoomComponentsState({ type: boardDrawerType, newValue: { type: create } })}>
                新規作成
            </Menu.Item>
        </Menu>
    );
    const contextMenu = (() => {
        if (contextMenuState == null) {
            return null;
        }
        const board = activeBoardKey == null ? undefined : boards.get(activeBoardKey);
        const selectedCharactersMenu = (() => {
            if (activeBoardKey == null || contextMenuState.charactersOnCursor.length === 0) {
                return null;
            }
            return (
                <>
                    {
                        contextMenuState.charactersOnCursor.map(({ characterKey, character, piece }) =>
                            // CharacterKeyをcompositeKeyToStringしてkeyにしている場所が下にもあるため、キーを互いに異なるものにするように文字列を付加している。
                            <Menu.SubMenu key={compositeKeyToString(characterKey) + '@selected'} title={character.name}>
                                <Menu.Item
                                    onClick={() => {
                                        dispatchRoomComponentsState({
                                            type: characterDrawerType,
                                            newValue: {
                                                type: update,
                                                boardKey: activeBoardKey,
                                                stateKey: characterKey,
                                            }
                                        });
                                        setContextMenuState(null);
                                    }}>
                                    編集
                                </Menu.Item>
                                <Menu.Item
                                    onClick={() => {
                                        const pieces = createStateMap<OperationElement<Piece.State, Piece.PostOperation>>();
                                        pieces.set(activeBoardKey, {
                                            type: replace,
                                            newValue: undefined,
                                        });
                                        const operation = Room.createPostOperationSetup();
                                        operation.characters.set(characterKey, {
                                            type: update,
                                            operation: {
                                                ...emptyCharacterOperation(),
                                                pieces,
                                            }
                                        });
                                        operate(operation);
                                        setContextMenuState(null);
                                    }}>
                                    削除
                                </Menu.Item>
                            </Menu.SubMenu>
                        )
                    }
                    <Menu.Divider />
                </>);
        })();

        const allCharactersListMenu = (() => {
            const title = 'キャラクター一覧';
            if (board == null || activeBoardKey == null) {
                return <Menu.SubMenu title={title} disabled />;
            }
            return (
                <Menu.SubMenu title={title}>
                    {__(characters.toArray()).compact(([key, value]) => {
                        const pieceExists = __(value.pieces).exists(([boardKey]) => activeBoardKey.id === boardKey.id && activeBoardKey.createdBy === boardKey.createdBy);

                        const cellPosition = getCellPosition({ ...contextMenuState, board });
                        // TODO: x,y,w,h の値が適当
                        const pieceLocationWhichIsCellMode = {
                            x: 0,
                            y: 0,
                            w: 50,
                            h: 50,
                            cellX: cellPosition.cellX,
                            cellY: cellPosition.cellY,
                            cellW: 1,
                            cellH: 1,
                            isCellMode: true,
                            isPrivate: false,
                        };

                        const pieceLocationWhichIsNotCellMode = {
                            x: contextMenuState.x,
                            y: contextMenuState.y,
                            w: 50,
                            h: 50,
                            isPrivate: false,
                            isCellMode: false,
                            cellX: 0,
                            cellY: 0,
                            cellW: 1,
                            cellH: 1,
                        };

                        return (
                            <Menu.SubMenu key={compositeKeyToString(key)} title={<span>{pieceExists ? <Icon.CheckOutlined /> : null} {value.name}</span>}>
                                <Menu.Item
                                    disabled={!pieceExists}
                                    onClick={() => {
                                        dispatchRoomComponentsState({
                                            type: characterDrawerType,
                                            newValue: {
                                                type: update,
                                                boardKey: activeBoardKey,
                                                stateKey: key,
                                            }
                                        });
                                        setContextMenuState(null);
                                    }}>
                                    編集
                                </Menu.Item>
                                <Menu.SubMenu disabled={pieceExists} title="置く">
                                    <Menu.Item onClick={() => {
                                        const pieces = createStateMap<OperationElement<Piece.State, Piece.PostOperation>>();

                                        pieces.set(activeBoardKey, {
                                            type: replace,
                                            newValue: pieceLocationWhichIsCellMode
                                        });
                                        const operation = Room.createPostOperationSetup();
                                        operation.characters.set(key, {
                                            type: update,
                                            operation: {
                                                ...emptyCharacterOperation(),
                                                pieces,
                                            }
                                        });
                                        operate(operation);
                                        setContextMenuState(null);
                                    }}>
                                        セルにスナップする
                                    </Menu.Item>
                                    <Menu.Item onClick={() => {
                                        const pieces = createStateMap<OperationElement<Piece.State, Piece.PostOperation>>();
                                        pieces.set(activeBoardKey, {
                                            type: replace,
                                            newValue: pieceLocationWhichIsNotCellMode
                                        });
                                        const operation = Room.createPostOperationSetup();
                                        operation.characters.set(key, {
                                            type: update,
                                            operation: {
                                                ...emptyCharacterOperation(),
                                                pieces,
                                            }
                                        });
                                        operate(operation);
                                        setContextMenuState(null);
                                    }}>
                                        セルにスナップしない
                                    </Menu.Item>
                                </Menu.SubMenu>
                                <Menu.Item
                                    disabled={!pieceExists}
                                    onClick={() => {
                                        const pieces = createStateMap<OperationElement<Piece.State, Piece.PostOperation>>();
                                        pieces.set(activeBoardKey, {
                                            type: replace,
                                            newValue: undefined,
                                        });
                                        const operation = Room.createPostOperationSetup();
                                        operation.characters.set(key, {
                                            type: update,
                                            operation: {
                                                ...emptyCharacterOperation(),
                                                pieces,
                                            }
                                        });
                                        operate(operation);
                                        setContextMenuState(null);
                                    }}>
                                    削除
                                </Menu.Item>
                            </Menu.SubMenu>
                        );
                    }).toArray()}
                </Menu.SubMenu>
            );
        })();

        const selectedMyNumbersMenu = (() => {
            if (activeBoardKey == null || contextMenuState.myNumberValuesOnCursor.length === 0) {
                return null;
            }
            return (
                <>
                    {
                        contextMenuState.myNumberValuesOnCursor.map(({ myNumberValueKey, myNumberValue, piece }) =>
                            // CharacterKeyをcompositeKeyToStringしてkeyにしている場所が下にもあるため、キーを互いに異なるものにするように文字列を付加している。
                            <Menu.SubMenu key={myNumberValueKey + '@selected'} title={MyNumberValue.stringify(myNumberValue)}>
                                <Menu.Item
                                    onClick={() => {
                                        dispatchRoomComponentsState({
                                            type: myNumberValueDrawerType,
                                            newValue: {
                                                type: update,
                                                boardKey: activeBoardKey,
                                                stateKey: myNumberValueKey,
                                            }
                                        });
                                        setContextMenuState(null);
                                    }}>
                                    編集
                                </Menu.Item>
                                <Menu.Item
                                    onClick={() => {
                                        const myNumberValues = new Map<string, OperationElement<MyNumberValue.State, MyNumberValue.PostOperation>>();
                                        myNumberValues.set(myNumberValueKey, {
                                            type: replace,
                                            newValue: undefined,
                                        });
                                        const operation = Room.createPostOperationSetup();
                                        operation.participants.set(myUserUid, {
                                            myNumberValues,
                                        });
                                        operate(operation);
                                        setContextMenuState(null);
                                    }}>
                                    削除
                                </Menu.Item>
                            </Menu.SubMenu>
                        )
                    }
                    <Menu.Divider />
                </>);
        })();

        const allMyNumbersMenu = (() => {
            const title = '一時コマ（仮称）一覧';
            if (board == null || activeBoardKey == null) {
                return <Menu.SubMenu title={title} disabled />;
            }

            const cellPosition = getCellPosition({ ...contextMenuState, board });
            // TODO: x,y,w,h の値が適当
            const pieceLocationWhichIsCellMode = {
                x: 0,
                y: 0,
                w: 50,
                h: 50,
                cellX: cellPosition.cellX,
                cellY: cellPosition.cellY,
                cellW: 1,
                cellH: 1,
                isCellMode: true,
                isPrivate: false,
            };

            const pieceLocationWhichIsNotCellMode = {
                x: contextMenuState.x,
                y: contextMenuState.y,
                w: 50,
                h: 50,
                isPrivate: false,
                isCellMode: false,
                cellX: 0,
                cellY: 0,
                cellW: 1,
                cellH: 1,
            };

            return (
                <Menu.SubMenu title={title}>
                    <Menu.SubMenu title='数値'>
                        {__(me.myNumberValues).compact(([key, value]) => {
                            const pieceExists = __(value.pieces).exists(([boardKey]) => activeBoardKey.id === boardKey.id && activeBoardKey.createdBy === boardKey.createdBy);
                            return (
                                <Menu.SubMenu key={key} title={<span>{pieceExists ? <Icon.CheckOutlined /> : null} {MyNumberValue.stringify(value)}</span>}>
                                    <Menu.Item
                                        onClick={() => {
                                            dispatchRoomComponentsState({
                                                type: myNumberValueDrawerType,
                                                newValue: {
                                                    type: update,
                                                    boardKey: activeBoardKey,
                                                    stateKey: key,
                                                }
                                            });
                                            setContextMenuState(null);
                                        }}>
                                        編集
                                    </Menu.Item>
                                    <Menu.Item
                                        onClick={() => {
                                            const myNumberValues = new Map<string, OperationElement<MyNumberValue.State, MyNumberValue.PostOperation>>();
                                            myNumberValues.set(key, {
                                                type: replace,
                                                newValue: undefined,
                                            });
                                            const operation = Room.createPostOperationSetup();
                                            operation.participants.set(myUserUid, {
                                                myNumberValues,
                                            });
                                            operate(operation);
                                            setContextMenuState(null);
                                        }}>
                                        削除
                                    </Menu.Item>
                                </Menu.SubMenu>
                            );
                        }).toArray()}
                        <Menu.Divider />
                        <Menu.SubMenu title='追加'>
                            <Menu.Item
                                onClick={() => {
                                    dispatchRoomComponentsState({
                                        type: myNumberValueDrawerType,
                                        newValue: {
                                            type: create,
                                            boardKey: activeBoardKey,
                                            piece: pieceLocationWhichIsCellMode,
                                        }
                                    });
                                    setContextMenuState(null);
                                }}>
                                セルにスナップする
                            </Menu.Item>
                            <Menu.Item
                                onClick={() => {
                                    dispatchRoomComponentsState({
                                        type: myNumberValueDrawerType,
                                        newValue: {
                                            type: create,
                                            boardKey: activeBoardKey,
                                            piece: pieceLocationWhichIsNotCellMode,
                                        }
                                    });
                                    setContextMenuState(null);
                                }}>
                                セルにスナップしない
                            </Menu.Item>
                        </Menu.SubMenu>
                    </Menu.SubMenu>
                </Menu.SubMenu>
            );
        })();

        return (
            <div style={({ position: 'absolute', left: contextMenuState.x, top: contextMenuState.y })}>
                <Menu>
                    {selectedCharactersMenu}
                    {selectedMyNumbersMenu}
                    {allCharactersListMenu}
                    {allMyNumbersMenu}
                </Menu>
            </div>);
    }
    )();

    const noActiveBoardText = '';

    return (
        <div style={({ position: 'relative' })}>
            {boardComponent}
            <span style={boardsDropDownStyle}>
                <Dropdown overlay={boardsMenu} trigger={['click']}>
                    <Button>
                        {activeBoardKey == null ? noActiveBoardText : (boards.get(activeBoardKey)?.name ?? noActiveBoardText)} <DownOutlined />
                    </Button>
                </Dropdown>
                <Button
                    disabled={activeBoardKey == null}
                    onClick={() => {
                        if (activeBoardKey == null) {
                            return;
                        }
                        dispatchRoomComponentsState({ type: boardDrawerType, newValue: { type: update, stateKey: activeBoardKey } });
                    }}>
                    編集
                </Button>
            </span>
            <div style={zoomButtonStyle}>
                <div style={({ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' })}>
                    <Button onClick={() => {
                        if (activeBoardKey == null) {
                            return;
                        }
                        dispatch(roomConfigModule.actions.updateBoard({
                            roomId,
                            boardKey: activeBoardKey,
                            panelId: boardsPanelConfigId,
                            zoomDelta: 0.25,
                        }));
                    }}>
                        <Icon.ZoomInOutlined />
                    </Button>
                    <Button onClick={() => {
                        if (activeBoardKey == null) {
                            return;
                        }
                        dispatch(roomConfigModule.actions.updateBoard({
                            roomId,
                            boardKey: activeBoardKey,
                            panelId: boardsPanelConfigId,
                            zoomDelta: -0.25,
                        }));
                    }}>
                        <Icon.ZoomOutOutlined />
                    </Button>
                    <div style={({ height: 6 })} />
                    <Button onClick={() => {
                        if (activeBoardKey == null) {
                            return;
                        }
                        dispatch(roomConfigModule.actions.resetBoard({
                            roomId,
                            boardKey: activeBoardKey,
                            panelId: boardsPanelConfigId,
                        }));
                    }}>
                        Boardの位置とズームをリセット
                    </Button>
                </div>
            </div>
            {contextMenu}
        </div >
    );
};

export default Boards;