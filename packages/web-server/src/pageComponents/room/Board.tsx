/** @jsxImportSource @emotion/react */
import React from 'react';
import { success, useImageFromGraphQL } from '../../hooks/image';
import * as ReactKonva from 'react-konva';
import { Button, Dropdown, InputNumber, Menu, Popover } from 'antd';
import * as Icons from '@ant-design/icons';
import { KonvaEventObject } from 'konva/types/Node';
import { update } from '../../stateManagers/states/types';
import * as Icon from '@ant-design/icons';
import { Message, publicMessage, useFilteredRoomMessages } from '../../hooks/useRoomMessages';
import { useSetRoomStateByApply } from '../../hooks/useSetRoomStateByApply';
import { useMe } from '../../hooks/useMe';
import { useCharacters } from '../../hooks/state/useCharacters';
import { useParticipants } from '../../hooks/state/useParticipants';
import { Piece } from '../../utils/piece';
import { useBoards } from '../../hooks/state/useBoards';
import { BoardLocation } from '../../utils/boardLocation';
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
    $free,
} from '@flocon-trpg/core';
import {
    CompositeKey,
    compositeKeyEquals,
    dualKeyRecordToDualKeyMap,
    keyNames,
} from '@flocon-trpg/utils';
import { useMyUserUid } from '../../hooks/useMyUserUid';
import { FilePath, FileSourceType } from '@flocon-trpg/typed-document-node';
import { ImagePiece } from '../../components/Konva/ImagePiece';
import { DragEndResult, Vector2 } from '../../utils/types';
import {
    DiceOrNumberPiece,
    dicePiece,
    stringPiece,
} from '../../components/Konva/DiceOrNumberPiece';
import { useTransition, animated } from '@react-spring/konva';
import { useCharacterPieces } from '../../hooks/state/useCharacterPieces';
import { useTachieLocations } from '../../hooks/state/useTachieLocations';
import { characterUpdateOperation } from '../../utils/characterUpdateOperation';
import { useDicePieces } from '../../hooks/state/useDicePieces';
import { useStringPieces } from '../../hooks/state/useStringPieces';
import { useImagePieces } from '../../hooks/state/useImagePieces';
import { useAllContext } from '../../hooks/useAllContext';
import { AllContextProvider } from '../../components/AllContextProvider';
import { range } from '../../utils/range';
import classNames from 'classnames';
import { cancelRnd, flex, flexColumn, flexRow, itemsCenter } from '../../utils/className';
import { SketchPicker } from 'react-color';
import { css } from '@emotion/react';
import { rgba } from '../../utils/rgba';
import { roomConfigAtom } from '../../atoms/roomConfig/roomConfigAtom';
import { roomAtom } from '../../atoms/room/roomAtom';
import { useAtomSelector } from '../../atoms/useAtomSelector';
import { BoardConfig, defaultBoardConfig } from '../../atoms/roomConfig/types/boardConfig';
import { RoomConfigUtils } from '../../atoms/roomConfig/types/roomConfig/utils';
import { ActiveBoardPanelConfig } from '../../atoms/roomConfig/types/activeBoardPanelConfig';
import { BoardEditorPanelConfig } from '../../atoms/roomConfig/types/boardEditorPanelConfig';
import { useImmerUpdateAtom } from '../../atoms/useImmerUpdateAtom';
import { boardTooltipAtom, BoardTooltipState } from '../../atoms/overlay/board/boardTooltipAtom';
import {
    boardPopoverEditorAtom,
    BoardPopoverEditorState,
} from '../../atoms/overlay/board/boardPopoverEditorAtom';
import { MouseOverOn } from '../../atoms/overlay/board/types';
import { useUpdateAtom } from 'jotai/utils';
import { boardContextMenuAtom } from '../../atoms/overlay/board/boardContextMenuAtom';
import { boardEditorDrawerAtom } from '../../atoms/overlay/boardDrawerAtom';
import { create } from '../../utils/constants';

