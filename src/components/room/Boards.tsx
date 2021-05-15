import React from 'react';
import { success, useImageFromGraphQL } from '../../hooks/image';
import * as ReactKonva from 'react-konva';
import { CompositeKey, compositeKeyToString, createStateMap, equals, ReadonlyStateMap, stringToCompositeKey, toJSONString } from '../../@shared/StateMap';
import { Button, Dropdown, Menu, Tooltip } from 'antd';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import DispatchRoomComponentsStateContext from './contexts/DispatchRoomComponentsStateContext';
import { boardDrawerType, characterDrawerType, create, myNumberValueDrawerType } from './RoomComponentsState';
import { useDispatch } from 'react-redux';
import roomConfigModule from '../../modules/roomConfigModule';
import { BoardConfig, BoardsPanelConfig, createDefaultBoardConfig } from '../../states/BoardsPanelConfig';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/types/Node';
import { FilePath } from '../../utils/types';
import { __ } from '../../@shared/collection';
import { OperationElement, replace, update } from '../../stateManagers/states/types';
import * as Icon from '@ant-design/icons';
import { MyKonva } from '../../foundations/MyKonva';
import { AllRoomMessagesResult, Message, publicMessage, RoomMessage, useFilteredRoomMessages } from '../../hooks/useRoomMessages';
import { $free } from '../../@shared/Constants';
import { useSelector } from '../../store';
import { useOperate } from '../../hooks/useOperate';
import { useMe } from '../../hooks/useMe';
import * as RoomModule from '../../@shared/ot/room/v1';
import * as StatesBoard from '../../@shared/ot/room/participant/board/v1';
import * as Character from '../../@shared/ot/room/participant/character/v1';
import * as MyNumberValueModule from '../../@shared/ot/room/participant/myNumberValue/v1';
import * as PieceModule from '../../@shared/ot/piece/v1';
import * as BoardLocationModule from '../../@shared/ot/boardLocation/v1';
import { useCharacters } from '../../hooks/state/useCharacters';
import { useParticipants } from '../../hooks/state/useParticipants';
import { Piece } from '../../utils/piece';
import { useBoards } from '../../hooks/state/useBoards';
import { recordToArray, recordToDualKeyMap, recordToMap } from '../../@shared/utils';
import { RecordUpOperationElement } from '../../@shared/ot/room/util/recordOperationElement';
import { MyNumberValue } from '../../utils/myNumberValue';
import { BoardLocation } from '../../utils/boardLocation';

namespace Resource {
    export const cellSizeIsTooSmall = 'セルが小さすぎるため、無効化されています';
}

