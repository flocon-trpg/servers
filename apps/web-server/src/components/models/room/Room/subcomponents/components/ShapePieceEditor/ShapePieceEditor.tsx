import { State, path, shape, shapePieceTemplate, simpleId } from '@flocon-trpg/core';
import React from 'react';
import { useMemoOne } from 'use-memo-one';
import { z } from 'zod';
import { useCloneImagePiece } from '../../hooks/useCloneImagePiece';
import { usePixelRectToCompositeRect } from '../../hooks/usePixelRectToCompositeRect';
import { useShapePieces } from '../../hooks/useShapePieces';
import { CreateModeParams, UpdateModeParams, useStateEditor } from '../../hooks/useStateEditor';
import {
    CompositeRect,
    PixelPosition,
    PixelSize,
    applyCompositeRect,
} from '../../utils/positionAndSizeAndRect';
import { PieceEditorCloneButtonRow } from '../PieceEditorCloneButtonRow/PieceEditorCloneButtonRow';
import { PieceEditorIdRow } from '../PieceEditorIdRow/PieceEditorIdRow';
import { PieceEditorMemoRow } from '../PieceEditorMemoRow/PieceEditorMemoRow';
import { PieceEditorNameRow } from '../PieceEditorNameRow/PieceEditorNameRow';
import { PieceRectEditor } from '../RectEditor/RectEditor';
import { useSetRoomStateWithImmer } from '@/components/models/room/Room/subcomponents/hooks/useSetRoomStateWithImmer';
import { ColorPickerButton } from '@/components/ui/ColorPickerButton/ColorPickerButton';
import { Table, TableDivider, TableRow } from '@/components/ui/Table/Table';
import { useMyUserUid } from '@/hooks/useMyUserUid';
import { rgb } from '@/utils/rgb';

type Shape = z.TypeOf<typeof shape>;
type ShapePieceState = State<typeof shapePieceTemplate>;

const shapeKey = '1';

const defaultShape: Shape = {
    type: path,
    data: 'M 0 0 H 100 V 100 H 0 Z',
};

const defaultShapePiece = (
    piecePosition: CompositeRect,
    isCellMode: boolean,
    ownerParticipantId: string | undefined,
): ShapePieceState => ({
    ...piecePosition,

    ownerParticipantId,
    isCellMode,

    shapes: {},
    isPrivate: false,
    memo: undefined,
    name: undefined,
    opacity: undefined,
    isPositionLocked: false,

    $v: 1,
    $r: 1,
});

const pieceSize: PixelSize = { w: 50, h: 50 };

export type CreateMode = {
    boardId: string;
    piecePosition: PixelPosition;
};

export type UpdateMode = {
    boardId: string;
    pieceId: string;
};