const createPiecePostOperation = ({
    e,
    piece,
    board,
}: {
    e: DragEndResult;
    piece: PieceState;
    board: BoardState;
}): PieceUpOperation => {
    const pieceOperation: PieceUpOperation = { $v: 1, $r: 1 };
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
    const pieceOperation: BoardLocationUpOperation = { $v: 1, $r: 1 };
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
          pieceBoardKey: CompositeKey;
      }
    | {
          type: typeof tachie;
          characterKey: CompositeKey;
          tachieLocationKey: CompositeKey;
      }
    | {
          type: typeof dicePieceValue | typeof numberPieceValue;
          characterKey: CompositeKey;
          stateId: string;
          pieceBoardKey: CompositeKey;
      }
    | {
          type: typeof imagePiece;
          participantKey: string;
          valueId: string;
          pieceBoardKey: CompositeKey;
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

    const roomId = useAtomSelector(roomAtom, state => state.roomId);
    const characters = useCharacters();
    const participants = useParticipants();
    const dicePieces = useDicePieces(boardKey);
    const numberPieces = useStringPieces(boardKey);
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
        onTooltipRef.current({
            pageX: stoppedCursor.x,
            pageY: stoppedCursor.y,
            mouseOverOn: mouseOverOnRef.current,
        });
    }, [stoppedCursor, onTooltipRef]);
    const [selectedPieceKey, setSelectedPieceKey] = React.useState<SelectedPieceKey>();
    const [isBackgroundDragging, setIsBackgroundDragging] = React.useState(false); // これがないと、pieceをドラッグでリサイズする際に背景が少し動いてしまう。
    const backgroundImage = useImageFromGraphQL(board.backgroundImage);
    const backgroundImageResult =
        backgroundImage.type === success ? backgroundImage.image : undefined;
    const setRoomConfig = useImmerUpdateAtom(roomConfigAtom);
    const operate = useSetRoomStateByApply();
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
        // 本来はグリッドを縦横無限に表示するのが理想だが、実装簡略化のためとりあえず200本ずつだけ表示している。

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
                            compositeKeyEquals(selectedPieceKey.pieceBoardKey, pieceKey)
                        }
                        onClick={() => {
                            unsetPopoverEditor();
                            setSelectedPieceKey({
                                type: 'character',
                                characterKey,
                                pieceBoardKey: pieceKey,
                            });
                        }}
                        onDblClick={e => {
                            if (onPopoverEditorRef.current == null) {
                                return;
                            }
                            onPopoverEditorRef.current({
                                pageX: e.evt.pageX,
                                pageY: e.evt.pageY,
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
                                    $r: 2,
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
                                pageX: e.evt.pageX,
                                pageY: e.evt.pageY,
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
                                    $r: 2,
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
            ({ value: element, pieceBoardKey, piece }) => {
                const defaultImageFilePath: FilePath = {
                    // TODO: 適切な画像に変える
                    path: '/logo.png',
                    sourceType: FileSourceType.Default,
                };
                return (
                    <ImagePiece
                        {...Piece.getPosition({ ...board, state: piece })}
                        opacity={1}
                        key={keyNames(element.participantKey, element.valueId, pieceBoardKey)}
                        filePath={element.value.image ?? defaultImageFilePath}
                        draggable
                        listening
                        isSelected={
                            selectedPieceKey?.type === 'imagePiece' &&
                            selectedPieceKey.valueId === element.valueId &&
                            compositeKeyEquals(selectedPieceKey.pieceBoardKey, pieceBoardKey)
                        }
                        onClick={() => {
                            unsetPopoverEditor();
                            setSelectedPieceKey({
                                type: 'imagePiece',
                                pieceBoardKey: pieceBoardKey,
                                valueId: element.valueId,
                                participantKey: element.participantKey,
                            });
                        }}
                        onDblClick={e => {
                            if (onPopoverEditorRef.current == null) {
                                return;
                            }
                            onPopoverEditorRef.current({
                                pageX: e.evt.pageX,
                                pageY: e.evt.pageY,
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
                                $r: 2,
                                participants: {
                                    [element.participantKey]: {
                                        type: update,
                                        update: {
                                            $v: 1,
                                            $r: 2,
                                            imagePieceValues: {
                                                [element.valueId]: {
                                                    type: update,
                                                    update: {
                                                        $v: 1,
                                                        $r: 1,
                                                        pieces: {
                                                            [pieceBoardKey.createdBy]: {
                                                                [pieceBoardKey.id]: {
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

        const dicePieceElements = (dicePieces ?? []).map(
            ({ value: element, pieceBoardKey, piece }) => {
                return (
                    <DiceOrNumberPiece
                        {...Piece.getPosition({ ...board, state: piece })}
                        key={keyNames(element.characterKey, element.valueId, pieceBoardKey)}
                        opacity={1}
                        state={{ type: dicePiece, state: element.value }}
                        createdByMe={element.characterKey.createdBy === myUserUid}
                        draggable
                        listening
                        isSelected={
                            selectedPieceKey?.type === 'dicePieceValue' &&
                            selectedPieceKey.stateId === element.valueId &&
                            compositeKeyEquals(selectedPieceKey.pieceBoardKey, pieceBoardKey)
                        }
                        onClick={() => {
                            unsetPopoverEditor();
                            setSelectedPieceKey({
                                type: 'dicePieceValue',
                                characterKey: element.characterKey,
                                stateId: element.valueId,
                                pieceBoardKey: pieceBoardKey,
                            });
                        }}
                        onDblClick={e => {
                            if (onPopoverEditorRef.current == null) {
                                return;
                            }
                            onPopoverEditorRef.current({
                                pageX: e.evt.pageX,
                                pageY: e.evt.pageY,
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
                                    $r: 2,
                                    dicePieceValues: {
                                        [element.valueId]: {
                                            type: update,
                                            update: {
                                                $v: 1,
                                                $r: 1,
                                                pieces: {
                                                    [pieceBoardKey.createdBy]: {
                                                        [pieceBoardKey.id]: {
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

        const numberPieceElements = (numberPieces ?? []).map(
            ({ value: element, piece, pieceBoardKey }) => {
                return (
                    <DiceOrNumberPiece
                        {...Piece.getPosition({ ...board, state: piece })}
                        key={keyNames(element.characterKey, element.valueId, pieceBoardKey)}
                        opacity={1}
                        state={{ type: stringPiece, state: element.value }}
                        createdByMe={element.characterKey.createdBy === myUserUid}
                        draggable
                        listening
                        isSelected={
                            selectedPieceKey?.type === 'numberPieceValue' &&
                            selectedPieceKey.stateId === element.valueId &&
                            compositeKeyEquals(selectedPieceKey.pieceBoardKey, pieceBoardKey)
                        }
                        onClick={() => {
                            unsetPopoverEditor();
                            setSelectedPieceKey({
                                type: 'numberPieceValue',
                                characterKey: element.characterKey,
                                stateId: element.valueId,
                                pieceBoardKey: pieceBoardKey,
                            });
                        }}
                        onDblClick={e => {
                            if (onPopoverEditorRef.current == null) {
                                return;
                            }
                            onPopoverEditorRef.current({
                                pageX: e.evt.pageX,
                                pageY: e.evt.pageY,
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
                                    $r: 2,
                                    stringPieceValues: {
                                        [element.valueId]: {
                                            type: update,
                                            update: {
                                                $v: 1,
                                                $r: 1,
                                                pieces: {
                                                    [pieceBoardKey.createdBy]: {
                                                        [pieceBoardKey.id]: {
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
                setRoomConfig(roomConfig => {
                    if (roomConfig == null) {
                        return;
                    }
                    RoomConfigUtils.zoomBoard(roomConfig, {
                        roomId,
                        boardKey,
                        boardEditorPanelId: boardEditorPanelId,
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
                            if (boardEditorPanelId == null) {
                                const boardPanel = roomConfig.panels.activeBoardPanel;
                                if (boardPanel == null) {
                                    return;
                                }
                                boardPanel.board.offsetX -= e.evt.movementX / nonZeroScale;
                                boardPanel.board.offsetY -= e.evt.movementY / nonZeroScale;
                                return;
                            }
                            const board =
                                roomConfig.panels.boardEditorPanels[boardEditorPanelId]?.boards?.[
                                    keyNames(boardKey)
                                ];
                            if (board == null) {
                                return;
                            }
                            board.offsetX -= e.evt.movementX / nonZeroScale;
                            board.offsetY -= e.evt.movementY / nonZeroScale;
                        });
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
    const setRoomConfig = useImmerUpdateAtom(roomConfigAtom);
    const setBoardContextMenu = useUpdateAtom(boardContextMenuAtom);
    const setBoardTooltip = useUpdateAtom(boardTooltipAtom);
    const setBoardPopoverEditor = useUpdateAtom(boardPopoverEditorAtom);
    const setBoardEditorDrawer = useUpdateAtom(boardEditorDrawerAtom);
    const roomId = useAtomSelector(roomAtom, state => state.roomId);
    const boards = useBoards();
    const characters = useCharacters();
    const myUserUid = useMyUserUid();
    const me = useMe();
    const activeBoardKey = useAtomSelector(
        roomAtom,
        state => state.roomState?.state?.activeBoardKey
    );
    const activeBoardPanelConfig = useAtomSelector(
        roomConfigAtom,
        state => state?.panels.activeBoardPanel
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
    const stringPieceValues = useStringPieces(boardKeyToShow ?? false);
    const imagePieces = useImagePieces(boardKeyToShow ?? false);

    if (
        me == null ||
        myUserUid == null ||
        roomId == null ||
        boards == null ||
        characters == null ||
        stringPieceValues == null
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
                <div style={{ padding: 20 }}>
                    {`${
                        panel.type === 'activeBoard' ? 'ボードビュアー' : 'ボードエディター'
                    }に表示するボードが指定されていません。`}
                </div>
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
                onClick={() => setBoardContextMenu(null)}
                onTooltip={newValue => setBoardTooltip(newValue)}
                onPopupEditor={newValue => setBoardPopoverEditor(newValue)}
                onContextMenu={(e, stateOffset) => {
                    e.evt.preventDefault();
                    setBoardContextMenu({
                        boardKey: boardKeyToShow,
                        boardConfig,
                        offsetX: e.evt.offsetX,
                        offsetY: e.evt.offsetY,
                        pageX: e.evt.pageX,
                        pageY: e.evt.pageY,
                        characterPiecesOnCursor: characters
                            .toArray()
                            .flatMap(([characterKey, character]) => {
                                return dualKeyRecordToDualKeyMap<PieceState>(character.pieces)
                                    .toArray()
                                    .filter(([, piece]) => {
                                        if (!compositeKeyEquals(boardKeyToShow, piece.boardKey)) {
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
                                        if (!compositeKeyEquals(boardKeyToShow, tachie.boardKey)) {
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
                        stringPieceValuesOnCursor: (stringPieceValues ?? [])
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
                                stringPieceValueKey: element.valueId,
                                stringPieceValue: element.value,
                                piece,
                                characterKey: {
                                    createdBy: element.characterKey.createdBy,
                                    id: element.characterKey.id,
                                },
                            })),
                    });
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
                              setRoomConfig(roomConfig => {
                                  if (roomConfig == null) {
                                      return;
                                  }
                                  const boardEditorPanel =
                                      roomConfig.panels.boardEditorPanels[boardEditorPanelId];
                                  if (boardEditorPanel == null) {
                                      return;
                                  }
                                  boardEditorPanel.activeBoardKey = key.id;
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
                        setBoardEditorDrawer({
                            type: create,
                            boardEditorPanelId,
                        })
                    }
                >
                    新規作成
                </Menu.Item>
            </Menu>
        );

    const noActiveBoardText = '';
    const titleStyle: React.CSSProperties = { maxWidth: 40, minWidth: 40 };

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
                        setBoardEditorDrawer({
                            type: update,
                            stateKey: boardKeyToShow,
                        });
                    }}
                >
                    編集
                </Button>
            </div>
            <div style={zoomButtonStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div className={classNames(flex, flexRow)}>
                        <Button
                            onClick={() => {
                                if (boardKeyToShow == null) {
                                    return;
                                }
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    RoomConfigUtils.editBoard(
                                        roomConfig,
                                        boardKeyToShow,
                                        boardEditorPanelId,
                                        boardConfig => {
                                            boardConfig.showGrid = !boardConfig.showGrid;
                                        }
                                    );
                                });
                            }}
                        >
                            グリッドの表示/非表示
                        </Button>
                        <Popover
                            trigger='click'
                            content={
                                <div className={classNames(cancelRnd, flex, flexColumn)}>
                                    <div style={{ paddingBottom: 8 }}>グリッドの設定</div>
                                    <div className={classNames(flex, flexRow, itemsCenter)}>
                                        <div style={titleStyle}>太さ</div>
                                        <InputNumber
                                            value={boardConfig.gridLineTension}
                                            onChange={e => {
                                                if (boardKeyToShow == null) {
                                                    return;
                                                }
                                                setRoomConfig(roomConfig => {
                                                    if (roomConfig == null) {
                                                        return;
                                                    }
                                                    RoomConfigUtils.editBoard(
                                                        roomConfig,
                                                        boardKeyToShow,
                                                        boardEditorPanelId,
                                                        boardConfig => {
                                                            boardConfig.gridLineTension = e;
                                                        }
                                                    );
                                                });
                                            }}
                                        />
                                    </div>
                                    <div className={classNames(flex, flexRow, itemsCenter)}>
                                        <div style={titleStyle}>色</div>
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
                                                        if (boardKeyToShow == null) {
                                                            return;
                                                        }
                                                        setRoomConfig(roomConfig => {
                                                            if (roomConfig == null) {
                                                                return;
                                                            }
                                                            RoomConfigUtils.editBoard(
                                                                roomConfig,
                                                                boardKeyToShow,
                                                                boardEditorPanelId,
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
                                            <Button>{boardConfig.gridLineColor}</Button>
                                        </Popover>
                                    </div>
                                </div>
                            }
                        >
                            <Button>
                                <Icons.EllipsisOutlined />
                            </Button>
                        </Popover>
                    </div>
                    <div style={{ height: 18 }} />
                    <Button
                        onClick={() => {
                            if (boardKeyToShow == null) {
                                return;
                            }
                            setRoomConfig(roomConfig => {
                                if (roomConfig == null) {
                                    return;
                                }
                                RoomConfigUtils.zoomBoard(roomConfig, {
                                    roomId,
                                    boardKey: boardKeyToShow,
                                    boardEditorPanelId,
                                    zoomDelta: 0.25,
                                    prevCanvasWidth: canvasWidth,
                                    prevCanvasHeight: canvasHeight,
                                });
                            });
                        }}
                    >
                        <Icon.ZoomInOutlined />
                    </Button>
                    <Button
                        onClick={() => {
                            if (boardKeyToShow == null) {
                                return;
                            }
                            setRoomConfig(roomConfig => {
                                if (roomConfig == null) {
                                    return;
                                }
                                RoomConfigUtils.zoomBoard(roomConfig, {
                                    roomId,
                                    boardKey: boardKeyToShow,
                                    boardEditorPanelId,
                                    zoomDelta: -0.25,
                                    prevCanvasWidth: canvasWidth,
                                    prevCanvasHeight: canvasHeight,
                                });
                            });
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
                            setRoomConfig(roomConfig => {
                                if (roomConfig == null) {
                                    return;
                                }
                                RoomConfigUtils.editBoard(
                                    roomConfig,
                                    boardKeyToShow,
                                    boardEditorPanelId,
                                    () => {
                                        return defaultBoardConfig();
                                    }
                                );
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