const createPiecePostOperation = ({
    e,
    piece,
    board,
}: {
    e: MyKonva.DragEndResult;
    piece: PieceModule.State;
    board: StatesBoard.State;
}): PieceModule.UpOperation => {
    const pieceOperation: PieceModule.UpOperation = { $version: 1 };
    if (piece.isCellMode) {
        if (e.newLocation != null) {
            const position = Piece.getCellPosition({ ...e.newLocation, board });
            pieceOperation.cellX = { newValue: position.cellX };
            pieceOperation.cellY = { newValue: position.cellY };
        }
        if (e.newSize != null) {
            const size = Piece.getCellSize({ ...e.newSize, board });
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

const createTachieLocationPostOperation = ({
    e,
}: {
    e: MyKonva.DragEndResult;
}): PieceModule.UpOperation => {
    const pieceOperation: BoardLocationModule.UpOperation = { $version: 1 };
    if (e.newLocation != null) {
        pieceOperation.x = { newValue: e.newLocation.x };
        pieceOperation.y = { newValue: e.newLocation.y };
    }
    if (e.newSize != null) {
        pieceOperation.w = { newValue: e.newSize.w };
        pieceOperation.h = { newValue: e.newSize.h };
    }
    return pieceOperation;
};

const character = 'character';
const tachie = 'tachie';
const myNumberValue = 'myNumberValue';

type SelectedPieceKey = {
    type: typeof character;
    characterKey: CompositeKey;
} | {
    type: typeof tachie;
    characterKey: CompositeKey;
} | {
    type: typeof myNumberValue;
    stateId: string;
}

const publicMessageFilter = (message: Message): boolean => {
    return message.type === publicMessage;
};

type BoardProps = {
    boardKey: CompositeKey;
    boardsPanelConfigId: string;
    board: StatesBoard.State;
    boardsPanelConfig: BoardsPanelConfig;
    onClick?: (e: KonvaEventObject<MouseEvent>) => void;
    onContextMenu?: (e: KonvaEventObject<PointerEvent>, stateOffset: MyKonva.Vector2) => void; // stateOffsetは、configなどのxy座標を基準にした位置。
    canvasWidth: number;
    canvasHeight: number;
}

const Board: React.FC<BoardProps> = ({
    board,
    boardKey,
    boardsPanelConfigId,
    boardsPanelConfig,
    onClick,
    onContextMenu,
    canvasWidth,
    canvasHeight
}: BoardProps) => {
    const roomId = useSelector(state => state.roomModule.roomId);
    const characters = useCharacters();
    const participants = useParticipants();

    const [selectedPieceKey, setSelectedPieceKey] = React.useState<SelectedPieceKey>();
    const [isBackgroundDragging, setIsBackgroundDragging] = React.useState(false); // これがないと、pieceをドラッグでリサイズする際に背景が少し動いてしまう。
    const backgroundImage = useImageFromGraphQL(board.backgroundImage);
    const dispatch = useDispatch();
    const operate = useOperate();
    const publicMessages = useFilteredRoomMessages({ filter: publicMessageFilter });
    const { userUid: myUserUid } = useMe();

    if (myUserUid == null || roomId == null || characters == null || participants == null) {
        return null;
    }

    const boardConfig = boardsPanelConfig.boards[compositeKeyToString(boardKey)] ?? createDefaultBoardConfig();

    const lastPublicMessage = (() => {
        if (publicMessages.length === 0) {
            return undefined;
        }
        const lastMessage = publicMessages[publicMessages.length - 1];
        if (lastMessage.type !== publicMessage) {
            return undefined;
        }
        return lastMessage.value;
    })();

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
            const piece = __(recordToDualKeyMap<PieceModule.State>(character.pieces)).find(([boardKey$]) => {
                return boardKey.createdBy === boardKey$.first && boardKey.id === boardKey$.second;
            });
            if (piece == null) {
                return null;
            }
            const [, pieceValue] = piece.value;
            if (character.image == null) {
                // TODO: 画像なしでコマを表示する
                return null;
            }
            return <MyKonva.Image
                {...Piece.getPosition({ ...board, state: pieceValue })}
                key={compositeKeyToString(characterKey)}
                filePath={character.image}
                draggable
                listening
                isSelected={selectedPieceKey?.type === 'character' && equals(selectedPieceKey.characterKey, characterKey)}
                onClick={() => setSelectedPieceKey({ type: 'character', characterKey })}
                onDragEnd={e => {
                    const pieceOperation = createPiecePostOperation({ e, piece: pieceValue, board });
                    const operation: RoomModule.UpOperation = {
                        $version: 1,
                        participants: {
                            [characterKey.createdBy]: {
                                type: update,
                                update: {
                                    $version: 1,
                                    characters: {
                                        [characterKey.id]: {
                                            type: update,
                                            update: {
                                                $version: 1,
                                                pieces: {
                                                    [boardKey.createdBy]: {
                                                        [boardKey.id]: {
                                                            type: update,
                                                            update: pieceOperation,
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    };
                    operate(operation);
                }} />;
        }).toArray();

        const tachieLocations = __(characters).compact(([characterKey, character]) => {
            const tachieLocation = __(recordToDualKeyMap<BoardLocationModule.State>(character.tachieLocations)).find(([boardKey$]) => {
                return boardKey.createdBy === boardKey$.first && boardKey.id === boardKey$.second;
            });
            if (tachieLocation == null) {
                return null;
            }
            const [, pieceValue] = tachieLocation.value;
            if (character.tachieImage == null) {
                // TODO: 画像なしでコマを表示する
                return null;
            }
            return <MyKonva.Image
                message={lastPublicMessage}
                messageFilter={msg => {
                    return msg.createdBy === characterKey.createdBy && msg.character?.stateId === characterKey.id && msg.channelKey !== $free;
                }}
                x={pieceValue.x}
                y={pieceValue.y}
                w={pieceValue.w}
                h={pieceValue.h}
                opacity={0.75 /* TODO: opacityの値が適当 */}
                key={compositeKeyToString(characterKey)}
                filePath={character.tachieImage}
                draggable
                listening
                isSelected={selectedPieceKey?.type === 'tachie' && equals(selectedPieceKey.characterKey, characterKey)}
                onClick={() => setSelectedPieceKey({ type: 'tachie', characterKey })}
                onDragEnd={e => {
                    const tachieLocationOperation = createTachieLocationPostOperation({ e });
                    const operation: RoomModule.UpOperation = {
                        $version: 1,
                        participants: {
                            [characterKey.createdBy]: {
                                type: update,
                                update: {
                                    $version: 1,
                                    characters: {
                                        [characterKey.id]: {
                                            type: update,
                                            update: {
                                                $version: 1,
                                                tachieLocations: {
                                                    [boardKey.createdBy]: {
                                                        [boardKey.id]: {
                                                            type: update,
                                                            update: tachieLocationOperation,
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    };
                    operate(operation);
                }} />;
        }).toArray();

        const myNumberValuePieces = __([...participants])
            .flatMap(([userUid, participant]) => recordToArray(participant.myNumberValues).map(pair => [userUid, pair.key, pair.value] as const))
            .compact(([userUid, stateId, myNumberValue]) => {
                const piece = __(recordToDualKeyMap<PieceModule.State>(myNumberValue.pieces)).find(([boardKey$, piece]) => {
                    return boardKey.createdBy === boardKey$.first && boardKey.id === boardKey$.second;
                });
                if (piece == null) {
                    return null;
                }
                const [, pieceValue] = piece.value;
                return <MyKonva.MyNumberValue
                    {...Piece.getPosition({ ...board, state: pieceValue })}
                    key={stateId}
                    myNumberValue={myNumberValue}
                    createdByMe={userUid === myUserUid}
                    draggable
                    listening
                    isSelected={selectedPieceKey?.type === 'myNumberValue' && (selectedPieceKey.stateId === stateId)}
                    onClick={() => setSelectedPieceKey({ type: 'myNumberValue', stateId })}
                    onDragEnd={e => {
                        const pieceOperation = createPiecePostOperation({ e, piece: pieceValue, board });
                        const operation: RoomModule.UpOperation = {
                            $version: 1,
                            participants: {
                                [userUid]: {
                                    type: update,
                                    update: {
                                        $version: 1,
                                        myNumberValues: {
                                            [stateId]: {
                                                type: update,
                                                update: {
                                                    $version: 1,
                                                    pieces: {
                                                        [boardKey.createdBy]: {
                                                            [boardKey.id]: {
                                                                type: update,
                                                                update: pieceOperation,
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        };
                        operate(operation);
                    }} />;
            }).toArray();

        return (
            <ReactKonva.Layer>
                {tachieLocations}
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
    characterPiecesOnCursor: ReadonlyArray<{ characterKey: CompositeKey; character: Character.State; piece: PieceModule.State }>;
    tachiesOnCursor: ReadonlyArray<{ characterKey: CompositeKey; character: Character.State; tachieLocation: BoardLocationModule.State }>;
    myNumberValuesOnCursor: ReadonlyArray<{ myNumberValueKey: string; myNumberValue: MyNumberValueModule.State; piece: PieceModule.State; userUid: string }>;
}

namespace ContextMenuState {
    export const toKonvaPosition = ({
        contextMenuState,
        boardConfig,
    }: {
        contextMenuState: ContextMenuState;
        boardConfig: BoardConfig;
    }): { x: number; y: number } => {
        const scale = Math.pow(2, boardConfig.zoom);
        return {
            x: (contextMenuState.x / scale) + boardConfig.offsetX,
            y: (contextMenuState.y / scale) + boardConfig.offsetY,
        };
    };
}

type Props = {
    boardsPanelConfig: BoardsPanelConfig;
    boardsPanelConfigId: string;
    canvasWidth: number;
    canvasHeight: number;
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

const Boards: React.FC<Props> = ({
    boardsPanelConfig,
    boardsPanelConfigId,
    canvasWidth,
    canvasHeight,
}: Props) => {
    const dispatchRoomComponentsState = React.useContext(DispatchRoomComponentsStateContext);
    const dispatch = useDispatch();
    const [contextMenuState, setContextMenuState] = React.useState<ContextMenuState | null>(null);
    const operate = useOperate();
    const roomId = useSelector(state => state.roomModule.roomId);
    const boards = useBoards();
    const characters = useCharacters();
    const participants = useParticipants();
    const { participant: me, userUid: myUserUid } = useMe();
    if (me == null || myUserUid == null || roomId == null || boards == null || characters == null) {
        return null;
    }

    const activeBoardKey = (() => {
        if (boardsPanelConfig.activeBoardKey == null) {
            return null;
        }
        return stringToCompositeKey(boardsPanelConfig.activeBoardKey);
    })();
    const boardConfig = (activeBoardKey == null ? null : boardsPanelConfig.boards[compositeKeyToString(activeBoardKey)]) ?? createDefaultBoardConfig();
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
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            board={board}
            boardKey={activeBoardKey}
            boardsPanelConfig={boardsPanelConfig}
            boardsPanelConfigId={boardsPanelConfigId}
            onClick={() => setContextMenuState(null)}
            onContextMenu={(e, stateOffset) => {
                e.evt.preventDefault();
                setContextMenuState({
                    x: e.evt.offsetX,
                    y: e.evt.offsetY,
                    characterPiecesOnCursor: __(characters.toArray())
                        .compact(([characterKey, character]) => {
                            const found = recordToDualKeyMap<PieceModule.State>(character.pieces).toArray()
                                .find(([boardKey, piece]) => {
                                    if (boardKey.first !== activeBoardKey.createdBy || boardKey.second !== activeBoardKey.id) {
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
                    tachiesOnCursor: __(characters.toArray())
                        .compact(([characterKey, character]) => {
                            const found = recordToDualKeyMap<BoardLocationModule.State>(character.tachieLocations).toArray()
                                .find(([boardKey, tachie]) => {
                                    if (boardKey.first !== activeBoardKey.createdBy || boardKey.second !== activeBoardKey.id) {
                                        return false;
                                    }
                                    return BoardLocation.isCursorOnIcon({ state: tachie, cursorPosition: stateOffset });
                                });
                            if (found === undefined) {
                                return null;
                            }
                            return { characterKey, character, tachieLocation: found[1] };
                        })
                        .toArray(),
                    myNumberValuesOnCursor: __([...(participants ?? [])])
                        .flatMap(([userUid, participant]) => [...recordToMap(participant.myNumberValues)].map(([key, value]) => [userUid, key, value] as const))
                        .compact(([userUid, myNumberValueKey, myNumberValue]) => {
                            const found = recordToDualKeyMap<PieceModule.State>(myNumberValue.pieces).toArray()
                                .find(([boardKey, piece]) => {
                                    if (boardKey.first !== activeBoardKey.createdBy || boardKey.second !== activeBoardKey.id) {
                                        return false;
                                    }
                                    return Piece.isCursorOnIcon({ ...board, state: piece, cursorPosition: stateOffset });
                                });
                            if (found === undefined) {
                                return null;
                            }
                            return { myNumberValueKey, myNumberValue, piece: found[1], userUid };
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
                roomId,
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

        const selectedCharacterPiecesMenu = (() => {
            if (activeBoardKey == null || contextMenuState.characterPiecesOnCursor.length === 0) {
                return null;
            }
            return (
                <>
                    {
                        contextMenuState.characterPiecesOnCursor.map(({ characterKey, character }) =>
                            // CharacterKeyをcompositeKeyToStringしてkeyにしている場所が他にもあるため、キーを互いに異なるものにするように文字列を付加している。
                            <Menu.SubMenu key={compositeKeyToString(characterKey) + '@selected-piece'} title={`${character.name} (コマ)`}>
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
                                        const operation: RoomModule.UpOperation = {
                                            $version: 1,
                                            participants: {
                                                [characterKey.createdBy]: {
                                                    type: update,
                                                    update: {
                                                        $version: 1,
                                                        characters: {
                                                            [characterKey.id]: {
                                                                type: update,
                                                                update: {
                                                                    $version: 1,
                                                                    pieces: {
                                                                        [activeBoardKey.createdBy]: {
                                                                            [activeBoardKey.id]: {
                                                                                type: replace,
                                                                                replace: { newValue: undefined },
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        };
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

        const selectedTachiesMenu = (() => {
            if (activeBoardKey == null || contextMenuState.tachiesOnCursor.length === 0) {
                return null;
            }
            return (
                <>
                    {
                        contextMenuState.tachiesOnCursor.map(({ characterKey, character }) =>
                            // CharacterKeyをcompositeKeyToStringしてkeyにしている場所が他にもあるため、キーを互いに異なるものにするように文字列を付加している。
                            <Menu.SubMenu key={compositeKeyToString(characterKey) + '@selected-tachie'} title={`${character.name} (立ち絵)`}>
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
                                        const operation: RoomModule.UpOperation = {
                                            $version: 1,
                                            participants: {
                                                [characterKey.createdBy]: {
                                                    type: update,
                                                    update: {
                                                        $version: 1,
                                                        characters: {
                                                            [characterKey.id]: {
                                                                type: update,
                                                                update: {
                                                                    $version: 1,
                                                                    tachieLocations: {
                                                                        [activeBoardKey.createdBy]: {
                                                                            [activeBoardKey.id]: {
                                                                                type: replace,
                                                                                replace: { newValue: undefined },
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        };
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
                        const pieceExists = recordToDualKeyMap(value.pieces).toArray().some(([boardKey]) => activeBoardKey.id === boardKey.second && activeBoardKey.createdBy === boardKey.first);
                        const tachieExists = recordToDualKeyMap(value.tachieLocations).toArray().some(([boardKey]) => activeBoardKey.id === boardKey.second && activeBoardKey.createdBy === boardKey.first);

                        const { x, y } = ContextMenuState.toKonvaPosition({ contextMenuState, boardConfig });
                        const cellPosition = Piece.getCellPosition({ x, y, board });
                        // TODO: x,y,w,h の値が適当
                        const pieceLocationWhichIsCellMode: PieceModule.State = {
                            $version: 1,
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

                        const pieceLocationWhichIsNotCellMode: PieceModule.State = {
                            $version: 1,
                            x,
                            y,
                            w: 50,
                            h: 50,
                            isCellMode: false,
                            isPrivate: false,
                            cellX: 0,
                            cellY: 0,
                            cellW: 1,
                            cellH: 1,
                        };

                        const tachieLocationWhichIsNotCellMode: BoardLocationModule.State = {
                            $version: 1,
                            x,
                            y,
                            w: 100,
                            h: 150,
                            isPrivate: false,
                        };

                        return (
                            <Menu.SubMenu key={compositeKeyToString(key)} title={value.name}>
                                <Menu.SubMenu title={<span>{pieceExists ? <Icon.CheckOutlined /> : null} {'コマ'}</span>}>
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
                                        <Menu.Item
                                            disabled={Math.min(board.cellHeight, board.cellWidth) <= 0}
                                            onClick={() => {
                                                const operation: RoomModule.UpOperation = {
                                                    $version: 1,
                                                    participants: {
                                                        [key.createdBy]: {
                                                            type: update,
                                                            update: {
                                                                $version: 1,
                                                                characters: {
                                                                    [key.id]: {
                                                                        type: update,
                                                                        update: {
                                                                            $version: 1,
                                                                            tachieLocations: {
                                                                                [activeBoardKey.createdBy]: {
                                                                                    [activeBoardKey.id]: {
                                                                                        type: replace,
                                                                                        replace: { newValue: undefined },
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                };
                                                operate(operation);
                                                setContextMenuState(null);
                                            }}>
                                            <Tooltip title={Math.min(board.cellHeight, board.cellWidth) <= 0 ? Resource.cellSizeIsTooSmall : undefined}>
                                                セルにスナップする
                                            </Tooltip>
                                        </Menu.Item>
                                        <Menu.Item onClick={() => {
                                            const operation: RoomModule.UpOperation = {
                                                $version: 1,
                                                participants: {
                                                    [key.createdBy]: {
                                                        type: update,
                                                        update: {
                                                            $version: 1,
                                                            characters: {
                                                                [key.id]: {
                                                                    type: update,
                                                                    update: {
                                                                        $version: 1,
                                                                        pieces: {
                                                                            [activeBoardKey.createdBy]: {
                                                                                [activeBoardKey.id]: {
                                                                                    type: replace,
                                                                                    replace: { newValue: pieceLocationWhichIsNotCellMode },
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            };
                                            operate(operation);
                                            setContextMenuState(null);
                                        }}>
                                            セルにスナップしない
                                        </Menu.Item>
                                    </Menu.SubMenu>
                                    <Menu.Item
                                        disabled={!pieceExists}
                                        onClick={() => {
                                            const operation: RoomModule.UpOperation = {
                                                $version: 1,
                                                participants: {
                                                    [key.createdBy]: {
                                                        type: update,
                                                        update: {
                                                            $version: 1,
                                                            characters: {
                                                                [key.id]: {
                                                                    type: update,
                                                                    update: {
                                                                        $version: 1,
                                                                        pieces: {
                                                                            [activeBoardKey.createdBy]: {
                                                                                [activeBoardKey.id]: {
                                                                                    type: replace,
                                                                                    replace: { newValue: undefined },
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            };
                                            operate(operation);
                                            setContextMenuState(null);
                                        }}>
                                        削除
                                    </Menu.Item>
                                </Menu.SubMenu>
                                <Menu.SubMenu title={<span>{tachieExists ? <Icon.CheckOutlined /> : null} {'立ち絵'}</span>}>
                                    <Menu.Item
                                        disabled={!tachieExists}
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
                                    <Menu.Item
                                        disabled={tachieExists}
                                        onClick={() => {
                                            const operation: RoomModule.UpOperation = {
                                                $version: 1,
                                                participants: {
                                                    [key.createdBy]: {
                                                        type: update,
                                                        update: {
                                                            $version: 1,
                                                            characters: {
                                                                [key.id]: {
                                                                    type: update,
                                                                    update: {
                                                                        $version: 1,
                                                                        tachieLocations: {
                                                                            [activeBoardKey.createdBy]: {
                                                                                [activeBoardKey.id]: {
                                                                                    type: replace,
                                                                                    replace: { newValue: tachieLocationWhichIsNotCellMode },
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            };
                                            operate(operation);
                                            setContextMenuState(null);
                                        }}>
                                        置く
                                    </Menu.Item>
                                    <Menu.Item
                                        disabled={!tachieExists}
                                        onClick={() => {
                                            const operation: RoomModule.UpOperation = {
                                                $version: 1,
                                                participants: {
                                                    [key.createdBy]: {
                                                        type: update,
                                                        update: {
                                                            $version: 1,
                                                            characters: {
                                                                [key.id]: {
                                                                    type: update,
                                                                    update: {
                                                                        $version: 1,
                                                                        tachieLocations: {
                                                                            [activeBoardKey.createdBy]: {
                                                                                [activeBoardKey.id]: {
                                                                                    type: replace,
                                                                                    replace: { newValue: undefined },
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            };
                                            operate(operation);
                                            setContextMenuState(null);
                                        }}>
                                        削除
                                    </Menu.Item>
                                </Menu.SubMenu>
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
                        contextMenuState.myNumberValuesOnCursor.map(({ myNumberValueKey, myNumberValue, piece, userUid }) =>
                            // CharacterKeyをcompositeKeyToStringしてkeyにしている場所が下にもあるため、キーを互いに異なるものにするように文字列を付加している。
                            <Menu.SubMenu key={myNumberValueKey + '@selected'} title={MyNumberValue.stringify(myNumberValue)}>
                                {userUid === myUserUid ? <Menu.Item
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
                                </Menu.Item> :
                                    <Menu.Item disabled>
                                        <Tooltip title='自分以外が作成したコマでは、値を編集することはできません。'>
                                            編集
                                        </Tooltip>
                                    </Menu.Item>}
                                <Menu.Item
                                    onClick={() => {
                                        const operation: RoomModule.UpOperation = {
                                            $version: 1,
                                            participants: {
                                                [myUserUid]: {
                                                    type: update,
                                                    update: {
                                                        $version: 1,
                                                        myNumberValues: {
                                                            [myNumberValueKey]: {
                                                                type: replace,
                                                                replace: { newValue: undefined }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        };
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

            const nonCellPosition = ContextMenuState.toKonvaPosition({ contextMenuState, boardConfig });
            const cellPosition = Piece.getCellPosition({ x: nonCellPosition.x, y: nonCellPosition.y, board });


            // TODO: x,y,w,h の値が適当
            const pieceLocationWhichIsCellMode: PieceModule.State = {
                $version: 1,
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

            const pieceLocationWhichIsNotCellMode: PieceModule.State = {
                $version: 1,
                x: nonCellPosition.x,
                y: nonCellPosition.y,
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
                        {__(recordToArray(me.myNumberValues)).compact(({ key, value }) => {
                            const pieceExists = recordToDualKeyMap(value.pieces).toArray().some(([boardKey]) => activeBoardKey.id === boardKey.second && activeBoardKey.createdBy === boardKey.first);
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
                                            const operation: RoomModule.UpOperation = {
                                                $version: 1,
                                                participants: {
                                                    [myUserUid]: {
                                                        type: update,
                                                        update: {
                                                            $version: 1,
                                                            myNumberValues: {
                                                                [key]: {
                                                                    type: replace,
                                                                    replace: { newValue: undefined }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            };
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
                                disabled={Math.min(board.cellHeight, board.cellWidth) <= 0}
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
                                <Tooltip title={Math.min(board.cellHeight, board.cellWidth) <= 0 ? Resource.cellSizeIsTooSmall : undefined}>
                                    セルにスナップする
                                </Tooltip>
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
                    {selectedCharacterPiecesMenu}
                    {selectedTachiesMenu}
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
                        dispatch(roomConfigModule.actions.zoomBoard({
                            roomId,
                            boardKey: activeBoardKey,
                            panelId: boardsPanelConfigId,
                            zoomDelta: 0.25,
                            prevCanvasWidth: canvasWidth,
                            prevCanvasHeight: canvasHeight,
                        }));
                    }}>
                        <Icon.ZoomInOutlined />
                    </Button>
                    <Button onClick={() => {
                        if (activeBoardKey == null) {
                            return;
                        }
                        dispatch(roomConfigModule.actions.zoomBoard({
                            roomId,
                            boardKey: activeBoardKey,
                            panelId: boardsPanelConfigId,
                            zoomDelta: -0.25,
                            prevCanvasWidth: canvasWidth,
                            prevCanvasHeight: canvasHeight,
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