export const useShapePieceEditor = ({
    createMode,
    updateMode,
}: {
    createMode?: CreateMode;
    updateMode?: UpdateMode;
}) => {
    const setRoomState = useSetRoomStateWithImmer();
    const myUserUid = useMyUserUid();
    const boardId = updateMode?.boardId ?? createMode?.boardId;
    const shapePieces = useShapePieces(boardId);
    const clone = useCloneImagePiece();
    const compositeRect = usePixelRectToCompositeRect({
        boardId: updateMode?.boardId ?? createMode?.boardId,
        pixelRect:
            createMode?.piecePosition == null
                ? undefined
                : { ...createMode.piecePosition, ...pieceSize },
    });
    const createModeParams: CreateModeParams<ShapePieceState | undefined> | undefined =
        useMemoOne(() => {
            if (createMode == null || myUserUid == null || compositeRect == null) {
                return undefined;
            }
            return {
                createInitState: () => defaultShapePiece(compositeRect, true, undefined),
                updateInitState: prevState => {
                    if (prevState == null) {
                        return;
                    }
                    applyCompositeRect({
                        state: prevState,
                        operation: compositeRect,
                    });
                },
                onCreate: newState => {
                    if (newState == null) {
                        return;
                    }
                    const id = simpleId();
                    setRoomState(roomState => {
                        const board = roomState.boards?.[createMode.boardId];
                        if (board == null) {
                            return;
                        }
                        if (board.shapePieces == null) {
                            board.shapePieces = {};
                        }
                        board.shapePieces[id] = { ...newState, ownerParticipantId: myUserUid };
                    });
                },
            };
        }, [compositeRect, createMode, myUserUid, setRoomState]);
    const updateModeParams: UpdateModeParams<ShapePieceState | undefined> | undefined =
        useMemoOne(() => {
            if (updateMode == null) {
                return undefined;
            }
            return {
                state: shapePieces?.get(updateMode.pieceId),
                onUpdate: newState => {
                    if (myUserUid == null) {
                        return;
                    }
                    const boardId = updateMode.boardId;
                    const pieceId = updateMode.pieceId;
                    setRoomState(roomState => {
                        const shapePieces = roomState.boards?.[boardId]?.shapePieces;
                        if (shapePieces == null) {
                            return;
                        }
                        shapePieces[pieceId] = newState;
                    });
                },
            };
        }, [shapePieces, myUserUid, setRoomState, updateMode]);
    const { state, updateState, ok } = useStateEditor({
        createMode: createModeParams,
        updateMode: updateModeParams,
    });

    const labelStyle: React.CSSProperties = React.useMemo(() => ({ minWidth: 100 }), []);

    let element: JSX.Element | null;
    if (myUserUid == null || state == null || boardId == null) {
        element = null;
    } else {
        element = (
            <>
                <Table labelStyle={labelStyle}>
                    {/* TODO: isPrivateがまだ未実装 */}

                    <TableRow label="色">
                        <ColorPickerButton
                            trigger="click"
                            color={state.shapes?.[shapeKey]?.fill}
                            buttonContent={state.shapes?.[shapeKey]?.fill ?? '(未指定)'}
                            onChange={e =>
                                updateState(pieceValue => {
                                    if (pieceValue == null) {
                                        return;
                                    }
                                    if (pieceValue.shapes == null) {
                                        pieceValue.shapes = {};
                                    }
                                    const newColor = rgb(e.rgb);
                                    const targetShape = pieceValue.shapes[shapeKey];
                                    if (targetShape == null) {
                                        pieceValue.shapes[shapeKey] = {
                                            $v: 1,
                                            $r: 1,
                                            shape: { ...defaultShape },
                                            fill: newColor,
                                            stroke: undefined,
                                            strokeWidth: undefined,
                                        };
                                    } else {
                                        targetShape.fill = newColor;
                                    }
                                })
                            }
                        />
                    </TableRow>

                    <TableDivider />

                    <PieceEditorNameRow
                        state={state.name}
                        onChange={newValue =>
                            updateState(pieceValue => {
                                if (pieceValue == null) {
                                    return;
                                }
                                pieceValue.name = newValue;
                            })
                        }
                    />

                    <PieceEditorMemoRow
                        state={state.memo}
                        onChange={newValue =>
                            updateState(pieceValue => {
                                if (pieceValue == null) {
                                    return;
                                }
                                pieceValue.memo = newValue;
                            })
                        }
                    />

                    <TableDivider />

                    <PieceRectEditor
                        value={state}
                        onChange={newState => updateState(() => newState)}
                        boardId={boardId}
                    />

                    <TableDivider />

                    {updateMode == null ? null : (
                        <>
                            <PieceEditorCloneButtonRow
                                onClick={() => {
                                    clone({
                                        boardId: updateMode.boardId,
                                        pieceId: updateMode.pieceId,
                                    });
                                }}
                            />
                            <TableDivider />
                        </>
                    )}

                    <PieceEditorIdRow pieceId={updateMode?.pieceId} />
                </Table>
            </>
        );
    }

    return React.useMemo(() => ({ element, ok }), [element, ok]);
};
