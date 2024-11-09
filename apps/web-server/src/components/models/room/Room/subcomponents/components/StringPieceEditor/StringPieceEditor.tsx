import { State, String, characterTemplate, simpleId, stringPieceTemplate } from '@flocon-trpg/core';
import { Checkbox } from 'antd';
import React from 'react';
import { useMemoOne } from 'use-memo-one';
import { usePixelRectToCompositeRect } from '../../hooks/usePixelRectToCompositeRect';
import { CreateModeParams, UpdateModeParams, useStateEditor } from '../../hooks/useStateEditor';
import { useStringPieces } from '../../hooks/useStringPieces';
import {
    CompositeRect,
    PixelPosition,
    PixelSize,
    applyCompositeRect,
} from '../../utils/positionAndSizeAndRect';
import { MyCharactersSelect } from '../MyCharactersSelect/MyCharactersSelect';
import { PieceEditorIdRow } from '../PieceEditorIdRow/PieceEditorIdRow';
import { PieceEditorMemoRow } from '../PieceEditorMemoRow/PieceEditorMemoRow';
import { PieceEditorNameRow } from '../PieceEditorNameRow/PieceEditorNameRow';
import { PieceRectEditor } from '../RectEditor/RectEditor';
import { useSetRoomStateWithImmer } from '@/components/models/room/Room/subcomponents/hooks/useSetRoomStateWithImmer';
import { CollaborativeInput } from '@/components/ui/CollaborativeInput/CollaborativeInput';
import { Table, TableDivider, TableRow } from '@/components/ui/Table/Table';
import { useMyUserUid } from '@/hooks/useMyUserUid';

type CharacterState = State<typeof characterTemplate>;
type StringPieceState = State<typeof stringPieceTemplate>;

const pieceSize: PixelSize = { w: 50, h: 50 };

const defaultStringPieceValue = (
    piecePosition: CompositeRect,
    isCellMode: boolean,
    ownerCharacterId: string | undefined,
): StringPieceState => ({
    ...piecePosition,

    ownerCharacterId,
    isCellMode,

    value: '',
    isValuePrivate: false,
    valueInputType: String,
    memo: undefined,
    name: undefined,
    opacity: undefined,
    isPositionLocked: false,

    $v: 2,
    $r: 1,
});

export type CreateMode = {
    boardId: string;
    piecePosition: PixelPosition;
};

export type UpdateMode = {
    boardId: string;
    pieceId: string;
};

export const useStringPieceEditor = ({
    createMode,
    updateMode,
}: {
    createMode?: CreateMode;
    updateMode?: UpdateMode;
}) => {
    const setRoomState = useSetRoomStateWithImmer();
    const myUserUid = useMyUserUid();
    const boardId = updateMode?.boardId ?? createMode?.boardId;
    const stringPieces = useStringPieces(boardId);
    const [activeCharacter, setActiveCharacter] = React.useState<{
        id: string;
        state: CharacterState;
    }>();
    const compositeRect = usePixelRectToCompositeRect({
        boardId: updateMode?.boardId ?? createMode?.boardId,
        pixelRect:
            createMode?.piecePosition == null
                ? undefined
                : { ...createMode.piecePosition, ...pieceSize },
    });
    const createModeParams: CreateModeParams<StringPieceState | undefined> | undefined =
        useMemoOne(() => {
            if (createMode == null || compositeRect == null) {
                return undefined;
            }
            return {
                createInitState: () => defaultStringPieceValue(compositeRect, true, undefined),
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
                    if (newState == null || activeCharacter == null) {
                        return;
                    }
                    const id = simpleId();
                    setRoomState(roomState => {
                        const stringPieces = roomState.boards?.[createMode.boardId]?.stringPieces;
                        if (stringPieces == null) {
                            return;
                        }
                        stringPieces[id] = { ...newState, ownerCharacterId: activeCharacter.id };
                    });
                },
            };
        }, [activeCharacter, compositeRect, createMode, setRoomState]);
    const updateModeParams: UpdateModeParams<StringPieceState | undefined> | undefined =
        useMemoOne(() => {
            if (updateMode == null) {
                return undefined;
            }
            return {
                state: stringPieces?.get(updateMode.pieceId),
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
                        if (board.stringPieces == null) {
                            board.stringPieces = {};
                        }
                        board.stringPieces[pieceId] = newState;
                    });
                },
            };
        }, [myUserUid, setRoomState, stringPieces, updateMode]);
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
            <Table labelStyle={labelStyle}>
                <TableRow label="値">
                    <CollaborativeInput
                        bufferDuration="default"
                        size="small"
                        value={state.value}
                        onChange={currentValue => {
                            updateState(state => {
                                if (state == null) {
                                    return;
                                }
                                state.value = currentValue;
                            });
                        }}
                    />
                </TableRow>

                <TableRow label="値を非公開にする">
                    <Checkbox
                        checked={state.isValuePrivate}
                        onChange={e =>
                            updateState(state => {
                                if (state == null) {
                                    return;
                                }
                                state.isValuePrivate = e.target.checked;
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

                <PieceEditorIdRow pieceId={updateMode?.pieceId} />

                <TableRow label="所有者">
                    <MyCharactersSelect
                        selectedCharacterId={
                            updateMode != null ? state.ownerCharacterId : activeCharacter?.id
                        }
                        readOnly={createMode == null}
                        onSelect={setActiveCharacter}
                        showAlert
                    />
                </TableRow>
            </Table>
        );
    }

    const canOk = activeCharacter != null;
    return React.useMemo(() => ({ element, ok, canOk }), [canOk, element, ok]);
};
