/** @jsxImportSource @emotion/react */
import * as Icons from '@ant-design/icons';
import { $free, OmitVersion, State, boardTemplate, pieceTemplate } from '@flocon-trpg/core';
import { FilePath, FileSourceType } from '@flocon-trpg/typed-document-node';
import { keyNames, recordToArray } from '@flocon-trpg/utils';
import { Message, publicMessage } from '@flocon-trpg/web-server-utils';
import { useTransition } from '@react-spring/konva';
import { Button, Dropdown, Menu, Popover } from 'antd';
import { ItemType } from 'antd/lib/menu/interface';
import classNames from 'classnames';
import { useSetAtom } from 'jotai/react';
import { KonvaEventObject } from 'konva/lib/Node';
import { Vector2d } from 'konva/lib/types';
import React from 'react';
import * as ReactKonva from 'react-konva';
import { Subject, debounceTime } from 'rxjs';
import { CombinedError } from 'urql';
import useConstant from 'use-constant';
import { boardContextMenuAtom } from '../../atoms/boardContextMenuAtom/boardContextMenuAtom';
import { boardPopoverEditorAtom } from '../../atoms/boardPopoverEditorAtom/boardPopoverEditorAtom';
import { boardTooltipAtom } from '../../atoms/boardTooltipAtom/boardTooltipAtom';
import { useBoards } from '../../hooks/useBoards';
import { useCharacterPieces } from '../../hooks/useCharacterPieces';
import { useCharacters } from '../../hooks/useCharacters';
import { useDicePieces } from '../../hooks/useDicePieces';
import { useImagePieces } from '../../hooks/useImagePieces';
import { useIsMyCharacter } from '../../hooks/useIsMyCharacter';
import { useMe } from '../../hooks/useMe';
import { useParticipants } from '../../hooks/useParticipants';
import { usePortraitPieces } from '../../hooks/usePortraitPieces';
import { useRoomId } from '../../hooks/useRoomId';
import { useShapePieces } from '../../hooks/useShapePieces';
import { useStringPieces } from '../../hooks/useStringPieces';
import {
    DragEndResult,
    PixelPosition,
    isCursorOnPixelRect,
    isCursorOnState,
    stateToPixelRect,
    toCellPosition,
    toCellSize,
} from '../../utils/positionAndSizeAndRect';
import { MouseOverOn } from '../../utils/types';
import { boardEditorModalAtom } from '../BoardEditorModal/BoardEditorModal';
import { importBoardModalVisibilityAtom } from '../ImportBoardModal/ImportBoardModal';
import { ActiveBoardSelectorModal } from './subcomponents/components/ActiveBoardSelectorModal/ActiveBoardSelecterModal';
import { BoardConfigEditor } from './subcomponents/components/BoardConfigEditor/BoardConfigEditor';
import {
    DiceOrShapeOrStringPiece,
    shapePiece,
} from './subcomponents/components/CanvasOrDiceOrStringPiece/CanvasOrDiceOrStringPiece';
import { ImagePiece } from './subcomponents/components/ImagePiece/ImagePiece';
import {
    editBoard,
    custom,
    roomConfigAtomFamily,
    zoomBoard,
} from '@/atoms/roomConfigAtom/roomConfigAtom';
import { ActiveBoardPanelConfig } from '@/atoms/roomConfigAtom/types/activeBoardPanelConfig';
import { BoardConfig, defaultBoardConfig } from '@/atoms/roomConfigAtom/types/boardConfig';
import { BoardEditorPanelConfig } from '@/atoms/roomConfigAtom/types/boardEditorPanelConfig';
import { AllContextProvider } from '@/components/behaviors/AllContextProvider';
import { NotificationType } from '@/components/models/room/Room/subcomponents/components/Notification/Notification';
import { useRoomMessages } from '@/components/models/room/Room/subcomponents/hooks/useRoomMessages';
import { useSetRoomStateWithImmer } from '@/components/models/room/Room/subcomponents/hooks/useSetRoomStateWithImmer';
import { AnimatedImageAsAnyProps } from '@/components/ui/AnimatedKonvaAsAnyProps/AnimatedKonvaAsAnyProps';
import { success, useImageFromFilePath } from '@/hooks/imageHooks';
import { useAllContext } from '@/hooks/useAllContext';
import { useMyUserUid } from '@/hooks/useMyUserUid';
import { useRoomStateValueSelector } from '@/hooks/useRoomStateValueSelector';
import { Styles } from '@/styles';
import { cancelRnd, flex, flexColumn, itemsEnd } from '@/styles/className';
import { create, update } from '@/utils/constants';
import { range } from '@/utils/range';
import { BoardType } from '@/utils/types';
import { defaultTriggerSubMenuAction } from '@/utils/variables';

