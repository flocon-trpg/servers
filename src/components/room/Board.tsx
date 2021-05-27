import React from 'react';
import { useImageFromGraphQL } from '../../hooks/image';
import * as ReactKonva from 'react-konva';
import { Button, Dropdown, Menu, Modal, Popover, Tooltip } from 'antd';
import * as Icons from '@ant-design/icons';
import DispatchRoomComponentsStateContext from './contexts/DispatchRoomComponentsStateContext';
import { boardDrawerType, characterDrawerType, create, myNumberValueDrawerType } from './RoomComponentsState';
import { useDispatch } from 'react-redux';
import roomConfigModule from '../../modules/roomConfigModule';
import { BoardEditorPanelConfig } from '../../states/BoardEditorPanelConfig';
import { KonvaEventObject } from 'konva/types/Node';
import { replace, update } from '../../stateManagers/states/types';
import * as Icon from '@ant-design/icons';
import { MyKonva } from '../../foundations/MyKonva';
import { Message, publicMessage, useFilteredRoomMessages } from '../../hooks/useRoomMessages';
import { useSelector } from '../../store';
import { useOperate } from '../../hooks/useOperate';
import { useMe } from '../../hooks/useMe';
import { useCharacters } from '../../hooks/state/useCharacters';
import { useParticipants } from '../../hooks/state/useParticipants';
import { Piece } from '../../utils/piece';
import { useBoards } from '../../hooks/state/useBoards';
import { MyNumberValue } from '../../utils/myNumberValue';
import { BoardLocation } from '../../utils/boardLocation';
import { BoardConfig, defaultBoardConfig } from '../../states/BoardConfig';
import { ActiveBoardPanelConfig } from '../../states/ActiveBoardPanelConfig';
import { ActiveBoardSelectorModal } from './ActiveBoardSelecterModal';
import { executeCharacterFlocommand, listCharacterFlocommand } from '../../flocommand/main';
import useConstant from 'use-constant';
import { debounceTime } from 'rxjs/operators';
import { Vector2d } from 'konva/types/types';
import { Subject } from 'rxjs';
import { useReadonlyRef } from '../../hooks/useReadonlyRef';
import { NewTabLinkify } from '../../foundations/NewTabLinkify';
import { CharacterState, UpOperation, PieceState, PieceUpOperation, BoardLocationUpOperation, BoardState, BoardLocationState, MyNumberValueState } from '@kizahasi/flocon-core';
import { $free, CompositeKey, compositeKeyEquals, compositeKeyToString, recordToArray, recordToDualKeyMap, recordToMap, stringToCompositeKey, __ } from '@kizahasi/util';

namespace Resource {
    export const cellSizeIsTooSmall = 'セルが小さすぎるため、無効化されています';
}

