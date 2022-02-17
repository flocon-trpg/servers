/** @jsxImportSource @emotion/react */
import React from 'react';
import { success, useImageFromGraphQL } from '../../../../hooks/image';
import * as ReactKonva from 'react-konva';
import { Button, Dropdown, InputNumber, Menu, Popover } from 'antd';
import * as Icons from '@ant-design/icons';
import { KonvaEventObject } from 'konva/types/Node';
import { update } from '../../../../stateManagers/states/types';
import * as Icon from '@ant-design/icons';
import { Message, publicMessage, useFilteredRoomMessages } from '../../../../hooks/useRoomMessages';
import { useMe } from '../../../../hooks/useMe';
import { useCharacters } from '../../../../hooks/state/useCharacters';
import { useParticipants } from '../../../../hooks/state/useParticipants';
import { Piece } from '../../../../utils/board/piece';
import { useBoards } from '../../../../hooks/state/useBoards';
import { BoardPosition } from '../../../../utils/board/boardPosition';
import { ActiveBoardSelectorModal } from './ActiveBoardSelecterModal';
import useConstant from 'use-constant';
import { debounceTime } from 'rxjs/operators';
import { Vector2d } from 'konva/types/types';
import { Subject } from 'rxjs';
import { PieceState, BoardState, $free } from '@flocon-trpg/core';
import { keyNames, recordToArray } from '@flocon-trpg/utils';
import { useMyUserUid } from '../../../../hooks/useMyUserUid';
import { FilePath, FileSourceType } from '@flocon-trpg/typed-document-node';
import { ImagePiece } from './ImagePiece';
import { DragEndResult, Vector2 } from '../../../../utils/types';
import { DiceOrStringPiece } from './DiceOrStringPiece';
import { useTransition, animated } from '@react-spring/konva';
import { useCharacterPieces } from '../../../../hooks/state/useCharacterPieces';
import { usePortraitPieces } from '../../../../hooks/state/usePortraitPieces';
import { useDicePieces } from '../../../../hooks/state/useDicePieces';
import { useStringPieces } from '../../../../hooks/state/useStringPieces';
import { useImagePieces } from '../../../../hooks/state/useImagePieces';
import { useAllContext } from '../../../../hooks/useAllContext';
import { AllContextProvider } from '../../../behaviors/AllContextProvider';
import { range } from '../../../../utils/range';
import classNames from 'classnames';
import {
    cancelRnd,
    flex,
    flexColumn,
    flexRow,
    itemsCenter,
    itemsEnd,
} from '../../../../utils/className';
import { SketchPicker } from 'react-color';
import { css } from '@emotion/react';
import { rgba } from '../../../../utils/rgba';
import { roomConfigAtom } from '../../../../atoms/roomConfig/roomConfigAtom';
import { roomAtom } from '../../../../atoms/room/roomAtom';
import { useAtomSelector } from '../../../../atoms/useAtomSelector';
import { BoardConfig, defaultBoardConfig } from '../../../../atoms/roomConfig/types/boardConfig';
import { RoomConfigUtils } from '../../../../atoms/roomConfig/types/roomConfig/utils';
import { ActiveBoardPanelConfig } from '../../../../atoms/roomConfig/types/activeBoardPanelConfig';
import { BoardEditorPanelConfig } from '../../../../atoms/roomConfig/types/boardEditorPanelConfig';
import { useImmerUpdateAtom } from '../../../../atoms/useImmerUpdateAtom';
import { boardTooltipAtom } from '../../../../atoms/overlay/board/boardTooltipAtom';
import { boardPopoverEditorAtom } from '../../../../atoms/overlay/board/boardPopoverEditorAtom';
import { MouseOverOn } from '../../../../atoms/overlay/board/types';
import { useUpdateAtom } from 'jotai/utils';
import { boardContextMenuAtom } from '../../../../atoms/overlay/board/boardContextMenuAtom';
import { create } from '../../../../utils/constants';
import { boardEditorModalAtom } from './BoardEditorModal';
import { useSetRoomStateWithImmer } from '../../../../hooks/useSetRoomStateWithImmer';
import { importBoardModalVisibilityAtom } from './ImportBoardModal';
import { BoardType } from '../../../../utils/board/boardType';
import { useIsMyCharacter } from '../../../../hooks/state/useIsMyCharacter';
import { imagePieceModalAtom } from './ImagePieceModal';
import { Styles } from '../../../../styles';

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
            const position = Piece.getCellPosition({ ...e.newPosition, board });
            piece.cellX = position.cellX;
            piece.cellY = position.cellY;
        }
        if (e.newSize != null) {
            const size = Piece.getCellSize({ ...e.newSize, board });
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

const background = 'background';
const character = 'character';
const portrait = 'portrait';
const dicePiece = 'dicePiece';
const stringPiece = 'stringPiece';
const imagePiece = 'imagePiece';

type SelectedPieceId =
    | {
          type: typeof character;
          characterId: string;
          pieceId: string;
      }
    | {
          type: typeof portrait;
          characterId: string;
          pieceId: string;
      }
    | {
          type: typeof dicePiece | typeof stringPiece;
          pieceId: string;
      }
    | {
          type: typeof imagePiece;
          pieceId: string;
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
    boardId: string;
    boardType: BoardType;
    onClick?: (e: KonvaEventObject<MouseEvent>) => void;
    onContextMenu?: (e: KonvaEventObject<PointerEvent>, stateOffset: Vector2) => void; // stateOffsetは、configなどのxy座標を基準にした位置。
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

    const roomId = useAtomSelector(roomAtom, state => state.roomId);
    const participants = useParticipants();
    const dicePieces = useDicePieces(boardId);
    const numberPieces = useStringPieces(boardId);
    const imagePieces = useImagePieces(boardId);
    const characterPieces = useCharacterPieces(boardId);
    const portraitPositions = usePortraitPieces(boardId);

    const setBoardPopoverEditor = useUpdateAtom(boardPopoverEditorAtom);
    const unsetPopoverEditor = () => {
        setBoardPopoverEditor(null);
    };

    const setBoardTooltip = useUpdateAtom(boardTooltipAtom);

    const mouseOverOnRef = React.useRef<MouseOverOn>({ type: background });
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
    const backgroundImage = useImageFromGraphQL(board.backgroundImage);
    const backgroundImageResult =
        backgroundImage.type === success ? backgroundImage.image : undefined;
    const setRoomConfig = useImmerUpdateAtom(roomConfigAtom);
    const setRoomState = useSetRoomStateWithImmer();
    const publicMessages = useFilteredRoomMessages({ filter: publicMessageFilter });
    const myUserUid = useMyUserUid();
    const isMyCharacter = useIsMyCharacter();
    const setImagePieceModal = useUpdateAtom(imagePieceModalAtom);

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
                        {...Piece.getPosition({ ...board, state: piece })}
                        opacity={1}
                        label={piece.name}
                        key={keyNames(characterId, pieceId)}
                        filePath={character.image}
                        draggable={!piece.isPositionLocked}
                        resizable={!piece.isPositionLocked}
                        listening
                        isSelected={
                            selectedPieceId?.type === 'character' &&
                            selectedPieceId.characterId === characterId &&
                            selectedPieceId.pieceId === pieceId
                        }
                        onClick={() => {
                            unsetPopoverEditor();
                            setSelectedPieceId({
                                type: 'character',
                                characterId,
                                pieceId,
                            });
                        }}
                        onDblClick={e => {
                            setBoardPopoverEditor({
                                pageX: e.evt.pageX,
                                pageY: e.evt.pageY,
                                dblClickOn: { type: 'character', character, characterId, pieceId },
                            });
                        }}
                        onMouseEnter={() =>
                            (mouseOverOnRef.current = {
                                type: 'character',
                                character,
                                characterId,
                                pieceId,
                            })
                        }
                        onMouseLeave={() => (mouseOverOnRef.current = { type: 'background' })}
                        onDragEnd={e => {
                            setRoomState(roomState => {
                                const characterPiece =
                                    roomState.characters[characterId]?.pieces?.[pieceId];
                                if (characterPiece == null) {
                                    return;
                                }
                                setDragEndResultToPieceState({ e, piece: characterPiece, board });
                            });
                        }}
                    />
                );
            }
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
                            selectedPieceId?.type === 'portrait' &&
                            selectedPieceId.characterId === characterId &&
                            selectedPieceId.pieceId === pieceId
                        }
                        onClick={() => {
                            unsetPopoverEditor();
                            setSelectedPieceId({
                                type: 'portrait',
                                characterId,
                                pieceId: pieceId,
                            });
                        }}
                        onDblClick={e => {
                            setBoardPopoverEditor({
                                pageX: e.evt.pageX,
                                pageY: e.evt.pageY,
                                dblClickOn: { type: 'portrait', character, characterId, pieceId },
                            });
                        }}
                        onMouseEnter={() =>
                            (mouseOverOnRef.current = {
                                type: 'portrait',
                                character,
                                characterId,
                                pieceId,
                            })
                        }
                        onMouseLeave={() => (mouseOverOnRef.current = { type: 'background' })}
                        onDragEnd={e => {
                            setRoomState(roomState => {
                                const portraitPiece =
                                    roomState.characters[characterId]?.portraitPieces?.[pieceId];
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
            }
        );

        const imagePieceElements = [...(imagePieces ?? [])].map(([pieceId, piece]) => {
            const defaultImageFilePath: FilePath = {
                // TODO: 適切な画像に変える
                path: '/assets/kari.png',
                sourceType: FileSourceType.Default,
            };
            return (
                <ImagePiece
                    {...Piece.getPosition({ ...board, state: piece })}
                    opacity={1}
                    key={pieceId}
                    filePath={piece.image ?? defaultImageFilePath}
                    draggable={!piece.isPositionLocked}
                    resizable={!piece.isPositionLocked}
                    listening
                    isSelected={
                        selectedPieceId?.type === 'imagePiece' &&
                        selectedPieceId.pieceId === pieceId
                    }
                    onClick={() => {
                        unsetPopoverEditor();
                        setSelectedPieceId({
                            type: 'imagePiece',
                            pieceId,
                        });
                    }}
                    onDblClick={e => {
                        setBoardPopoverEditor({
                            pageX: e.evt.pageX,
                            pageY: e.evt.pageY,
                            dblClickOn: { type: 'imagePiece', piece, boardId, pieceId },
                        });
                        setImagePieceModal({
                            type: update,
                            boardId,
                            pieceId,
                        });
                    }}
                    onMouseEnter={() =>
                        (mouseOverOnRef.current = {
                            type: 'imagePiece',
                            piece,
                            boardId,
                            pieceId,
                        })
                    }
                    onMouseLeave={() => (mouseOverOnRef.current = { type: 'background' })}
                    onDragEnd={e => {
                        setRoomState(roomState => {
                            const imagePiece = roomState.boards[boardId]?.imagePieces?.[pieceId];
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
                <DiceOrStringPiece
                    {...Piece.getPosition({ ...board, state: piece })}
                    key={pieceId}
                    opacity={1}
                    state={{ type: dicePiece, state: piece }}
                    createdByMe={isMyCharacter(piece.ownerCharacterId)}
                    draggable={!piece.isPositionLocked}
                    resizable={!piece.isPositionLocked}
                    listening
                    isSelected={
                        selectedPieceId?.type === 'dicePiece' && selectedPieceId.pieceId === pieceId
                    }
                    onClick={() => {
                        unsetPopoverEditor();
                        setSelectedPieceId({
                            type: 'dicePiece',
                            pieceId,
                        });
                    }}
                    onDblClick={e => {
                        setBoardPopoverEditor({
                            pageX: e.evt.pageX,
                            pageY: e.evt.pageY,
                            dblClickOn: { type: 'dicePiece', piece, pieceId, boardId },
                        });
                    }}
                    onMouseEnter={() =>
                        (mouseOverOnRef.current = { type: 'dicePiece', piece, pieceId, boardId })
                    }
                    onMouseLeave={() => (mouseOverOnRef.current = { type: 'background' })}
                    onDragEnd={e => {
                        setRoomState(roomState => {
                            const dicePiece = roomState.boards[boardId]?.dicePieces?.[pieceId];
                            if (dicePiece == null) {
                                return;
                            }
                            setDragEndResultToPieceState({ e, piece: dicePiece, board });
                        });
                    }}
                />
            );
        });

        const stringPieceElements = [...(numberPieces ?? [])].map(([pieceId, piece]) => {
            return (
                <DiceOrStringPiece
                    {...Piece.getPosition({ ...board, state: piece })}
                    key={pieceId}
                    opacity={1}
                    state={{ type: 'stringPiece', state: piece }}
                    createdByMe={isMyCharacter(piece.ownerCharacterId)}
                    draggable={!piece.isPositionLocked}
                    resizable={!piece.isPositionLocked}
                    listening
                    isSelected={
                        selectedPieceId?.type === 'stringPiece' &&
                        selectedPieceId.pieceId === pieceId
                    }
                    onClick={() => {
                        unsetPopoverEditor();
                        setSelectedPieceId({
                            type: 'stringPiece',
                            pieceId,
                        });
                    }}
                    onDblClick={e => {
                        setBoardPopoverEditor({
                            pageX: e.evt.pageX,
                            pageY: e.evt.pageY,
                            dblClickOn: { type: 'stringPiece', piece, pieceId, boardId },
                        });
                    }}
                    onMouseEnter={() =>
                        (mouseOverOnRef.current = { type: 'stringPiece', piece, pieceId, boardId })
                    }
                    onMouseLeave={() => (mouseOverOnRef.current = { type: 'background' })}
                    onDragEnd={e => {
                        setRoomState(roomState => {
                            const stringPiece = roomState.boards[boardId]?.stringPieces?.[pieceId];
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
            <AllContextProvider {...allContext}>
                <ReactKonva.Layer>
                    {portraitPositionElements}
                    {characterPieceElements}
                    {imagePieceElements}
                    {dicePieceElements}
                    {stringPieceElements}
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
                setSelectedPieceId(undefined);
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
                setRoomConfig(roomConfig => {
                    if (roomConfig == null) {
                        return;
                    }
                    RoomConfigUtils.zoomBoard(roomConfig, {
                        roomId,
                        boardId,
                        boardType,
                        zoomDelta: e.evt.deltaY > 0 ? -0.25 : 0.25,
                        prevCanvasWidth: canvasWidth,
                        prevCanvasHeight: canvasHeight,
                    });
                });
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
                        setRoomConfig(roomConfig => {
                            if (roomConfig == null) {
                                return;
                            }
                            RoomConfigUtils.editBoard(
                                roomConfig,
                                boardId,
                                boardType,
                                boardConfig => {
                                    boardConfig.offsetX -= e.evt.movementX / nonZeroScale;
                                    boardConfig.offsetY -= e.evt.movementY / nonZeroScale;
                                }
                            );
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

type Props = {
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

const NonTransparent: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    return <div style={NonTransparentStyle}>{children}</div>;
};

export const Board: React.FC<Props> = ({ canvasWidth, canvasHeight, ...panel }: Props) => {
    const setRoomConfig = useImmerUpdateAtom(roomConfigAtom);
    const setBoardContextMenu = useUpdateAtom(boardContextMenuAtom);
    const setBoardEditorModal = useUpdateAtom(boardEditorModalAtom);
    const setImportBoardModal = useUpdateAtom(importBoardModalVisibilityAtom);
    const roomId = useAtomSelector(roomAtom, state => state.roomId);
    const boards = useBoards();
    const characters = useCharacters();
    const myUserUid = useMyUserUid();
    const me = useMe();
    const activeBoardId = useAtomSelector(roomAtom, state => state.roomState?.state?.activeBoardId);
    const [activeBoardSelectorModalVisibility, setActiveBoardSelectorModalVisibility] =
        React.useState(false);

    const boardIdToShow = (() => {
        if (panel.type === 'activeBoard') {
            return activeBoardId;
        }
        if (panel.config.activeBoardId == null) {
            return undefined;
        }
        return panel.config.activeBoardId;
    })();

    const dicePieces = useDicePieces(boardIdToShow);
    const stringPieces = useStringPieces(boardIdToShow);
    const imagePieces = useImagePieces(boardIdToShow);

    if (me == null || myUserUid == null || roomId == null || boards == null || characters == null) {
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
                    boardIdToShow
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
                                return recordToArray(character.pieces)
                                    .filter(({ value: piece }) => {
                                        if (boardIdToShow !== piece.boardId) {
                                            return false;
                                        }
                                        return Piece.isCursorOnIcon({
                                            ...board,
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
                            }
                        ),
                        portraitsOnCursor: [...characters].flatMap(([characterId, character]) => {
                            return recordToArray(character.portraitPieces)
                                .filter(({ value: portrait }) => {
                                    if (boardIdToShow !== portrait.boardId) {
                                        return false;
                                    }
                                    return BoardPosition.isCursorOnIcon({
                                        state: portrait,
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
                                return Piece.isCursorOnIcon({
                                    ...board,
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
                                return Piece.isCursorOnIcon({
                                    ...board,
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
                                return Piece.isCursorOnIcon({
                                    ...board,
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

    const dropDownItems =
        boardEditorPanelId == null
            ? null
            : [...boards].map(([boardId, board]) => {
                  if (board.ownerParticipantId !== myUserUid) {
                      // 自分が作成者でないBoardはActiveBoardとして含まれていることがあるが、エディターで表示させると混乱を招くので除外している
                      return null;
                  }
                  return (
                      <Menu.Item
                          key={boardId}
                          onClick={() =>
                              setRoomConfig(roomConfig => {
                                  if (roomConfig == null) {
                                      return;
                                  }
                                  const boardEditorPanel =
                                      roomConfig.panels.boardEditorPanels[boardEditorPanelId];
                                  if (boardEditorPanel == null) {
                                      return;
                                  }
                                  boardEditorPanel.activeBoardId = boardId;
                              })
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
                <Menu.ItemGroup title='ボード一覧'>{dropDownItems}</Menu.ItemGroup>
                <Menu.Divider />
                <Menu.Item
                    icon={<Icons.PlusOutlined />}
                    onClick={() =>
                        setBoardEditorModal({
                            type: create,
                            boardEditorPanelId,
                        })
                    }
                >
                    新規作成
                </Menu.Item>
                <Menu.Item
                    icon={<Icons.ImportOutlined />}
                    onClick={() => setImportBoardModal(true)}
                >
                    インポート
                </Menu.Item>
            </Menu>
        );

    const noActiveBoardText = '';
    const descriptionStyle: React.CSSProperties = { maxWidth: 40, minWidth: 40 };

    return (
        <div style={{ position: 'relative' }}>
            {boardComponent}
            <div style={boardsDropDownStyle}>
                {boardsMenu != null ? (
                    <NonTransparent>
                        <Dropdown overlay={boardsMenu} trigger={['click']}>
                            <Button>
                                {boardIdToShow == null
                                    ? noActiveBoardText
                                    : boards.get(boardIdToShow)?.name ?? noActiveBoardText}{' '}
                                <Icons.DownOutlined />
                            </Button>
                        </Dropdown>
                    </NonTransparent>
                ) : (
                    <>
                        <div style={{ marginRight: 4, padding: 4, background: '#E0E0E010' }}>
                            {board?.name}
                        </div>
                        <NonTransparent>
                            <Button
                                onClick={() => {
                                    setActiveBoardSelectorModalVisibility(true);
                                }}
                            >
                                表示ボードの変更
                            </Button>
                        </NonTransparent>
                    </>
                )}

                <NonTransparent>
                    <Button
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
                </NonTransparent>
            </div>
            <div style={zoomButtonStyle}>
                <div className={classNames(flex, flexColumn, itemsEnd)}>
                    <div className={classNames(flex, flexRow)}>
                        <NonTransparent>
                            <Button
                                onClick={() => {
                                    if (boardIdToShow == null) {
                                        return;
                                    }
                                    setRoomConfig(roomConfig => {
                                        if (roomConfig == null) {
                                            return;
                                        }
                                        RoomConfigUtils.editBoard(
                                            roomConfig,
                                            boardIdToShow,
                                            boardType,
                                            boardConfig => {
                                                boardConfig.showGrid = !boardConfig.showGrid;
                                            }
                                        );
                                    });
                                }}
                            >
                                セルの線の表示/非表示
                            </Button>
                        </NonTransparent>
                        <Popover
                            trigger='click'
                            content={
                                <div className={classNames(cancelRnd, flex, flexColumn)}>
                                    <div style={{ paddingBottom: 8 }}>セルの線の設定</div>
                                    <div className={classNames(flex, flexRow, itemsCenter)}>
                                        <div style={descriptionStyle}>太さ</div>
                                        <InputNumber
                                            value={boardConfig.gridLineTension}
                                            onChange={e => {
                                                if (boardIdToShow == null) {
                                                    return;
                                                }
                                                setRoomConfig(roomConfig => {
                                                    if (roomConfig == null) {
                                                        return;
                                                    }
                                                    RoomConfigUtils.editBoard(
                                                        roomConfig,
                                                        boardIdToShow,
                                                        boardType,
                                                        boardConfig => {
                                                            boardConfig.gridLineTension = e;
                                                        }
                                                    );
                                                });
                                            }}
                                        />
                                    </div>
                                    <div className={classNames(flex, flexRow, itemsCenter)}>
                                        <div style={descriptionStyle}>色</div>
                                        {/* ↓ trigger='click' にすると、SketchPickerを開いている状態でPopover全体を閉じたときに次にSketchPickerが開かず（開き直したら直る）操作性が悪いため、'click'は用いていない */}
                                        <Popover
                                            content={
                                                <SketchPicker
                                                    className={cancelRnd}
                                                    css={css`
                                                        color: black;
                                                    `}
                                                    color={boardConfig.gridLineColor}
                                                    onChange={e => {
                                                        if (boardIdToShow == null) {
                                                            return;
                                                        }
                                                        setRoomConfig(roomConfig => {
                                                            if (roomConfig == null) {
                                                                return;
                                                            }
                                                            RoomConfigUtils.editBoard(
                                                                roomConfig,
                                                                boardIdToShow,
                                                                boardType,
                                                                boardConfig => {
                                                                    boardConfig.gridLineColor =
                                                                        rgba(e.rgb);
                                                                }
                                                            );
                                                        });
                                                    }}
                                                />
                                            }
                                        >
                                            <NonTransparent>
                                                <Button>{boardConfig.gridLineColor}</Button>
                                            </NonTransparent>
                                        </Popover>
                                    </div>
                                </div>
                            }
                        >
                            <NonTransparent>
                                <Button>
                                    <Icons.EllipsisOutlined />
                                </Button>
                            </NonTransparent>
                        </Popover>
                    </div>
                    <div style={{ height: 18 }} />
                    <NonTransparent>
                        <Button
                            onClick={() => {
                                if (boardIdToShow == null) {
                                    return;
                                }
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    RoomConfigUtils.zoomBoard(roomConfig, {
                                        roomId,
                                        boardId: boardIdToShow,
                                        boardType,
                                        zoomDelta: 0.25,
                                        prevCanvasWidth: canvasWidth,
                                        prevCanvasHeight: canvasHeight,
                                    });
                                });
                            }}
                        >
                            <Icon.ZoomInOutlined />
                        </Button>
                    </NonTransparent>
                    <NonTransparent>
                        <Button
                            onClick={() => {
                                if (boardIdToShow == null) {
                                    return;
                                }
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    RoomConfigUtils.zoomBoard(roomConfig, {
                                        roomId,
                                        boardId: boardIdToShow,
                                        boardType,
                                        zoomDelta: -0.25,
                                        prevCanvasWidth: canvasWidth,
                                        prevCanvasHeight: canvasHeight,
                                    });
                                });
                            }}
                        >
                            <Icon.ZoomOutOutlined />
                        </Button>
                    </NonTransparent>
                    <div style={{ height: 6 }} />
                    <NonTransparent>
                        <Button
                            onClick={() => {
                                if (boardIdToShow == null) {
                                    return;
                                }
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    RoomConfigUtils.editBoard(
                                        roomConfig,
                                        boardIdToShow,
                                        boardType,
                                        () => {
                                            return defaultBoardConfig();
                                        }
                                    );
                                });
                            }}
                        >
                            ボードの位置とズームをリセット
                        </Button>
                    </NonTransparent>
                </div>
            </div>
            <ActiveBoardSelectorModal
                visible={activeBoardSelectorModalVisibility}
                onComplete={() => setActiveBoardSelectorModalVisibility(false)}
            />
        </div>
    );
};