type BoardState = OmitVersion<State<typeof boardTemplate>>;
type PieceState = OmitVersion<State<typeof pieceTemplate>>;

const setDragEndResultToPieceState = ({
    e,
    piece,
    board,
}: {
    e: DragEndResult;
    piece: PieceState;
    board: BoardState;
}): void => {
    if (piece.isCellMode) {
        if (e.newPosition != null) {
            const position = toCellPosition({ pixelPosition: e.newPosition, cellConfig: board });
            piece.cellX = position.cellX;
            piece.cellY = position.cellY;
        }
        if (e.newSize != null) {
            const size = toCellSize({ pixelSize: e.newSize, cellConfig: board });
            piece.cellW = size.cellW;
            piece.cellH = size.cellH;
        }
    } else {
        if (e.newPosition != null) {
            piece.x = e.newPosition.x;
            piece.y = e.newPosition.y;
        }
        if (e.newSize != null) {
            piece.w = e.newSize.w;
            piece.h = e.newSize.h;
        }
    }
};

// コードを書く際に関数内で例えば character という名前の変数を定義したい場面が多々あるため、衝突しないように末尾に Type をつけている。
const backgroundType = 'background';
const characterType = 'character';
const portraitType = 'portrait';
const dicePieceType = 'dicePiece';
const stringPieceType = 'stringPiece';
const imagePieceType = 'imagePiece';

type SelectedPieceId =
    | {
          type: typeof characterType;
          characterId: string;
          pieceId: string;
      }
    | {
          type: typeof portraitType;
          characterId: string;
          pieceId: string;
      }
    | {
          type:
              | typeof shapePiece
              | typeof dicePieceType
              | typeof imagePieceType
              | typeof stringPieceType;
          pieceId: string;
      };

const publicMessageFilter = (message: Message<NotificationType<CombinedError>>): boolean => {
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
        [subject],
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
    boardId: string;
    boardType: BoardType;
    onClick?: (e: KonvaEventObject<MouseEvent>) => void;
    onContextMenu?: (e: KonvaEventObject<PointerEvent>, stateOffset: PixelPosition) => void; // stateOffsetは、configなどのxy座標を基準にした位置。
    canvasWidth: number;
    canvasHeight: number;
};

