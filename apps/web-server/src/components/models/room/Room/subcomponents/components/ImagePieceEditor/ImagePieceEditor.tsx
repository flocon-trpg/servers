import { State, imagePieceTemplate, simpleId } from '@flocon-trpg/core';
import React from 'react';
import { useMemoOne } from 'use-memo-one';
import { useCloneImagePiece } from '../../hooks/useCloneImagePiece';
import { useImagePieces } from '../../hooks/useImagePieces';
import { usePixelRectToCompositeRect } from '../../hooks/usePixelRectToCompositeRect';
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
import { FileView } from '@/components/models/file/FileView/FileView';
import { useSetRoomStateWithImmer } from '@/components/models/room/Room/subcomponents/hooks/useSetRoomStateWithImmer';
import { Table, TableDivider, TableRow } from '@/components/ui/Table/Table';
import { useMyUserUid } from '@/hooks/useMyUserUid';
import { FilePathModule } from '@/utils/file/filePath';
import { image } from '@/utils/fileType';

type ImagePieceState = State<typeof imagePieceTemplate>;

const defaultImagePiece = (
    piecePosition: CompositeRect,
    isCellMode: boolean,
    ownerParticipantId: string | undefined,
): ImagePieceState => ({
    ...piecePosition,

    ownerParticipantId,
    isCellMode,

    image: undefined,
    isPrivate: false,
    memo: undefined,
    name: undefined,
    opacity: undefined,
    isPositionLocked: false,

    $v: 2,
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

export const useImagePieceEditor = ({
    createMode,
    updateMode,
}: {
    createMode?: CreateMode;
    updateMode?: UpdateMode;
}) => {
    const setRoomState = useSetRoomStateWithImmer();
    const myUserUid = useMyUserUid();
    const boardId = updateMode?.boardId ?? createMode?.boardId;
    const imagePieces = useImagePieces(boardId);
    const clone = useCloneImagePiece();
    const compositeRect = usePixelRectToCompositeRect({
        boardId: updateMode?.boardId ?? createMode?.boardId,
        pixelRect:
            createMode?.piecePosition == null
                ? undefined
                : { ...createMode.piecePosition, ...pieceSize },
    });
    const createModeParams: CreateModeParams<ImagePieceState | undefined> | undefined =
        useMemoOne(() => {
            if (createMode == null || myUserUid == null || compositeRect == null) {
                return undefined;
            }
            return {
                createInitState: () => defaultImagePiece(compositeRect, true, undefined),
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
                        const imagePieces = roomState.boards?.[createMode.boardId]?.imagePieces;
                        if (imagePieces == null) {
                            return;
                        }
                        imagePieces[id] = { ...newState, ownerParticipantId: myUserUid };
                    });
                },
            };
        }, [compositeRect, createMode, myUserUid, setRoomState]);
    const updateModeParams: UpdateModeParams<ImagePieceState | undefined> | undefined =
        useMemoOne(() => {
            if (updateMode == null) {
                return undefined;
            }
            return {
                state: imagePieces?.get(updateMode.pieceId),
                onUpdate: newState => {
                    if (myUserUid == null) {
                        return;
                    }
                    const boardId = updateMode.boardId;
                    const pieceId = updateMode.pieceId;
                    setRoomState(roomState => {
                        const board = roomState.boards?.[boardId];
                        if (board == null) {
                            return;
                        }
                        if (board.imagePieces == null) {
                            board.imagePieces = {};
                        }
                        board.imagePieces[pieceId] = newState;
                    });
                },
            };
        }, [imagePieces, myUserUid, setRoomState, updateMode]);
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

                    <TableRow label="画像">
                        <FileView
                            style={{ maxWidth: 350 }}
                            maxWidthOfLink={null}
                            uploaderFileBrowserHeight={null}
                            defaultFileTypeFilter={image}
                            filePath={state.image ?? undefined}
                            onPathChange={path =>
                                updateState(pieceValue => {
                                    if (pieceValue == null) {
                                        return;
                                    }
                                    pieceValue.image =
                                        path == null ? undefined : FilePathModule.toOtState(path);
                                })
                            }
                            showImage
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