const createPiecePostOperation = ({
    e,
    piece,
    board,
}: {
    e: MyKonva.DragEndResult;
    piece: PieceState;
    board: BoardState;
}): PieceUpOperation => {
    const pieceOperation: PieceUpOperation = { $version: 1 };
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
}): PieceUpOperation => {
    const pieceOperation: BoardLocationUpOperation = { $version: 1 };
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

const background = 'background';
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

type MouseOverOn = {
    type: typeof background;
} | {
    type: typeof character | typeof tachie;
    character: CharacterState;
} | {
    type: typeof myNumberValue;
}

const publicMessageFilter = (message: Message): boolean => {
    return message.type === publicMessage;
};

const useGetStoppedCursor = () => {
    const [stoppedCursor, setStoppedCursor] = React.useState<Vector2d | null>(null);
    const subject = useConstant(() => new Subject<Vector2d>());
    const onMove = React.useCallback((newCursor: Vector2d) => {
        setStoppedCursor(null);
        subject.next(newCursor);
    }, [subject]);
    React.useEffect(() => {
        subject.pipe(debounceTime(500)).subscribe(cursor => {
            setStoppedCursor(cursor);
        });
    }, [subject]);
    return { stoppedCursor, onMove };
};

type OnTooltipParams = { offset: MyKonva.Vector2; mouseOverOn: MouseOverOn };

type BoardCoreProps = {
    board: BoardState;
    boardConfig: BoardConfig;
    boardKey: CompositeKey;
    boardEditorPanelId: string | null; // nullならばactiveBoardPanelとして扱われる
    onClick?: (e: KonvaEventObject<MouseEvent>) => void;
    onContextMenu?: (e: KonvaEventObject<PointerEvent>, stateOffset: MyKonva.Vector2) => void; // stateOffsetは、configなどのxy座標を基準にした位置。
    onTooltip?: (params: OnTooltipParams | null) => void;
    canvasWidth: number;
    canvasHeight: number;
}

const BoardCore: React.FC<BoardCoreProps> = ({
    board,
    boardConfig,
    boardKey,
    boardEditorPanelId,
    onClick,
    onContextMenu,
    onTooltip,
    canvasWidth,
    canvasHeight
}: BoardCoreProps) => {
    const roomId = useSelector(state => state.roomModule.roomId);
    const characters = useCharacters();
    const participants = useParticipants();

    const onTooltipRef = useReadonlyRef(onTooltip);

    const mouseOverOnRef = React.useRef<MouseOverOn>({ type: background });
    const { stoppedCursor, onMove } = useGetStoppedCursor();
    React.useEffect(() => {
        if (onTooltipRef.current == null) {
            return;
        }
        if (stoppedCursor == null) {
            onTooltipRef.current(null);
            return;
        }
        onTooltipRef.current({ offset: stoppedCursor, mouseOverOn: mouseOverOnRef.current });
    }, [stoppedCursor, onTooltipRef]);
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
            const piece = __(recordToDualKeyMap<PieceState>(character.pieces)).find(([boardKey$]) => {
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
                isSelected={selectedPieceKey?.type === 'character' && compositeKeyEquals(selectedPieceKey.characterKey, characterKey)}
                onClick={() => setSelectedPieceKey({ type: 'character', characterKey })}
                onMouseEnter={() => mouseOverOnRef.current = { type: 'character', character }}
                onMouseLeave={() => mouseOverOnRef.current = { type: 'background' }}
                onDragEnd={e => {
                    const pieceOperation = createPiecePostOperation({ e, piece: pieceValue, board });
                    const operation: UpOperation = {
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
            const tachieLocation = __(recordToDualKeyMap<BoardLocationState>(character.tachieLocations)).find(([boardKey$]) => {
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
                isSelected={selectedPieceKey?.type === 'tachie' && compositeKeyEquals(selectedPieceKey.characterKey, characterKey)}
                onClick={() => setSelectedPieceKey({ type: 'tachie', characterKey })}
                onMouseEnter={() => mouseOverOnRef.current = { type: 'tachie', character }}
                onMouseLeave={() => mouseOverOnRef.current = { type: 'background' }}
                onDragEnd={e => {
                    const tachieLocationOperation = createTachieLocationPostOperation({ e });
                    const operation: UpOperation = {
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
                const piece = __(recordToDualKeyMap<PieceState>(myNumberValue.pieces)).find(([boardKey$, piece]) => {
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
                    onMouseEnter={() => mouseOverOnRef.current = { type: 'myNumberValue' }}
                    onMouseLeave={() => mouseOverOnRef.current = { type: 'background' }}
                    onDragEnd={e => {
                        const pieceOperation = createPiecePostOperation({ e, piece: pieceValue, board });
                        const operation: UpOperation = {
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
            onMouseMove={e => {
                // CONSIDER: scale === 0 のケースに対応していない。configのほうで boardConfig.zoom === -Inf にならないようにするほうが自然か。
                onMove({
                    x: e.evt.offsetX,
                    y: e.evt.offsetY,
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
                    boardEditorPanelId: boardEditorPanelId,
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
                        boardEditorPanelId: boardEditorPanelId,
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
    characterPiecesOnCursor: ReadonlyArray<{ characterKey: CompositeKey; character: CharacterState; piece: PieceState }>;
    tachiesOnCursor: ReadonlyArray<{ characterKey: CompositeKey; character: CharacterState; tachieLocation: BoardLocationState }>;
    myNumberValuesOnCursor: ReadonlyArray<{ myNumberValueKey: string; myNumberValue: MyNumberValueState; piece: PieceState; userUid: string }>;
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
    canvasWidth: number;
    canvasHeight: number;
} & ({
    type: 'activeBoard';
    activeBoardPanel: ActiveBoardPanelConfig;
} | {
    type: 'boardEditor';
    boardEditorPanel: BoardEditorPanelConfig;
    boardEditorPanelId: string;
})

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

const Board: React.FC<Props> = ({
    canvasWidth,
    canvasHeight,
    ...panel
}: Props) => {
    const dispatchRoomComponentsState = React.useContext(DispatchRoomComponentsStateContext);
    const dispatch = useDispatch();
    const [contextMenuState, setContextMenuState] = React.useState<ContextMenuState | null>(null);
    const [tooltipState, setTooltipState] = React.useState<OnTooltipParams | null>(null);
    const operate = useOperate();
    const roomId = useSelector(state => state.roomModule.roomId);
    const boards = useBoards();
    const characters = useCharacters();
    const participants = useParticipants();
    const { participant: me, userUid: myUserUid } = useMe();
    const activeBoardKey = useSelector(state => state.roomModule.roomState?.state?.activeBoardKey);
    const activeBoardPanelConfig = useSelector(state => state.roomConfigModule?.panels.activeBoardPanel);
    const [activeBoardSelectorModalVisibility, setActiveBoardSelectorModalVisibility] = React.useState(false);

    if (me == null || myUserUid == null || roomId == null || boards == null || characters == null) {
        return null;
    }

    const boardKeyToShow = (() => {
        if (panel.type === 'activeBoard') {
            return activeBoardKey;
        }
        if (panel.boardEditorPanel.activeBoardKey == null) {
            return null;
        }
        return stringToCompositeKey(panel.boardEditorPanel.activeBoardKey);
    })();

    const boardConfig = (() => {
        if (boardKeyToShow == null) {
            return null;
        }
        if (panel.type === 'activeBoard') {
            if (activeBoardPanelConfig == null) {
                return null;
            }
            return activeBoardPanelConfig.boards[compositeKeyToString(boardKeyToShow)];
        }
        return panel.boardEditorPanel.boards[compositeKeyToString(boardKeyToShow)];
    })() ?? defaultBoardConfig();

    const boardEditorPanelId = panel.type === 'boardEditor' ? panel.boardEditorPanelId : null;

    const board = boardKeyToShow == null ? null : boards.get(boardKeyToShow);

    const boardComponent = (() => {
        if (boardKeyToShow == null) {
            return (<div>ボードビュアーに表示するボードが指定されていません。</div>);
        }
        if (board == null) {
            return (<div>{`キーが ${compositeKeyToString(boardKeyToShow)} であるボードが見つかりませんでした。`}</div>);
        }

        return (<BoardCore
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            board={board}
            boardKey={boardKeyToShow}
            boardConfig={boardConfig}
            boardEditorPanelId={boardEditorPanelId}
            onClick={() => setContextMenuState(null)}
            onTooltip={newValue => setTooltipState(newValue)}
            onContextMenu={(e, stateOffset) => {
                e.evt.preventDefault();
                setContextMenuState({
                    x: e.evt.offsetX,
                    y: e.evt.offsetY,
                    characterPiecesOnCursor: __(characters.toArray())
                        .compact(([characterKey, character]) => {
                            const found = recordToDualKeyMap<PieceState>(character.pieces).toArray()
                                .find(([boardKey, piece]) => {
                                    if (boardKey.first !== boardKeyToShow.createdBy || boardKey.second !== boardKeyToShow.id) {
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
                            const found = recordToDualKeyMap<BoardLocationState>(character.tachieLocations).toArray()
                                .find(([boardKey, tachie]) => {
                                    if (boardKey.first !== boardKeyToShow.createdBy || boardKey.second !== boardKeyToShow.id) {
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
                            const found = recordToDualKeyMap<PieceState>(myNumberValue.pieces).toArray()
                                .find(([boardKey, piece]) => {
                                    if (boardKey.first !== boardKeyToShow.createdBy || boardKey.second !== boardKeyToShow.id) {
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

    const dropDownItems = boardEditorPanelId == null ? null : boards.toArray().map(([key, board]) => (
        <Menu.Item
            key={compositeKeyToString(key)}
            onClick={() => dispatch(roomConfigModule.actions.updateBoardEditorPanel({
                boardEditorPanelId,
                roomId,
                panel: {
                    activeBoardKey: compositeKeyToString(key),
                }
            }))}>
            {board.name === '' ? '(名前なし)' : board.name}
        </Menu.Item>));

    // activeBoardPanelモードのときは boardsMenu==null
    const boardsMenu = dropDownItems == null ? null : (
        <Menu>
            <Menu.ItemGroup title="ボード一覧">
                {dropDownItems}
            </Menu.ItemGroup>
            <Menu.Divider />
            <Menu.Item
                icon={<Icons.PlusOutlined />}
                onClick={() => dispatchRoomComponentsState({ type: boardDrawerType, newValue: { type: create } })}>
                新規作成
            </Menu.Item>
        </Menu>
    );

    const contextMenu = (() => {
        if (contextMenuState == null) {
            return null;
        }
        if (boardKeyToShow == null) {
            return null;
        }
        const board = boards.get(boardKeyToShow);

        const selectedCharacterPiecesMenu = (() => {
            if (contextMenuState.characterPiecesOnCursor.length === 0) {
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
                                                boardKey: boardKeyToShow,
                                                stateKey: characterKey,
                                            }
                                        });
                                        setContextMenuState(null);
                                    }}>
                                    編集
                                </Menu.Item>
                                <Menu.Item
                                    onClick={() => {
                                        const operation: UpOperation = {
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
                                                                        [boardKeyToShow.createdBy]: {
                                                                            [boardKeyToShow.id]: {
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
            if (contextMenuState.tachiesOnCursor.length === 0) {
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
                                                boardKey: boardKeyToShow,
                                                stateKey: characterKey,
                                            }
                                        });
                                        setContextMenuState(null);
                                    }}>
                                    編集
                                </Menu.Item>
                                <Menu.Item
                                    onClick={() => {
                                        const operation: UpOperation = {
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
                                                                        [boardKeyToShow.createdBy]: {
                                                                            [boardKeyToShow.id]: {
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

        const selectedCharacterCommandsMenu = (() => {
            if (board == null || contextMenuState.characterPiecesOnCursor.length + contextMenuState.tachiesOnCursor.length === 0) {
                return null;
            }

            const characters: { key: CompositeKey; value: CharacterState }[] = [];
            [...contextMenuState.characterPiecesOnCursor, ...contextMenuState.tachiesOnCursor].forEach(elem => {
                if (characters.some(exists => exists.key.createdBy === elem.characterKey.createdBy && exists.key.id === elem.characterKey.id)) {
                    return;
                }
                characters.push({ key: elem.characterKey, value: elem.character });
            });
            const itemGroups = __(characters).compact(pair => {
                if (pair.value.privateCommand.trim() === '') {
                    return null;
                }
                const key = compositeKeyToString(pair.key);
                const commands = listCharacterFlocommand(pair.value.privateCommand);
                if (commands.isError) {
                    return (<Menu.ItemGroup key={key}>
                        <Menu.Item disabled><Tooltip title={commands.error}>(コマンド文法エラー)</Tooltip></Menu.Item>
                    </Menu.ItemGroup>);
                }
                const menuItems = [...commands.value].map(([commandKey,]) => {
                    return (<Menu.Item
                        key={commandKey}
                        onClick={() => {
                            const operation = executeCharacterFlocommand({ action: commands.value, characterKey: pair.key, character: pair.value, commandKey });
                            if (operation == null) {
                                return;
                            }
                            operate(operation);
                            setContextMenuState(null);
                        }}>
                        {commandKey}
                    </Menu.Item>);
                });
                return (<Menu.ItemGroup key={key} title={pair.value.name}>
                    {menuItems}
                </Menu.ItemGroup>);
            }).toArray();
            if (itemGroups.length === 0) {
                return null;
            }
            return (<>
                <Menu.SubMenu title='キャラクターコマンド'>
                    {itemGroups}
                </Menu.SubMenu>
                <Menu.Divider />
            </>);
        })();

        const allCharactersListMenu = (() => {
            const title = 'キャラクター一覧';
            if (board == null) {
                return <Menu.SubMenu title={title} disabled />;
            }
            return (
                <Menu.SubMenu title={title}>
                    {__(characters.toArray()).compact(([key, value]) => {
                        const pieceExists = recordToDualKeyMap(value.pieces).toArray().some(([boardKey]) => boardKeyToShow.id === boardKey.second && boardKeyToShow.createdBy === boardKey.first);
                        const tachieExists = recordToDualKeyMap(value.tachieLocations).toArray().some(([boardKey]) => boardKeyToShow.id === boardKey.second && boardKeyToShow.createdBy === boardKey.first);

                        const { x, y } = ContextMenuState.toKonvaPosition({ contextMenuState, boardConfig });
                        const cellPosition = Piece.getCellPosition({ x, y, board });
                        // TODO: x,y,w,h の値が適当
                        const pieceLocationWhichIsCellMode: PieceState = {
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

                        const pieceLocationWhichIsNotCellMode: PieceState = {
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

                        const tachieLocationWhichIsNotCellMode: BoardLocationState = {
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
                                                    boardKey: boardKeyToShow,
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
                                                const operation: UpOperation = {
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
                                                                                [boardKeyToShow.createdBy]: {
                                                                                    [boardKeyToShow.id]: {
                                                                                        type: replace,
                                                                                        replace: { newValue: pieceLocationWhichIsCellMode },
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
                                            const operation: UpOperation = {
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
                                                                            [boardKeyToShow.createdBy]: {
                                                                                [boardKeyToShow.id]: {
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
                                            const operation: UpOperation = {
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
                                                                            [boardKeyToShow.createdBy]: {
                                                                                [boardKeyToShow.id]: {
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
                                                    boardKey: boardKeyToShow,
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
                                            const operation: UpOperation = {
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
                                                                            [boardKeyToShow.createdBy]: {
                                                                                [boardKeyToShow.id]: {
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
                                            const operation: UpOperation = {
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
                                                                            [boardKeyToShow.createdBy]: {
                                                                                [boardKeyToShow.id]: {
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
            if (contextMenuState.myNumberValuesOnCursor.length === 0) {
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
                                                boardKey: boardKeyToShow,
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
                                        const operation: UpOperation = {
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
            if (board == null) {
                return <Menu.SubMenu title={title} disabled />;
            }

            const nonCellPosition = ContextMenuState.toKonvaPosition({ contextMenuState, boardConfig });
            const cellPosition = Piece.getCellPosition({ x: nonCellPosition.x, y: nonCellPosition.y, board });


            // TODO: x,y,w,h の値が適当
            const pieceLocationWhichIsCellMode: PieceState = {
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

            const pieceLocationWhichIsNotCellMode: PieceState = {
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
                            const pieceExists = recordToDualKeyMap(value.pieces).toArray().some(([boardKey]) => boardKeyToShow.id === boardKey.second && boardKeyToShow.createdBy === boardKey.first);
                            return (
                                <Menu.SubMenu key={key} title={<span>{pieceExists ? <Icon.CheckOutlined /> : null} {MyNumberValue.stringify(value)}</span>}>
                                    <Menu.Item
                                        onClick={() => {
                                            dispatchRoomComponentsState({
                                                type: myNumberValueDrawerType,
                                                newValue: {
                                                    type: update,
                                                    boardKey: boardKeyToShow,
                                                    stateKey: key,
                                                }
                                            });
                                            setContextMenuState(null);
                                        }}>
                                        編集
                                    </Menu.Item>
                                    <Menu.Item
                                        onClick={() => {
                                            const operation: UpOperation = {
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
                                            boardKey: boardKeyToShow,
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
                                            boardKey: boardKeyToShow,
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
                    {selectedCharacterCommandsMenu}
                    {allCharactersListMenu}
                    {allMyNumbersMenu}
                </Menu>
            </div>);
    }
    )();

    const tooltip = (() => {
        if (tooltipState == null) {
            return null;
        }

        switch (tooltipState.mouseOverOn.type) {
            case 'character':
            case 'tachie':
                return (
                    <div style={({ position: 'absolute', left: tooltipState.offset.x - 30, top: tooltipState.offset.y + 1, padding: 8, backgroundColor: '#202020E8', maxWidth: 200 })}>
                        <div>{tooltipState.mouseOverOn.character.name}</div>
                        {tooltipState.mouseOverOn.character.memo.trim() !== '' && <hr style={{ transform: 'scaleY(0.5)', borderWidth: '1px 0 0 0', borderStyle: 'solid', borderColor: '#FFFFFFD0' }} />}
                        <NewTabLinkify>
                            <span style={{ whiteSpace: 'pre-wrap' /* これがないと、stringに存在する改行が無視されてしまう */ }}>
                                {tooltipState.mouseOverOn.character.memo}
                            </span>
                        </NewTabLinkify>
                    </div>);
            default:
                return null;
        }
    })();

    const noActiveBoardText = '';

    return (
        <div style={({ position: 'relative' })}>
            {boardComponent}
            <span style={boardsDropDownStyle}>
                {boardsMenu != null
                    ? <Dropdown overlay={boardsMenu} trigger={['click']}>
                        <Button>
                            {boardKeyToShow == null ? noActiveBoardText : (boards.get(boardKeyToShow)?.name ?? noActiveBoardText)} <Icons.DownOutlined />
                        </Button>
                    </Dropdown>
                    : <Dropdown
                        trigger={['click']}
                        overlay={<Menu>
                            <Menu.Item
                                onClick={() => {
                                    setActiveBoardSelectorModalVisibility(true);
                                }}>
                                表示ボードの変更
                            </Menu.Item>
                        </Menu>}>
                        <Button>{board?.name}<Icons.DownOutlined /></Button>
                    </Dropdown>}
                <Button
                    disabled={boardKeyToShow == null}
                    onClick={() => {
                        if (boardKeyToShow == null) {
                            return;
                        }
                        dispatchRoomComponentsState({ type: boardDrawerType, newValue: { type: update, stateKey: boardKeyToShow } });
                    }}>
                    編集
                </Button>
            </span>
            <div style={zoomButtonStyle}>
                <div style={({ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' })}>
                    <Button onClick={() => {
                        if (boardKeyToShow == null) {
                            return;
                        }
                        dispatch(roomConfigModule.actions.zoomBoard({
                            roomId,
                            boardKey: boardKeyToShow,
                            boardEditorPanelId,
                            zoomDelta: 0.25,
                            prevCanvasWidth: canvasWidth,
                            prevCanvasHeight: canvasHeight,
                        }));
                    }}>
                        <Icon.ZoomInOutlined />
                    </Button>
                    <Button onClick={() => {
                        if (boardKeyToShow == null) {
                            return;
                        }
                        dispatch(roomConfigModule.actions.zoomBoard({
                            roomId,
                            boardKey: boardKeyToShow,
                            boardEditorPanelId,
                            zoomDelta: -0.25,
                            prevCanvasWidth: canvasWidth,
                            prevCanvasHeight: canvasHeight,
                        }));
                    }}>
                        <Icon.ZoomOutOutlined />
                    </Button>
                    <div style={({ height: 6 })} />
                    <Button onClick={() => {
                        if (boardKeyToShow == null) {
                            return;
                        }
                        dispatch(roomConfigModule.actions.resetBoard({
                            roomId,
                            boardKey: boardKeyToShow,
                            boardEditorPanelId,
                        }));
                    }}>
                        Boardの位置とズームをリセット
                    </Button>
                </div>
            </div>
            {tooltip}
            {contextMenu}
            <ActiveBoardSelectorModal
                visible={activeBoardSelectorModalVisibility}
                onComplete={() => setActiveBoardSelectorModalVisibility(false)} />
        </div >
    );
};

export default Board;