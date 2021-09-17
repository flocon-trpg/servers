import React from 'react';
import { success, useImageFromGraphQL } from '../../hooks/image';
import * as ReactKonva from 'react-konva';
import { Button, Dropdown, Menu } from 'antd';
import * as Icons from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import roomConfigModule from '../../modules/roomConfigModule';
import { BoardEditorPanelConfig } from '../../states/BoardEditorPanelConfig';
import { KonvaEventObject } from 'konva/types/Node';
import { update } from '../../stateManagers/states/types';
import * as Icon from '@ant-design/icons';
import { Message, publicMessage, useFilteredRoomMessages } from '../../hooks/useRoomMessages';
import { useSelector } from '../../store';
import { useOperate } from '../../hooks/useOperate';
import { useMe } from '../../hooks/useMe';
import { useCharacters } from '../../hooks/state/useCharacters';
import { useParticipants } from '../../hooks/state/useParticipants';
import { Piece } from '../../utils/piece';
import { useBoards } from '../../hooks/state/useBoards';
import { BoardLocation } from '../../utils/boardLocation';
import { BoardConfig, defaultBoardConfig } from '../../states/BoardConfig';
import { ActiveBoardPanelConfig } from '../../states/ActiveBoardPanelConfig';
import { ActiveBoardSelectorModal } from './ActiveBoardSelecterModal';
import useConstant from 'use-constant';
import { debounceTime } from 'rxjs/operators';
import { Vector2d } from 'konva/types/types';
import { Subject } from 'rxjs';
import { useReadonlyRef } from '../../hooks/useReadonlyRef';
import {
    UpOperation,
    PieceState,
    PieceUpOperation,
    BoardLocationUpOperation,
    BoardState,
    BoardLocationState,
} from '@kizahasi/flocon-core';
import {
    $free,
    CompositeKey,
    compositeKeyEquals,
    dualKeyRecordToDualKeyMap,
    keyNames,
} from '@kizahasi/util';
import {
    BoardTooltipState,
    create,
    MouseOverOn,
    BoardPopoverEditorState,
    roomDrawerAndPopoverAndModalModule,
} from '../../modules/roomDrawerAndPopoverAndModalModule';
import { useMyUserUid } from '../../hooks/useMyUserUid';
import { FilePath, FileSourceType } from '../../generated/graphql';
import { ImagePiece } from '../../components/Konva/ImagePiece';
import { DragEndResult, Vector2 } from '../../utils/types';
import {
    DiceOrNumberPiece,
    dicePiece,
    numberPiece,
} from '../../components/Konva/DiceOrNumberPiece';
import { useTransition, animated } from '@react-spring/konva';
import { useCharacterPieces } from '../../hooks/state/useCharacterPieces';
import { useTachieLocations } from '../../hooks/state/useTachieLocations';
import { characterUpdateOperation } from '../../utils/characterUpdateOperation';
import { useDicePieces } from '../../hooks/state/useDicePieces';
import { useNumberPieces } from '../../hooks/state/useNumberPieces';
import { useImagePieces } from '../../hooks/state/useImagePieces';
import { useAllContext } from '../../hooks/useAllContext';
import { AllContextProvider } from '../../components/AllContextProvider';

