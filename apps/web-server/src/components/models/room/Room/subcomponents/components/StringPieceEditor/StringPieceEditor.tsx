import React from 'react';
import { Checkbox } from 'antd';
import { CreateModeParams, UpdateModeParams, useStateEditor } from '../../hooks/useStateEditor';
import { State, String, characterTemplate, simpleId, stringPieceTemplate } from '@flocon-trpg/core';
import { useMyUserUid } from '@/hooks/useMyUserUid';
import { close, ok } from '@/utils/constants';
import { useSetRoomStateWithImmer } from '@/hooks/useSetRoomStateWithImmer';
import { CollaborativeInput } from '@/components/ui/CollaborativeInput/CollaborativeInput';
import { Subscribable } from 'rxjs';
import { useStringPieces } from '../../hooks/useStringPieces';
import { MyCharactersSelect } from '../MyCharactersSelect/MyCharactersSelect';
import {
    CompositeRect,
    PixelPosition,
    PixelSize,
    applyCompositeRect,
} from '../../utils/positionAndSizeAndRect';
import { usePixelRectToCompositeRect } from '../../hooks/usePixelRectToCompositeRect';
import { PieceRectEditor } from '../RectEditor/RectEditor';
import { useMemoOne } from 'use-memo-one';
import { Table, TableRow } from '@/components/ui/Table/Table';

type CharacterState = State<typeof characterTemplate>;
type StringPieceState = State<typeof stringPieceTemplate>;

type ActionRequest = Subscribable<typeof ok | typeof close>;

const pieceSize: PixelSize = { w: 50, h: 50 };

const defaultStringPieceValue = (
    piecePosition: CompositeRect,
    isCellMode: boolean,
    ownerCharacterId: string | undefined
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

export const StringPieceEditor: React.FC<{
    actionRequest?: ActionRequest;
    createMode?: CreateMode;
    updateMode?: UpdateMode;
}> = ({ actionRequest, createMode, updateMode }) => {
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
                updateWithImmer: newState => {
                    if (myUserUid == null) {
                        return;
                    }
                    const boardId = updateMode.boardId;
                    const pieceId = updateMode.pieceId;
                    setRoomState(roomState => {
                        const stringPieces = roomState.boards?.[boardId]?.stringPieces;
                        if (stringPieces == null) {
                            return;
                        }
                        stringPieces[pieceId] = newState;
                    });
                },
            };
        }, [myUserUid, setRoomState, stringPieces, updateMode]);
    const { state, updateState, ok } = useStateEditor({
        createMode: createModeParams,
        updateMode: updateModeParams,
    });
    React.useEffect(() => {
        if (actionRequest == null) {
            return;
        }
        const subscription = actionRequest.subscribe({
            next: value => {
                switch (value) {
                    case 'ok':
                        ok();
                        break;
                }
            },
        });
        return () => subscription.unsubscribe();
    }, [actionRequest, ok]);

    if (myUserUid == null || state == null || boardId == null) {
        return null;
    }

    return (
        <Table>
            <TableRow label='ID'>{updateMode != null ? updateMode.pieceId : '(なし)'}</TableRow>
            <PieceRectEditor
                value={state}
                onChange={newState => updateState(() => newState)}
                boardId={boardId}
            />
            <TableRow label='所有者'>
                <MyCharactersSelect
                    selectedCharacterId={
                        updateMode != null ? state.ownerCharacterId : activeCharacter?.id
                    }
                    readOnly={createMode == null}
                    onSelect={setActiveCharacter}
                />
            </TableRow>
            <TableRow label='名前'>
                <CollaborativeInput
                    bufferDuration='default'
                    size='small'
                    value={state.name ?? ''}
                    onChange={e => {
                        if (e.previousValue === e.currentValue) {
                            return;
                        }
                        updateState(pieceValue => {
                            if (pieceValue == null) {
                                return;
                            }
                            pieceValue.name = e.currentValue;
                        });
                    }}
                />
            </TableRow>
            <TableRow label='値'>
                <CollaborativeInput
                    bufferDuration='default'
                    size='small'
                    value={state.value}
                    onChange={({ currentValue }) => {
                        updateState(state => {
                            if (state == null) {
                                return;
                            }
                            state.value = currentValue;
                        });
                    }}
                />
            </TableRow>

            <TableRow label='値を非公開にする'>
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
        </Table>
    );
};