const BoardCore: React.FC<BoardCoreProps> = ({
    board,
    boardConfig,
    boardId,
    boardType,
    onClick,
    onContextMenu,
    canvasWidth,
    canvasHeight,
}: BoardCoreProps) => {
    const allContext = useAllContext();

    const roomId = useRoomId();
    const participants = useParticipants();
    const shapePieces = useShapePieces(boardId);
    const dicePieces = useDicePieces(boardId);
    const numberPieces = useStringPieces(boardId);
    const imagePieces = useImagePieces(boardId);
    const characterPieces = useCharacterPieces(boardId);
    const portraitPositions = usePortraitPieces(boardId);

    const setBoardPopoverEditor = useSetAtom(boardPopoverEditorAtom);
    const unsetPopoverEditor = () => {
        setBoardPopoverEditor(null);
    };

    const setBoardTooltip = useSetAtom(boardTooltipAtom);

    const mouseOverOnRef = React.useRef<MouseOverOn>({ type: backgroundType });
    const { stoppedCursor, onMove } = useGetStoppedCursor();
    React.useEffect(() => {
        if (stoppedCursor == null) {
            setBoardTooltip(null);
            return;
        }
        setBoardTooltip({
            pageX: stoppedCursor.x,
            pageY: stoppedCursor.y,
            mouseOverOn: mouseOverOnRef.current,
        });
    }, [setBoardTooltip, stoppedCursor]);
    const [selectedPieceId, setSelectedPieceId] = React.useState<SelectedPieceId>();
    const [isBackgroundDragging, setIsBackgroundDragging] = React.useState(false); // これがないと、pieceをドラッグでリサイズする際に背景が少し動いてしまう。
    const backgroundImage = useImageFromFilePath(board.backgroundImage);
    const backgroundImageResult =
        backgroundImage.type === success ? backgroundImage.image : undefined;
    const roomConfigAtom = roomConfigAtomFamily(roomId);
    const reduceRoomConfig = useSetAtom(roomConfigAtom);
    const setRoomState = useSetRoomStateWithImmer();
    const publicMessages = useRoomMessages({ filter: publicMessageFilter });
    const myUserUid = useMyUserUid();
    const isMyCharacter = useIsMyCharacter();

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

    if (myUserUid == null || roomId == null || participants == null) {
        return null;
    }

    const lastPublicMessage = (() => {
        const publicMessagesValue = publicMessages.current;
        const lastMessage = publicMessagesValue[publicMessagesValue.length - 1];
        if (lastMessage == null) {
            return;
        }
        if (lastMessage.type !== publicMessage) {
            return undefined;
        }
        return lastMessage.value;
    })();

    const cellLines = (() => {
        // 本来はセルの線を縦横無限に表示するのが理想だが、実装簡略化のためとりあえず200本ずつだけ表示している。

        if (!boardConfig.showGrid) {
            return null;
        }
        if (board.cellHeight <= 0 || board.cellWidth <= 0) {
            return null;
        }
        const cellWidth = board.cellWidth;
        const cellHeight = board.cellHeight;
        const verticalLinesFrom = -99;
        const verticalLinesCount = 200;
        const verticalLines = [...range(verticalLinesFrom, verticalLinesCount)].map(i => {
            const height = verticalLinesCount * cellHeight;
            return (
                <ReactKonva.Line
                    key={i}
                    points={[
                        i * cellWidth + board.cellOffsetX,
                        verticalLinesFrom * height + board.cellOffsetY,
                        i * cellHeight + board.cellOffsetX,
                        verticalLinesCount * height + board.cellOffsetY,
                    ]}
                    stroke={boardConfig.gridLineColor}
                    strokeWidth={boardConfig.gridLineTension}
                />
            );
        });
        const horizontalLinesFrom = -99;
        const horizontalLinesCount = 200;
        const horizontalLines = [...range(horizontalLinesFrom, horizontalLinesCount)].map(i => {
            const width = horizontalLinesCount * cellWidth;
            return (
                <ReactKonva.Line
                    key={i}
                    points={[
                        horizontalLinesFrom * width + board.cellOffsetX,
                        i * cellWidth + board.cellOffsetY,
                        horizontalLinesCount * width + board.cellOffsetX,
                        i * cellHeight + board.cellOffsetY,
                    ]}
                    stroke={boardConfig.gridLineColor}
                    strokeWidth={boardConfig.gridLineTension}
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
            ({ characterId, character, piece, pieceId }) => {
                if (character.image == null) {
                    // TODO: 画像なしでコマを表示する
                    return null;
                }

                return (
                    <ImagePiece
                        {...stateToPixelRect({ cellConfig: board, state: piece })}
                        opacity={1}
                        label={boardConfig.showCharacterPieceLabel ? character.name : undefined}
                        key={keyNames(characterId, pieceId)}
                        filePath={character.image}
                        draggable={!piece.isPositionLocked}
                        resizable={!piece.isPositionLocked}
                        listening
                        isSelected={
                            selectedPieceId?.type === characterType &&
                            selectedPieceId.characterId === characterId &&
                            selectedPieceId.pieceId === pieceId
                        }
                        onClick={() => {
                            unsetPopoverEditor();
                            setSelectedPieceId({
                                type: characterType,
                                characterId,
                                pieceId,
                            });
                        }}
                        onDblClick={e => {
                            setBoardPopoverEditor({
                                pageX: e.evt.pageX,
                                pageY: e.evt.pageY,
                                clickOn: {
                                    type: characterType,
                                    character,
                                    characterId,
                                    boardId,
                                    pieceId,
                                },
                            });
                        }}
                        onMouseEnter={() =>
                            (mouseOverOnRef.current = {
                                type: characterType,
                                character,
                                characterId,
                                boardId,
                                pieceId,
                            })
                        }
                        onMouseLeave={() => (mouseOverOnRef.current = { type: backgroundType })}
                        onDragEnd={e => {
                            setRoomState(roomState => {
                                const characterPiece =
                                    roomState.characters?.[characterId]?.pieces?.[pieceId];
                                if (characterPiece == null) {
                                    return;
                                }
                                setDragEndResultToPieceState({ e, piece: characterPiece, board });
                            });
                        }}
                    />
                );
            },
        );

        const portraitPositionElements = (portraitPositions ?? []).map(
            ({ characterId, character, pieceId, piece }) => {
                if (character.portraitImage == null) {
                    // TODO: 画像なしでコマを表示する
                    return null;
                }
                return (
                    <ImagePiece
                        key={keyNames(characterId, pieceId)}
                        label={boardConfig.showPortraitPieceLabel ? piece.name : undefined}
                        opacity={0.75 /* TODO: opacityの値が適当 */}
                        message={lastPublicMessage}
                        messageFilter={msg => {
                            return (
                                msg.createdBy === character.ownerParticipantId &&
                                msg.character?.stateId === characterId &&
                                msg.channelKey !== $free
                            );
                        }}
                        x={piece.x}
                        y={piece.y}
                        w={piece.w}
                        h={piece.h}
                        filePath={character.portraitImage}
                        draggable={!piece.isPositionLocked}
                        resizable={!piece.isPositionLocked}
                        listening
                        isSelected={
                            selectedPieceId?.type === portraitType &&
                            selectedPieceId.characterId === characterId &&
                            selectedPieceId.pieceId === pieceId
                        }
                        onClick={() => {
                            unsetPopoverEditor();
                            setSelectedPieceId({
                                type: portraitType,
                                characterId,
                                pieceId: pieceId,
                            });
                        }}
                        onDblClick={e => {
                            setBoardPopoverEditor({
                                pageX: e.evt.pageX,
                                pageY: e.evt.pageY,
                                clickOn: {
                                    type: portraitType,
                                    character,
                                    characterId,
                                    pieceId,
                                    boardId,
                                },
                            });
                        }}
                        onMouseEnter={() =>
                            (mouseOverOnRef.current = {
                                type: portraitType,
                                character,
                                characterId,
                                boardId,
                                pieceId,
                            })
                        }
                        onMouseLeave={() => (mouseOverOnRef.current = { type: backgroundType })}
                        onDragEnd={e => {
                            setRoomState(roomState => {
                                const portraitPiece =
                                    roomState.characters?.[characterId]?.portraitPieces?.[pieceId];
                                if (portraitPiece == null) {
                                    return;
                                }
                                if (e.newPosition != null) {
                                    portraitPiece.x = e.newPosition.x;
                                    portraitPiece.y = e.newPosition.y;
                                }
                                if (e.newSize != null) {
                                    portraitPiece.w = e.newSize.w;
                                    portraitPiece.h = e.newSize.h;
                                }
                            });
                        }}
                    />
                );
            },
        );

        const imagePieceElements = [...(imagePieces ?? [])].map(([pieceId, piece]) => {
            const defaultImageFilePath: FilePath = {
                // TODO: 適切な画像に変える
                path: '/assets/kari.png',
                sourceType: FileSourceType.Default,
            };
            return (
                <ImagePiece
                    {...stateToPixelRect({ cellConfig: board, state: piece })}
                    label={boardConfig.showImagePieceLabel ? piece.name : undefined}
                    opacity={1}
                    key={pieceId}
                    filePath={piece.image ?? defaultImageFilePath}
                    draggable={!piece.isPositionLocked}
                    resizable={!piece.isPositionLocked}
                    listening
                    isSelected={
                        selectedPieceId?.type === imagePieceType &&
                        selectedPieceId.pieceId === pieceId
                    }
                    onClick={() => {
                        unsetPopoverEditor();
                        setSelectedPieceId({
                            type: imagePieceType,
                            pieceId,
                        });
                    }}
                    onDblClick={e => {
                        setBoardPopoverEditor({
                            pageX: e.evt.pageX,
                            pageY: e.evt.pageY,
                            clickOn: { type: imagePieceType, piece, boardId, pieceId },
                        });
                    }}
                    onMouseEnter={() =>
                        (mouseOverOnRef.current = {
                            type: imagePieceType,
                            piece,
                            boardId,
                            pieceId,
                        })
                    }
                    onMouseLeave={() => (mouseOverOnRef.current = { type: backgroundType })}
                    onDragEnd={e => {
                        setRoomState(roomState => {
                            const imagePiece = roomState.boards?.[boardId]?.imagePieces?.[pieceId];
                            if (imagePiece == null) {
                                return;
                            }
                            setDragEndResultToPieceState({ e, piece: imagePiece, board });
                        });
                    }}
                />
            );
        });

        const dicePieceElements = [...(dicePieces ?? [])].map(([pieceId, piece]) => {
            return (
                <DiceOrShapeOrStringPiece
                    {...stateToPixelRect({ cellConfig: board, state: piece })}
                    key={pieceId}
                    label={boardConfig.showDicePieceLabel ? piece.name : undefined}
                    opacity={1}
                    state={{ type: dicePieceType, state: piece }}
                    draggable={!piece.isPositionLocked}
                    resizable={!piece.isPositionLocked}
                    listening
                    isSelected={
                        selectedPieceId?.type === dicePieceType &&
                        selectedPieceId.pieceId === pieceId
                    }
                    onClick={() => {
                        unsetPopoverEditor();
                        setSelectedPieceId({
                            type: dicePieceType,
                            pieceId,
                        });
                    }}
                    onDblClick={e => {
                        setBoardPopoverEditor({
                            pageX: e.evt.pageX,
                            pageY: e.evt.pageY,
                            clickOn: { type: dicePieceType, piece, pieceId, boardId },
                        });
                    }}
                    onMouseEnter={() =>
                        (mouseOverOnRef.current = { type: dicePieceType, piece, pieceId, boardId })
                    }
                    onMouseLeave={() => (mouseOverOnRef.current = { type: backgroundType })}
                    onDragEnd={e => {
                        setRoomState(roomState => {
                            const dicePiece = roomState.boards?.[boardId]?.dicePieces?.[pieceId];
                            if (dicePiece == null) {
                                return;
                            }
                            setDragEndResultToPieceState({ e, piece: dicePiece, board });
                        });
                    }}
                />
            );
        });

        const shapePieceElements = [...(shapePieces ?? [])].map(([pieceId, piece]) => (
            <DiceOrShapeOrStringPiece
                {...stateToPixelRect({ cellConfig: board, state: piece })}
                key={pieceId}
                label={boardConfig.showShapePieceLabel ? piece.name : undefined}
                opacity={1}
                state={{ type: shapePiece, state: piece, stateId: pieceId }}
                draggable={!piece.isPositionLocked}
                resizable={!piece.isPositionLocked}
                listening
                isSelected={
                    selectedPieceId?.type === 'shapePiece' && selectedPieceId.pieceId === pieceId
                }
                onClick={() => {
                    unsetPopoverEditor();
                    setSelectedPieceId({
                        type: 'shapePiece',
                        pieceId,
                    });
                }}
                onDblClick={e => {
                    setBoardPopoverEditor({
                        pageX: e.evt.pageX,
                        pageY: e.evt.pageY,
                        clickOn: { type: 'shapePiece', piece, pieceId, boardId },
                    });
                }}
                onMouseEnter={() =>
                    (mouseOverOnRef.current = { type: 'shapePiece', piece, pieceId, boardId })
                }
                onMouseLeave={() => (mouseOverOnRef.current = { type: backgroundType })}
                onDragEnd={e => {
                    setRoomState(roomState => {
                        const shapePiece = roomState.boards?.[boardId]?.shapePieces?.[pieceId];
                        if (shapePiece == null) {
                            return;
                        }
                        setDragEndResultToPieceState({ e, piece: shapePiece, board });
                    });
                }}
            />
        ));

        const stringPieceElements = [...(numberPieces ?? [])].map(([pieceId, piece]) => {
            return (
                <DiceOrShapeOrStringPiece
                    {...stateToPixelRect({ cellConfig: board, state: piece })}
                    key={pieceId}
                    label={boardConfig.showStringPieceLabel ? piece.name : undefined}
                    opacity={1}
                    state={{
                        type: stringPieceType,
                        state: piece,
                        createdByMe: isMyCharacter(piece.ownerCharacterId),
                    }}
                    draggable={!piece.isPositionLocked}
                    resizable={!piece.isPositionLocked}
                    listening
                    isSelected={
                        selectedPieceId?.type === stringPieceType &&
                        selectedPieceId.pieceId === pieceId
                    }
                    onClick={() => {
                        unsetPopoverEditor();
                        setSelectedPieceId({
                            type: stringPieceType,
                            pieceId,
                        });
                    }}
                    onDblClick={e => {
                        setBoardPopoverEditor({
                            pageX: e.evt.pageX,
                            pageY: e.evt.pageY,
                            clickOn: { type: stringPieceType, piece, pieceId, boardId },
                        });
                    }}
                    onMouseEnter={() =>
                        (mouseOverOnRef.current = {
                            type: stringPieceType,
                            piece,
                            pieceId,
                            boardId,
                        })
                    }
                    onMouseLeave={() => (mouseOverOnRef.current = { type: backgroundType })}
                    onDragEnd={e => {
                        setRoomState(roomState => {
                            const stringPiece =
                                roomState.boards?.[boardId]?.stringPieces?.[pieceId];
                            if (stringPiece == null) {
                                return;
                            }
                            setDragEndResultToPieceState({ e, piece: stringPiece, board });
                        });
                    }}
                />
            );
        });

        pieces = (
            <AllContextProvider {...allContext} excludeAntdApp>
                <ReactKonva.Layer>
                    {imagePieceElements}
                    {shapePieceElements}
                    {dicePieceElements}
                    {stringPieceElements}
                    {portraitPositionElements}
                    {characterPieceElements}
                </ReactKonva.Layer>
            </AllContextProvider>
        );
    }

    const backgroundImageKonva = backgroundImageTransition(({ opacity, image }) => (
        <AnimatedImageAsAnyProps
            opacity={opacity}
            image={image}
            scaleX={Math.max(board.backgroundImageZoom, 0)}
            scaleY={Math.max(board.backgroundImageZoom, 0)}
            onClick={(e: any) =>
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                e.evt.preventDefault()
            }
        />
    ));

    const scale = Math.pow(2, boardConfig.zoom);

    return (
        <ReactKonva.Stage
            width={canvasWidth}
            height={canvasHeight}
            onClick={e => {
                setSelectedPieceId(undefined);
                unsetPopoverEditor();
                onClick?.(e);
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
                reduceRoomConfig({
                    type: zoomBoard,
                    action: {
                        roomId,
                        boardId,
                        boardType,
                        zoomDelta: e.evt.deltaY > 0 ? -0.25 : 0.25,
                        prevCanvasWidth: canvasWidth,
                        prevCanvasHeight: canvasHeight,
                    },
                });
            }}
        >
            {/* background: ドラッグで全体を動かせる */}
            <AllContextProvider {...allContext} excludeAntdApp>
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
                        reduceRoomConfig({
                            type: editBoard,
                            boardId,
                            boardType,
                            action: boardConfig => {
                                boardConfig.offsetX -= e.evt.movementX / nonZeroScale;
                                boardConfig.offsetY -= e.evt.movementY / nonZeroScale;
                            },
                        });
                    }}
                >
                    {/* このRectがないと画像がないところで位置をドラッグで変えることができない。ただもっといい方法があるかも */}
                    <ReactKonva.Rect x={-100000} y={-100000} width={200000} height={200000} />
                    {backgroundImageKonva}
                    {cellLines}
                </ReactKonva.Layer>
            </AllContextProvider>
            {/* pieces: ドラッグでpieceのみを動かせる */}
            {pieces}
        </ReactKonva.Stage>
    );
};

export type Props = {
    canvasWidth: number;
    canvasHeight: number;
} & (
    | {
          type: 'activeBoard';
          config: ActiveBoardPanelConfig;
          isBackground: boolean;
      }
    | {
          type: 'boardEditor';
          config: BoardEditorPanelConfig;
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

const NonTransparentStyle: React.CSSProperties = {
    background: Styles.backgroundColor,
};

export const Board: React.FC<Props> = ({ canvasWidth, canvasHeight, ...panel }: Props) => {
    const roomId = useRoomId();
    const roomConfigAtom = roomConfigAtomFamily(roomId);
    const reduceRoomConfig = useSetAtom(roomConfigAtom);
    const setBoardContextMenu = useSetAtom(boardContextMenuAtom);
    const setBoardEditorModal = useSetAtom(boardEditorModalAtom);
    const setImportBoardModal = useSetAtom(importBoardModalVisibilityAtom);
    const boards = useBoards();
    const characters = useCharacters();
    const myUserUid = useMyUserUid();
    const me = useMe();
    const activeBoardId = useRoomStateValueSelector(state => state.activeBoardId);
    const [activeBoardSelectorModalVisibility, setActiveBoardSelectorModalVisibility] =
        React.useState(false);

    const boardIdToShow = (() => {
        if (panel.type === 'activeBoard') {
            return activeBoardId ?? undefined;
        }
        if (panel.config.activeBoardId == null) {
            return undefined;
        }
        return panel.config.activeBoardId;
    })();

    const dicePieces = useDicePieces(boardIdToShow);
    const shapePieces = useShapePieces(boardIdToShow);
    const stringPieces = useStringPieces(boardIdToShow);
    const imagePieces = useImagePieces(boardIdToShow);

    if (me == null || myUserUid == null || boards == null || characters == null) {
        return null;
    }

    const boardConfig =
        (() => {
            if (boardIdToShow == null) {
                return null;
            }
            if (panel.type === 'activeBoard') {
                return panel.config.board;
            }
            return panel.config.boards[keyNames(boardIdToShow)];
        })() ?? defaultBoardConfig();

    const boardEditorPanelId = panel.type === 'boardEditor' ? panel.boardEditorPanelId : null;

    const board = boardIdToShow == null ? null : boards.get(boardIdToShow);

    let boardType: BoardType;
    if (panel.type === 'activeBoard') {
        boardType = { type: 'activeBoardViewer', isBackground: panel.isBackground };
    } else {
        boardType = { type: 'boardEditor', boardEditorPanelId: panel.boardEditorPanelId };
    }

    const boardComponent = (() => {
        if (boardIdToShow == null) {
            return (
                <div style={{ width: 500, position: 'absolute', left: 20, top: 20 }}>
                    <p>{`${
                        panel.type === 'activeBoard' ? 'ボードビュアー' : 'ボードエディター'
                    }に表示するボードが指定されていません。`}</p>
                    {panel.type === 'activeBoard' ? (
                        <>
                            <p>
                                ヒント1:
                                {panel.isBackground
                                    ? 'この背景やボードビュアーウィンドウ（デフォルトでは非表示）に表示される内容をボードビュアーと呼びます。'
                                    : 'このボードビュアーウィンドウや背景に表示される内容をボードビュアーと呼びます。'}
                                ボードはマップ画像を表示したり様々なコマを置ける場所です。ボードビュアーには現在のセッションに用いるボードが表示されます。現在はボードが選択されていないため、ここにボードは表示されていません。
                            </p>
                            <p>
                                ヒント2:
                                セッションに用いるボードを用意する場合は、まずボードエディターウィンドウでボードを作成して、次にそのボードをボードビュアーから選択します。
                            </p>
                        </>
                    ) : (
                        <p>
                            ヒント:
                            ボードエディターウィンドウに表示されているボードは自分のみが閲覧、編集可能です。作成したボードを全員に公開して共有する場合は、ボードビュアーから選択します。
                        </p>
                    )}
                </div>
            );
        }
        if (board == null) {
            return (
                <div>{`キーが ${keyNames(
                    boardIdToShow,
                )} であるボードが見つかりませんでした。`}</div>
            );
        }

        return (
            <BoardCore
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                board={board}
                boardId={boardIdToShow}
                boardType={boardType}
                boardConfig={boardConfig}
                onClick={() => setBoardContextMenu(null)}
                onContextMenu={(e, stateOffset) => {
                    e.evt.preventDefault();
                    setBoardContextMenu({
                        boardId: boardIdToShow,
                        boardConfig,
                        offsetX: e.evt.offsetX,
                        offsetY: e.evt.offsetY,
                        pageX: e.evt.pageX,
                        pageY: e.evt.pageY,
                        characterPiecesOnCursor: [...characters].flatMap(
                            ([characterId, character]) => {
                                return recordToArray(character.pieces ?? {})
                                    .filter(({ value: piece }) => {
                                        if (boardIdToShow !== piece.boardId) {
                                            return false;
                                        }
                                        return isCursorOnState({
                                            cellConfig: board,
                                            state: piece,
                                            cursorPosition: stateOffset,
                                        });
                                    })
                                    .map(({ key: pieceId, value: piece }) => {
                                        return {
                                            characterId,
                                            character,
                                            pieceId,
                                            piece,
                                        };
                                    });
                            },
                        ),
                        portraitsOnCursor: [...characters].flatMap(([characterId, character]) => {
                            return recordToArray(character.portraitPieces ?? {})
                                .filter(({ value: portrait }) => {
                                    if (boardIdToShow !== portrait.boardId) {
                                        return false;
                                    }
                                    return isCursorOnPixelRect({
                                        pixelRect: portrait,
                                        cursorPosition: stateOffset,
                                    });
                                })
                                .map(({ key, value }) => {
                                    return {
                                        characterId,
                                        character,
                                        pieceId: key,
                                        piece: value,
                                    };
                                });
                        }),
                        imagePiecesOnCursor: [...(imagePieces ?? [])]
                            .filter(([, piece]) => {
                                return isCursorOnState({
                                    cellConfig: board,
                                    state: piece,
                                    cursorPosition: stateOffset,
                                });
                            })
                            .map(([pieceId, piece]) => ({
                                boardId: boardIdToShow,
                                pieceId,
                                piece,
                            })),
                        dicePiecesOnCursor: [...(dicePieces ?? [])]
                            .filter(([, piece]) => {
                                return isCursorOnState({
                                    cellConfig: board,
                                    state: piece,
                                    cursorPosition: stateOffset,
                                });
                            })
                            .map(([pieceId, piece]) => ({
                                boardId: boardIdToShow,
                                pieceId,
                                piece,
                            })),
                        shapePiecesOnCursor: [...(shapePieces ?? [])]
                            .filter(([, piece]) => {
                                return isCursorOnState({
                                    cellConfig: board,
                                    state: piece,
                                    cursorPosition: stateOffset,
                                });
                            })
                            .map(([pieceId, piece]) => ({
                                boardId: boardIdToShow,
                                pieceId,
                                piece,
                            })),
                        stringPiecesOnCursor: [...(stringPieces ?? [])]
                            .filter(([, piece]) => {
                                return isCursorOnState({
                                    cellConfig: board,
                                    state: piece,
                                    cursorPosition: stateOffset,
                                });
                            })
                            .map(([pieceId, piece]) => ({
                                boardId: boardIdToShow,
                                pieceId,
                                piece,
                            })),
                    });
                }}
            />
        );
    })();

    const dropDownMenuItems: ItemType[] | null =
        boardEditorPanelId == null
            ? null
            : [...boards].map(([boardId, board]) => {
                  if (board.ownerParticipantId !== myUserUid) {
                      // 自分が作成者でないBoardはActiveBoardとして含まれていることがあるが、エディターで表示させると混乱を招くので除外している
                      return null;
                  }
                  return {
                      key: boardId,
                      onClick: () =>
                          reduceRoomConfig({
                              type: custom,
                              action: roomConfig => {
                                  if (roomConfig == null) {
                                      return;
                                  }
                                  const boardEditorPanel =
                                      roomConfig.panels.boardEditorPanels[boardEditorPanelId];
                                  if (boardEditorPanel == null) {
                                      return;
                                  }
                                  boardEditorPanel.activeBoardId = boardId;
                              },
                          }),
                      label: board.name === '' ? '(名前なし)' : board.name,
                  };
              });

    const boardsMenuItems: ItemType[] | null =
        dropDownMenuItems == null
            ? null
            : [
                  {
                      key: 'ボード一覧@boardMenu',
                      label: 'ボード一覧',
                      children: dropDownMenuItems,
                  },
                  { type: 'divider' },
                  {
                      key: '新規作成@boardMenu',
                      icon: <Icons.PlusOutlined />,
                      label: '新規作成',
                      onClick: () =>
                          setBoardEditorModal({
                              type: create,
                              boardEditorPanelId,
                          }),
                  },
                  {
                      key: 'インポート@boardMenu',
                      label: 'インポート',
                      onClick: () => setImportBoardModal(true),
                  },
              ];

    // activeBoardPanelモードのときは boardsMenu==null
    const boardsMenu =
        boardsMenuItems == null ? null : (
            <Menu items={boardsMenuItems} triggerSubMenuAction={defaultTriggerSubMenuAction} />
        );

    const noActiveBoardText = '';

    return (
        <div style={{ position: 'relative' }}>
            {boardComponent}
            <div style={boardsDropDownStyle}>
                {boardsMenu != null ? (
                    <Dropdown overlay={boardsMenu} trigger={['click']}>
                        <Button style={NonTransparentStyle}>
                            {boardIdToShow == null
                                ? noActiveBoardText
                                : (boards.get(boardIdToShow)?.name ?? noActiveBoardText)}{' '}
                            <Icons.DownOutlined />
                        </Button>
                    </Dropdown>
                ) : (
                    <>
                        <div
                            style={{
                                marginRight: 4,
                                padding: 4,
                                background: Styles.backgroundColor,
                            }}
                        >
                            {board?.name}
                        </div>
                        <Button
                            style={NonTransparentStyle}
                            onClick={() => {
                                setActiveBoardSelectorModalVisibility(true);
                            }}
                        >
                            表示ボードの変更
                        </Button>
                    </>
                )}
                <Button
                    style={NonTransparentStyle}
                    disabled={boardIdToShow == null}
                    onClick={() => {
                        if (boardIdToShow == null) {
                            return;
                        }
                        setBoardEditorModal({
                            type: update,
                            stateId: boardIdToShow,
                        });
                    }}
                >
                    編集
                </Button>
            </div>
            <div style={zoomButtonStyle}>
                <div className={classNames(flex, flexColumn, itemsEnd)}>
                    {boardIdToShow && (
                        <>
                            <Popover
                                trigger="click"
                                overlayClassName={cancelRnd}
                                content={
                                    <BoardConfigEditor
                                        boardId={boardIdToShow}
                                        boardType={boardType}
                                        boardConfig={boardConfig}
                                    />
                                }
                                // デフォルトではtopだが、このボタンがブラウザ画面の右端近くにあるとBoardConfigEditorが縦長になってしまい見づらい。ボタンは右下にあるため、縦長になったりはみ出したりすることが最も少ないであろうleftBottomとしている。
                                placement="leftBottom"
                            >
                                <Button>表示設定</Button>
                            </Popover>
                            <div style={{ height: 18 }} />
                        </>
                    )}
                    <Button
                        style={NonTransparentStyle}
                        onClick={() => {
                            if (boardIdToShow == null) {
                                return;
                            }
                            reduceRoomConfig({
                                type: zoomBoard,
                                action: {
                                    roomId,
                                    boardId: boardIdToShow,
                                    boardType,
                                    zoomDelta: 0.25,
                                    prevCanvasWidth: canvasWidth,
                                    prevCanvasHeight: canvasHeight,
                                },
                            });
                        }}
                    >
                        <Icons.ZoomInOutlined />
                    </Button>
                    <Button
                        style={NonTransparentStyle}
                        onClick={() => {
                            if (boardIdToShow == null) {
                                return;
                            }
                            reduceRoomConfig({
                                type: zoomBoard,
                                action: {
                                    roomId,
                                    boardId: boardIdToShow,
                                    boardType,
                                    zoomDelta: -0.25,
                                    prevCanvasWidth: canvasWidth,
                                    prevCanvasHeight: canvasHeight,
                                },
                            });
                        }}
                    >
                        <Icons.ZoomOutOutlined />
                    </Button>
                    <div style={{ height: 6 }} />
                    <Button
                        style={NonTransparentStyle}
                        onClick={() => {
                            if (boardIdToShow == null) {
                                return;
                            }
                            reduceRoomConfig({
                                type: editBoard,
                                boardId: boardIdToShow,
                                boardType,
                                action: () => {
                                    return defaultBoardConfig();
                                },
                            });
                        }}
                    >
                        ボードの位置とズームをリセット
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