const createPiecePostOperation = ({
    e,
    piece,
    board,
}: {
    e: DragEndResult;
    piece: PieceState;
    board: BoardState;
}): PieceUpOperation => {
    const pieceOperation: PieceUpOperation = { $v: 1 };
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

const createTachieLocationPostOperation = ({ e }: { e: DragEndResult }): PieceUpOperation => {
    const pieceOperation: BoardLocationUpOperation = { $v: 1 };
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
const dicePieceValue = 'dicePieceValue';
const numberPieceValue = 'numberPieceValue';
const imagePiece = 'imagePiece';

type SelectedPieceKey =
    | {
          type: typeof character;
          characterKey: CompositeKey;
          pieceKey: CompositeKey;
      }
    | {
          type: typeof tachie;
          characterKey: CompositeKey;
          tachieLocationKey: CompositeKey;
      }
    | {
          type: typeof dicePieceValue | typeof numberPieceValue;
          stateId: string;
          pieceKey: CompositeKey;
      }
    | {
          type: typeof imagePiece;
          pieceKey: CompositeKey;
      };

const publicMessageFilter = (message: Message): boolean => {
    return message.type === publicMessage;
};

/**
 * カーソルが一定時間止まったかどうかを示し、一定時間止まったときはその位置を返すHook。
 * カーソルが動くたびにonMoveを呼び出さなければならない。
 */
const useGetStoppedCursor = () => {
    const [stoppedCursor, setStoppedCursor] = React.useState<Vector2d | null>(null);
    const subject = useConstant(() => new Subject<Vector2d>());
    const onMove = React.useCallback(
        (newCursor: Vector2d) => {
            setStoppedCursor(null);
            subject.next(newCursor);
        },
        [subject]
    );
    React.useEffect(() => {
        subject.pipe(debounceTime(500)).subscribe(cursor => {
            setStoppedCursor(cursor);
        });
    }, [subject]);
    return { stoppedCursor, onMove };
};

type BoardCoreProps = {
    board: BoardState;
    boardConfig: BoardConfig;
    boardKey: CompositeKey;
    boardEditorPanelId: string | null; // nullならばactiveBoardPanelとして扱われる
    onClick?: (e: KonvaEventObject<MouseEvent>) => void;
    onContextMenu?: (e: KonvaEventObject<PointerEvent>, stateOffset: Vector2) => void; // stateOffsetは、configなどのxy座標を基準にした位置。
    onTooltip?: (params: BoardTooltipState | null) => void;
    onPopupEditor?: (params: BoardPopoverEditorState | null) => void;
    canvasWidth: number;
    canvasHeight: number;
};

const BoardCore: React.FC<BoardCoreProps> = ({
    board,
    boardConfig,
    boardKey,
    boardEditorPanelId,
    onClick,
    onContextMenu,
    onTooltip,
    onPopupEditor,
    canvasWidth,
    canvasHeight,
}: BoardCoreProps) => {
    const allContext = useAllContext();

    const roomId = useSelector(state => state.roomModule.roomId);
    const characters = useCharacters();
    const participants = useParticipants();
    const dicePieces = useDicePieces(boardKey);
    const numberPieces = useNumberPieces(boardKey);
    const imagePieces = useImagePieces(boardKey);
    const characterPieces = useCharacterPieces(boardKey);
    const tacheLocations = useTachieLocations(boardKey);

    const onTooltipRef = useReadonlyRef(onTooltip);
    const onPopoverEditorRef = useReadonlyRef(onPopupEditor);
    const unsetPopoverEditor = () => {
        if (onPopoverEditorRef.current == null) {
            return;
        }
        onPopoverEditorRef.current(null);
    };

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
        onTooltipRef.current({ pagePosition: stoppedCursor, mouseOverOn: mouseOverOnRef.current });
    }, [stoppedCursor, onTooltipRef]);
    const [selectedPieceKey, setSelectedPieceKey] = React.useState<SelectedPieceKey>();
    const [isBackgroundDragging, setIsBackgroundDragging] = React.useState(false); // これがないと、pieceをドラッグでリサイズする際に背景が少し動いてしまう。
    const backgroundImage = useImageFromGraphQL(board.backgroundImage);
    const backgroundImageResult =
        backgroundImage.type === success ? backgroundImage.image : undefined;
    const dispatch = useDispatch();
    const operate = useOperate();
    const publicMessages = useFilteredRoomMessages({ filter: publicMessageFilter });
    const myUserUid = useMyUserUid();

    /*
        TransitionにHTMLImageElementを含めないと、フェードアウトが発生しない模様（おそらくフェードアウト時には画像が捨てられているため）。そのため含めている。
     */
    const backgroundImageTransition = useTransition<
        typeof backgroundImageResult,
        { opacity: number; image: typeof backgroundImageResult }
    >(backgroundImageResult, {
        from: image => ({ opacity: 0, image }),
        enter: image => ({ opacity: 1, image }),
        leave: image => ({ opacity: 0, image }),
    });

    if (myUserUid == null || roomId == null || characters == null || participants == null) {
        return null;
    }

    const lastPublicMessage = (() => {
        if (publicMessages.length === 0) {
            return undefined;
        }
        const lastMessage = publicMessages[publicMessages.length - 1];
        if (lastMessage == null) {
            return;
        }
        if (lastMessage.type !== publicMessage) {
            return undefined;
        }
        return lastMessage.value;
    })();

    const grid = (() => {
        if (
            board.cellRowCount <= 0 ||
            board.cellColumnCount <= 0 ||
            board.cellHeight <= 0 ||
            board.cellWidth <= 0
        ) {
            return null;
        }
        const cellWidth = board.cellWidth;
        const cellHeight = board.cellHeight;
        // TODO: Lineの色を変える
        const verticalLines = [...new Array(board.cellRowCount + 1)].map((_, i) => {
            const height = board.cellColumnCount * cellHeight;
            return (
                <ReactKonva.Line
                    key={i}
                    points={[
                        i * cellWidth + board.cellOffsetX,
                        board.cellOffsetY,
                        i * cellHeight + board.cellOffsetX,
                        height + board.cellOffsetY,
                    ]}
                    stroke={'red'}
                    tension={1}
                />
            );
        });
        const horizontalLines = [...new Array(board.cellColumnCount + 1)].map((_, i) => {
            const width = board.cellRowCount * cellWidth;
            return (
                <ReactKonva.Line
                    key={i}
                    points={[
                        board.cellOffsetX,
                        i * cellWidth + board.cellOffsetY,
                        width + board.cellOffsetX,
                        i * cellHeight + board.cellOffsetY,
                    ]}
                    stroke={'red'}
                    tension={1}
                />
            );
        });
        return (
            <>
                {verticalLines}
                {horizontalLines}
            </>
        );
    })();

    let pieces: JSX.Element;
    {
        const characterPieceElements = (characterPieces ?? []).map(
            ({ characterKey, character, piece, pieceKey }) => {
                if (character.image == null) {
                    // TODO: 画像なしでコマを表示する
                    return null;
                }
                return (
                    <ImagePiece
                        {...Piece.getPosition({ ...board, state: piece })}
                        opacity={1}
                        key={keyNames(characterKey, pieceKey)}
                        filePath={character.image}
                        draggable
                        listening
                        isSelected={
                            selectedPieceKey?.type === 'character' &&
                            compositeKeyEquals(selectedPieceKey.characterKey, characterKey) &&
                            compositeKeyEquals(selectedPieceKey.pieceKey, pieceKey)
                        }
                        onClick={() => {
                            unsetPopoverEditor();
                            setSelectedPieceKey({ type: 'character', characterKey, pieceKey });
                        }}
                        onDblClick={e => {
                            if (onPopoverEditorRef.current == null) {
                                return;
                            }
                            onPopoverEditorRef.current({
                                pagePosition: { x: e.evt.pageX, y: e.evt.pageY },
                                dblClickOn: { type: 'character', character, characterKey },
                            });
                        }}
                        onMouseEnter={() =>
                            (mouseOverOnRef.current = {
                                type: 'character',
                                character,
                                characterKey,
                            })
                        }
                        onMouseLeave={() => (mouseOverOnRef.current = { type: 'background' })}
                        onDragEnd={e => {
                            const pieceOperation = createPiecePostOperation({
                                e,
                                piece,
                                board,
                            });
                            operate(
                                characterUpdateOperation(characterKey, {
                                    $v: 1,
                                    pieces: {
                                        [pieceKey.createdBy]: {
                                            [pieceKey.id]: {
                                                type: update,
                                                update: pieceOperation,
                                            },
                                        },
                                    },
                                })
                            );
                        }}
                    />
                );
            }
        );

        const tachieLocationElements = (tacheLocations ?? []).map(
            ({ characterKey, character, tachieLocationKey, tachieLocation }) => {
                if (character.tachieImage == null) {
                    // TODO: 画像なしでコマを表示する
                    return null;
                }
                return (
                    <ImagePiece
                        key={keyNames(characterKey, tachieLocationKey)}
                        opacity={0.75 /* TODO: opacityの値が適当 */}
                        message={lastPublicMessage}
                        messageFilter={msg => {
                            return (
                                msg.createdBy === characterKey.createdBy &&
                                msg.character?.stateId === characterKey.id &&
                                msg.channelKey !== $free
                            );
                        }}
                        x={tachieLocation.x}
                        y={tachieLocation.y}
                        w={tachieLocation.w}
                        h={tachieLocation.h}
                        filePath={character.tachieImage}
                        draggable
                        listening
                        isSelected={
                            selectedPieceKey?.type === 'tachie' &&
                            compositeKeyEquals(selectedPieceKey.characterKey, characterKey) &&
                            compositeKeyEquals(
                                selectedPieceKey.tachieLocationKey,
                                tachieLocationKey
                            )
                        }
                        onClick={() => {
                            unsetPopoverEditor();
                            setSelectedPieceKey({
                                type: 'tachie',
                                characterKey,
                                tachieLocationKey,
                            });
                        }}
                        onDblClick={e => {
                            if (onPopoverEditorRef.current == null) {
                                return;
                            }
                            onPopoverEditorRef.current({
                                pagePosition: { x: e.evt.pageX, y: e.evt.pageY },
                                dblClickOn: { type: 'tachie', character, characterKey },
                            });
                        }}
                        onMouseEnter={() =>
                            (mouseOverOnRef.current = { type: 'tachie', character, characterKey })
                        }
                        onMouseLeave={() => (mouseOverOnRef.current = { type: 'background' })}
                        onDragEnd={e => {
                            const tachieLocationOperation = createTachieLocationPostOperation({
                                e,
                            });
                            operate(
                                characterUpdateOperation(characterKey, {
                                    $v: 1,
                                    tachieLocations: {
                                        [tachieLocationKey.createdBy]: {
                                            [tachieLocationKey.id]: {
                                                type: update,
                                                update: tachieLocationOperation,
                                            },
                                        },
                                    },
                                })
                            );
                        }}
                    />
                );
            }
        );

        const imagePieceElements = (imagePieces ?? []).map(
            ({ value: element, pieceKey, piece }) => {
                const defaultImageFilePath: FilePath = {
                    // TODO: 適切な画像に変える
                    path: '/logo.png',
                    sourceType: FileSourceType.Default,
                };
                return (
                    <ImagePiece
                        {...Piece.getPosition({ ...board, state: piece })}
                        opacity={1}
                        key={keyNames(pieceKey)}
                        filePath={element.value.image ?? defaultImageFilePath}
                        draggable
                        listening
                        isSelected={
                            selectedPieceKey?.type === 'imagePiece' &&
                            compositeKeyEquals(selectedPieceKey.pieceKey, pieceKey)
                        }
                        onClick={() => {
                            unsetPopoverEditor();
                            setSelectedPieceKey({ type: 'imagePiece', pieceKey });
                        }}
                        onDblClick={e => {
                            if (onPopoverEditorRef.current == null) {
                                return;
                            }
                            onPopoverEditorRef.current({
                                pagePosition: { x: e.evt.pageX, y: e.evt.pageY },
                                dblClickOn: { type: 'imagePieceValue', element },
                            });
                        }}
                        onMouseEnter={() =>
                            (mouseOverOnRef.current = {
                                type: 'imagePieceValue',
                                element,
                            })
                        }
                        onMouseLeave={() => (mouseOverOnRef.current = { type: 'background' })}
                        onDragEnd={e => {
                            const pieceOperation = createPiecePostOperation({
                                e,
                                piece,
                                board,
                            });
                            const operation: UpOperation = {
                                $v: 1,
                                participants: {
                                    [element.participantKey]: {
                                        type: update,
                                        update: {
                                            $v: 1,
                                            imagePieceValues: {
                                                [element.valueId]: {
                                                    type: update,
                                                    update: {
                                                        $v: 1,
                                                        pieces: {
                                                            [pieceKey.createdBy]: {
                                                                [pieceKey.id]: {
                                                                    type: update,
                                                                    update: pieceOperation,
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            };
                            operate(operation);
                        }}
                    />
                );
            }
        );

        const dicePieceElements = (dicePieces ?? []).map(({ value: element, pieceKey, piece }) => {
            return (
                <DiceOrNumberPiece
                    {...Piece.getPosition({ ...board, state: piece })}
                    key={keyNames(element.characterKey, element.valueId, pieceKey)}
                    opacity={1}
                    state={{ type: dicePiece, state: element.value }}
                    createdByMe={element.characterKey.createdBy === myUserUid}
                    draggable
                    listening
                    isSelected={
                        selectedPieceKey?.type === 'dicePieceValue' &&
                        selectedPieceKey.stateId === element.valueId &&
                        compositeKeyEquals(selectedPieceKey.pieceKey, pieceKey)
                    }
                    onClick={() => {
                        unsetPopoverEditor();
                        setSelectedPieceKey({
                            type: 'dicePieceValue',
                            stateId: element.valueId,
                            pieceKey,
                        });
                    }}
                    onDblClick={e => {
                        if (onPopoverEditorRef.current == null) {
                            return;
                        }
                        onPopoverEditorRef.current({
                            pagePosition: { x: e.evt.pageX, y: e.evt.pageY },
                            dblClickOn: { type: 'dicePieceValue', element },
                        });
                    }}
                    onMouseEnter={() =>
                        (mouseOverOnRef.current = { type: 'dicePieceValue', element })
                    }
                    onMouseLeave={() => (mouseOverOnRef.current = { type: 'background' })}
                    onDragEnd={e => {
                        const pieceOperation = createPiecePostOperation({
                            e,
                            piece,
                            board,
                        });
                        operate(
                            characterUpdateOperation(element.characterKey, {
                                $v: 1,
                                dicePieceValues: {
                                    [element.valueId]: {
                                        type: update,
                                        update: {
                                            $v: 1,
                                            pieces: {
                                                [pieceKey.createdBy]: {
                                                    [pieceKey.id]: {
                                                        type: update,
                                                        update: pieceOperation,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            })
                        );
                    }}
                />
            );
        });

        const numberPieceElements = (numberPieces ?? []).map(
            ({ value: element, piece, pieceKey }) => {
                return (
                    <DiceOrNumberPiece
                        {...Piece.getPosition({ ...board, state: piece })}
                        key={keyNames(element.characterKey, element.valueId, pieceKey)}
                        opacity={1}
                        state={{ type: numberPiece, state: element.value }}
                        createdByMe={element.characterKey.createdBy === myUserUid}
                        draggable
                        listening
                        isSelected={
                            selectedPieceKey?.type === 'numberPieceValue' &&
                            selectedPieceKey.stateId === element.valueId &&
                            compositeKeyEquals(selectedPieceKey.pieceKey, pieceKey)
                        }
                        onClick={() => {
                            unsetPopoverEditor();
                            setSelectedPieceKey({
                                type: 'numberPieceValue',
                                stateId: element.valueId,
                                pieceKey,
                            });
                        }}
                        onDblClick={e => {
                            if (onPopoverEditorRef.current == null) {
                                return;
                            }
                            onPopoverEditorRef.current({
                                pagePosition: { x: e.evt.pageX, y: e.evt.pageY },
                                dblClickOn: { type: 'numberPieceValue', element },
                            });
                        }}
                        onMouseEnter={() =>
                            (mouseOverOnRef.current = { type: 'numberPieceValue', element })
                        }
                        onMouseLeave={() => (mouseOverOnRef.current = { type: 'background' })}
                        onDragEnd={e => {
                            const pieceOperation = createPiecePostOperation({
                                e,
                                piece,
                                board,
                            });
                            operate(
                                characterUpdateOperation(element.characterKey, {
                                    $v: 1,
                                    numberPieceValues: {
                                        [element.valueId]: {
                                            type: update,
                                            update: {
                                                $v: 1,
                                                pieces: {
                                                    [pieceKey.createdBy]: {
                                                        [pieceKey.id]: {
                                                            type: update,
                                                            update: pieceOperation,
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                })
                            );
                        }}
                    />
                );
            }
        );

        pieces = (
            <AllContextProvider {...allContext}>
                <ReactKonva.Layer>
                    {tachieLocationElements}
                    {characterPieceElements}
                    {imagePieceElements}
                    {dicePieceElements}
                    {numberPieceElements}
                </ReactKonva.Layer>
            </AllContextProvider>
        );
    }

    const backgroundImageKonva = backgroundImageTransition(({ opacity, image }) => (
        <animated.Image
            opacity={opacity}
            image={image}
            scaleX={Math.max(board.backgroundImageZoom, 0)}
            scaleY={Math.max(board.backgroundImageZoom, 0)}
            onClick={(e: any) => e.evt.preventDefault()}
        />
    ));

    const scale = Math.pow(2, boardConfig.zoom);

    return (
        <ReactKonva.Stage
            width={canvasWidth}
            height={canvasHeight}
            onClick={e => {
                setSelectedPieceKey(undefined);
                unsetPopoverEditor();
                onClick == null ? undefined : onClick(e);
            }}
            onContextMenu={e => {
                if (onContextMenu == null) {
                    return;
                }
                // CONSIDER: scale === 0 のケースに対応していない。configのほうで boardConfig.zoom === -Inf にならないようにするほうが自然か。
                onContextMenu(e, {
                    x: e.evt.offsetX / scale + boardConfig.offsetX,
                    y: e.evt.offsetY / scale + boardConfig.offsetY,
                });
            }}
            onMouseMove={e => {
                // CONSIDER: scale === 0 のケースに対応していない。configのほうで boardConfig.zoom === -Inf にならないようにするほうが自然か。
                onMove({
                    x: e.evt.pageX,
                    y: e.evt.pageY,
                });
            }}
            offsetX={boardConfig.offsetX}
            offsetY={boardConfig.offsetY}
            scaleX={scale}
            scaleY={scale}
            onWheel={e => {
                e.evt.preventDefault();
                dispatch(
                    roomConfigModule.actions.zoomBoard({
                        roomId,
                        boardKey,
                        boardEditorPanelId: boardEditorPanelId,
                        zoomDelta: e.evt.deltaY > 0 ? -0.25 : 0.25,
                        prevCanvasWidth: canvasWidth,
                        prevCanvasHeight: canvasHeight,
                    })
                );
            }}
        >
            {/* background: ドラッグで全体を動かせる */}
            <AllContextProvider {...allContext}>
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
                        dispatch(
                            roomConfigModule.actions.updateBoard({
                                roomId,
                                boardKey,
                                boardEditorPanelId: boardEditorPanelId,
                                offsetXDelta: -e.evt.movementX / nonZeroScale,
                                offsetYDelta: -e.evt.movementY / nonZeroScale,
                            })
                        );
                    }}
                >
                    {/* このRectがないと画像がないところで位置をドラッグで変えることができない。ただもっといい方法があるかも */}
                    <ReactKonva.Rect x={-100000} y={-100000} width={200000} height={200000} />
                    {backgroundImageKonva}
                    {grid}
                </ReactKonva.Layer>
            </AllContextProvider>
            {/* pieces: ドラッグでpieceのみを動かせる */}
            {pieces}
        </ReactKonva.Stage>
    );
};

type Props = {
    canvasWidth: number;
    canvasHeight: number;
} & (
    | {
          type: 'activeBoard';
          activeBoardPanel: ActiveBoardPanelConfig;
      }
    | {
          type: 'boardEditor';
          boardEditorPanel: BoardEditorPanelConfig;
          boardEditorPanelId: string;
      }
);

const boardsDropDownStyle: React.CSSProperties = {
    position: 'absolute',
    top: 20,
    right: 20,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
};

const zoomButtonStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 70,
    right: 20,
};

export const Board: React.FC<Props> = ({ canvasWidth, canvasHeight, ...panel }: Props) => {
    const dispatch = useDispatch();
    const roomId = useSelector(state => state.roomModule.roomId);
    const boards = useBoards();
    const characters = useCharacters();
    const myUserUid = useMyUserUid();
    const me = useMe();
    const activeBoardKey = useSelector(state => state.roomModule.roomState?.state?.activeBoardKey);
    const activeBoardPanelConfig = useSelector(
        state => state.roomConfigModule?.panels.activeBoardPanel
    );
    const [activeBoardSelectorModalVisibility, setActiveBoardSelectorModalVisibility] =
        React.useState(false);

    const boardKeyToShow = (() => {
        if (panel.type === 'activeBoard') {
            return activeBoardKey;
        }
        if (panel.boardEditorPanel.activeBoardKey == null) {
            return null;
        }
        return {
            createdBy: myUserUid ?? 'FAKE_USER_ID@Board.tsx',
            id: panel.boardEditorPanel.activeBoardKey,
        };
    })();

    const dicePieceValues = useDicePieces(boardKeyToShow ?? false);
    const numberPieceValues = useNumberPieces(boardKeyToShow ?? false);
    const imagePieces = useImagePieces(boardKeyToShow ?? false);

    if (
        me == null ||
        myUserUid == null ||
        roomId == null ||
        boards == null ||
        characters == null ||
        numberPieceValues == null
    ) {
        return null;
    }

    const boardConfig =
        (() => {
            if (boardKeyToShow == null) {
                return null;
            }
            if (panel.type === 'activeBoard') {
                if (activeBoardPanelConfig == null) {
                    return null;
                }
                return activeBoardPanelConfig.board;
            }
            return panel.boardEditorPanel.boards[keyNames(boardKeyToShow)];
        })() ?? defaultBoardConfig();

    const boardEditorPanelId = panel.type === 'boardEditor' ? panel.boardEditorPanelId : null;

    const board = boardKeyToShow == null ? null : boards.get(boardKeyToShow);

    const boardComponent = (() => {
        if (boardKeyToShow == null) {
            return (
                <div>{`${
                    panel.type === 'activeBoard' ? 'ボードビュアー' : 'ボードエディター'
                }に表示するボードが指定されていません。`}</div>
            );
        }
        if (board == null) {
            return (
                <div>{`キーが ${keyNames(
                    boardKeyToShow
                )} であるボードが見つかりませんでした。`}</div>
            );
        }

        return (
            <BoardCore
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                board={board}
                boardKey={boardKeyToShow}
                boardConfig={boardConfig}
                boardEditorPanelId={boardEditorPanelId}
                onClick={() =>
                    dispatch(
                        roomDrawerAndPopoverAndModalModule.actions.set({ boardContextMenu: null })
                    )
                }
                onTooltip={newValue =>
                    dispatch(
                        roomDrawerAndPopoverAndModalModule.actions.set({ boardTooltip: newValue })
                    )
                }
                onPopupEditor={newValue =>
                    dispatch(
                        roomDrawerAndPopoverAndModalModule.actions.set({
                            boardPopoverEditor: newValue,
                        })
                    )
                }
                onContextMenu={(e, stateOffset) => {
                    e.evt.preventDefault();
                    dispatch(
                        roomDrawerAndPopoverAndModalModule.actions.set({
                            boardContextMenu: {
                                boardKey: boardKeyToShow,
                                boardConfig,
                                offsetX: e.evt.offsetX,
                                offsetY: e.evt.offsetY,
                                pageX: e.evt.pageX,
                                pageY: e.evt.pageY,
                                characterPiecesOnCursor: characters
                                    .toArray()
                                    .flatMap(([characterKey, character]) => {
                                        return dualKeyRecordToDualKeyMap<PieceState>(
                                            character.pieces
                                        )
                                            .toArray()
                                            .filter(([, piece]) => {
                                                if (
                                                    !compositeKeyEquals(
                                                        boardKeyToShow,
                                                        piece.boardKey
                                                    )
                                                ) {
                                                    return false;
                                                }
                                                return Piece.isCursorOnIcon({
                                                    ...board,
                                                    state: piece,
                                                    cursorPosition: stateOffset,
                                                });
                                            })
                                            .map(([pieceKey, piece]) => {
                                                return {
                                                    characterKey,
                                                    character,
                                                    pieceKey: {
                                                        createdBy: pieceKey.first,
                                                        id: pieceKey.second,
                                                    },
                                                    piece,
                                                };
                                            });
                                    }),
                                tachiesOnCursor: characters
                                    .toArray()
                                    .flatMap(([characterKey, character]) => {
                                        return dualKeyRecordToDualKeyMap<BoardLocationState>(
                                            character.tachieLocations
                                        )
                                            .toArray()
                                            .filter(([, tachie]) => {
                                                if (
                                                    !compositeKeyEquals(
                                                        boardKeyToShow,
                                                        tachie.boardKey
                                                    )
                                                ) {
                                                    return false;
                                                }
                                                return BoardLocation.isCursorOnIcon({
                                                    state: tachie,
                                                    cursorPosition: stateOffset,
                                                });
                                            })
                                            .map(([tachieLocationKey, tachieLocation]) => {
                                                return {
                                                    characterKey,
                                                    character,
                                                    tachieLocationKey: {
                                                        createdBy: tachieLocationKey.first,
                                                        id: tachieLocationKey.second,
                                                    },
                                                    tachieLocation,
                                                };
                                            });
                                    }),
                                imagePieceValuesOnCursor: (imagePieces ?? [])
                                    .filter(pieceValueElement => {
                                        if (pieceValueElement.piece == null) {
                                            return false;
                                        }
                                        return Piece.isCursorOnIcon({
                                            ...board,
                                            state: pieceValueElement.piece,
                                            cursorPosition: stateOffset,
                                        });
                                    })
                                    .map(x => x.value),
                                dicePieceValuesOnCursor: (dicePieceValues ?? [])
                                    .filter(pieceValueElement => {
                                        if (pieceValueElement.piece == null) {
                                            return false;
                                        }
                                        return Piece.isCursorOnIcon({
                                            ...board,
                                            state: pieceValueElement.piece,
                                            cursorPosition: stateOffset,
                                        });
                                    })
                                    .map(({ value: element, piece }) => ({
                                        dicePieceValueKey: element.valueId,
                                        dicePieceValue: element.value,
                                        piece,
                                        characterKey: {
                                            createdBy: element.characterKey.createdBy,
                                            id: element.characterKey.id,
                                        },
                                    })),
                                numberPieceValuesOnCursor: (numberPieceValues ?? [])
                                    .filter(pieceValueElement => {
                                        if (pieceValueElement.piece == null) {
                                            return false;
                                        }
                                        return Piece.isCursorOnIcon({
                                            ...board,
                                            state: pieceValueElement.piece,
                                            cursorPosition: stateOffset,
                                        });
                                    })
                                    .map(({ value: element, piece }) => ({
                                        numberPieceValueKey: element.valueId,
                                        numberPieceValue: element.value,
                                        piece,
                                        characterKey: {
                                            createdBy: element.characterKey.createdBy,
                                            id: element.characterKey.id,
                                        },
                                    })),
                            },
                        })
                    );
                }}
            />
        );
    })();

    const dropDownItems =
        boardEditorPanelId == null
            ? null
            : boards.toArray().map(([key, board]) => {
                  if (key.createdBy !== myUserUid) {
                      // 自分が作成者でないBoardはActiveBoardとして含まれていることがあるが、エディターで表示させると混乱を招くので除外している
                      return null;
                  }
                  return (
                      <Menu.Item
                          key={keyNames(key)}
                          onClick={() =>
                              dispatch(
                                  roomConfigModule.actions.updateBoardEditorPanel({
                                      boardEditorPanelId,
                                      roomId,
                                      panel: {
                                          activeBoardKey: key.id,
                                      },
                                  })
                              )
                          }
                      >
                          {board.name === '' ? '(名前なし)' : board.name}
                      </Menu.Item>
                  );
              });

    // activeBoardPanelモードのときは boardsMenu==null
    const boardsMenu =
        dropDownItems == null ? null : (
            <Menu>
                <Menu.ItemGroup title="ボード一覧">{dropDownItems}</Menu.ItemGroup>
                <Menu.Divider />
                <Menu.Item
                    icon={<Icons.PlusOutlined />}
                    onClick={() =>
                        dispatch(
                            roomDrawerAndPopoverAndModalModule.actions.set({
                                boardDrawerType: { type: create },
                            })
                        )
                    }
                >
                    新規作成
                </Menu.Item>
            </Menu>
        );

    const noActiveBoardText = '';

    return (
        <div style={{ position: 'relative' }}>
            {boardComponent}
            <div style={boardsDropDownStyle}>
                {boardsMenu != null ? (
                    <Dropdown overlay={boardsMenu} trigger={['click']}>
                        <Button>
                            {boardKeyToShow == null
                                ? noActiveBoardText
                                : boards.get(boardKeyToShow)?.name ?? noActiveBoardText}{' '}
                            <Icons.DownOutlined />
                        </Button>
                    </Dropdown>
                ) : (
                    <>
                        <div style={{ marginRight: 4, padding: 4, background: '#E0E0E010' }}>
                            {board?.name}
                        </div>
                        <Button
                            onClick={() => {
                                setActiveBoardSelectorModalVisibility(true);
                            }}
                        >
                            表示ボードの変更
                        </Button>
                    </>
                )}
                <Button
                    disabled={boardKeyToShow == null}
                    onClick={() => {
                        if (boardKeyToShow == null) {
                            return;
                        }
                        dispatch(
                            roomDrawerAndPopoverAndModalModule.actions.set({
                                boardDrawerType: { type: update, stateKey: boardKeyToShow },
                            })
                        );
                    }}
                >
                    編集
                </Button>
            </div>
            <div style={zoomButtonStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Button
                        onClick={() => {
                            if (boardKeyToShow == null) {
                                return;
                            }
                            dispatch(
                                roomConfigModule.actions.zoomBoard({
                                    roomId,
                                    boardKey: boardKeyToShow,
                                    boardEditorPanelId,
                                    zoomDelta: 0.25,
                                    prevCanvasWidth: canvasWidth,
                                    prevCanvasHeight: canvasHeight,
                                })
                            );
                        }}
                    >
                        <Icon.ZoomInOutlined />
                    </Button>
                    <Button
                        onClick={() => {
                            if (boardKeyToShow == null) {
                                return;
                            }
                            dispatch(
                                roomConfigModule.actions.zoomBoard({
                                    roomId,
                                    boardKey: boardKeyToShow,
                                    boardEditorPanelId,
                                    zoomDelta: -0.25,
                                    prevCanvasWidth: canvasWidth,
                                    prevCanvasHeight: canvasHeight,
                                })
                            );
                        }}
                    >
                        <Icon.ZoomOutOutlined />
                    </Button>
                    <div style={{ height: 6 }} />
                    <Button
                        onClick={() => {
                            if (boardKeyToShow == null) {
                                return;
                            }
                            dispatch(
                                roomConfigModule.actions.resetBoard({
                                    roomId,
                                    boardKey: boardKeyToShow,
                                    boardEditorPanelId,
                                })
                            );
                        }}
                    >
                        Boardの位置とズームをリセット
                    </Button>
                </div>
            </div>
            <ActiveBoardSelectorModal
                visible={activeBoardSelectorModalVisibility}
                onComplete={() => setActiveBoardSelectorModalVisibility(false)}
            />
        </div>
    );
};
