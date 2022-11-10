import {
    State,
    characterTemplate,
    dicePieceStrIndexes,
    dicePieceTemplate,
    replace,
    simpleId,
} from '@flocon-trpg/core';
import { keyNames } from '@flocon-trpg/utils';
import React from 'react';
import { Subscribable } from 'rxjs';
import { useMemoOne } from 'use-memo-one';
import { useDicePieces } from '../../hooks/useDicePieces';
import { usePixelRectToCompositeRect } from '../../hooks/usePixelRectToCompositeRect';
import { useSetRoomStateWithImmer } from '../../hooks/useSetRoomStateWithImmer';
import { CreateModeParams, UpdateModeParams, useStateEditor } from '../../hooks/useStateEditor';
import {
    CompositeRect,
    PixelPosition,
    PixelSize,
    applyCompositeRect,
} from '../../utils/positionAndSizeAndRect';
import { noValue } from '../../utils/types';
import { InputDie } from '../InputDie/InputDie';
import { MyCharactersSelect } from '../MyCharactersSelect/MyCharactersSelect';
import { PieceEditorIdRow } from '../PieceEditorIdRow/PieceEditorIdRow';
import { PieceEditorMemoRow } from '../PieceEditorMemoRow/PieceEditorMemoRow';
import { PieceEditorNameRow } from '../PieceEditorNameRow/PieceEditorNameRow';
import { PieceRectEditor } from '../RectEditor/RectEditor';
import { Table, TableDivider, TableRow } from '@/components/ui/Table/Table';
import { useMyUserUid } from '@/hooks/useMyUserUid';
import { close, ok } from '@/utils/constants';

type CharacterState = State<typeof characterTemplate>;
type DicePieceState = State<typeof dicePieceTemplate>;

const defaultDicePieceValue = (
    piecePosition: CompositeRect,
    isCellMode: boolean,
    ownerCharacterId: string | undefined
): DicePieceState => ({
    ...piecePosition,

    ownerCharacterId,
    isCellMode,

    dice: {},
    memo: undefined,
    name: undefined,
    opacity: undefined,
    isPositionLocked: false,

    $v: 2,
    $r: 1,
});

const pieceSize: PixelSize = { w: 50, h: 50 };

type ActionRequest = Subscribable<typeof ok | typeof close>;

export type CreateMode = {
    boardId: string;
    piecePosition: PixelPosition;
};

export type UpdateMode = {
    boardId: string;
    pieceId: string;
};

export const DicePieceEditor: React.FC<{
    actionRequest?: ActionRequest;
    createMode?: CreateMode;
    updateMode?: UpdateMode;
}> = ({ actionRequest, createMode: createModeProp, updateMode: updateModeProp }) => {
    const setRoomState = useSetRoomStateWithImmer();
    const myUserUid = useMyUserUid();
    const boardId = updateModeProp?.boardId ?? createModeProp?.boardId;
    const dicePieces = useDicePieces(boardId);
    const [activeCharacter, setActiveCharacter] = React.useState<{
        id: string;
        state: CharacterState;
    }>();

    const compositeRect = usePixelRectToCompositeRect({
        boardId: updateModeProp?.boardId ?? createModeProp?.boardId,
        pixelRect:
            createModeProp?.piecePosition == null
                ? undefined
                : { ...createModeProp.piecePosition, ...pieceSize },
    });
    const createMode: CreateModeParams<DicePieceState | undefined> | undefined = useMemoOne(() => {
        if (createModeProp == null || compositeRect == null) {
            return undefined;
        }
        return {
            createInitState: () => defaultDicePieceValue(compositeRect, true, undefined),
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
                    const dicePieces = roomState.boards?.[createModeProp.boardId]?.dicePieces;
                    if (dicePieces == null) {
                        return;
                    }
                    dicePieces[id] = { ...newState, ownerCharacterId: activeCharacter.id };
                });
            },
        };
    }, [activeCharacter, compositeRect, createModeProp, setRoomState]);
    const updateMode: UpdateModeParams<DicePieceState | undefined> | undefined = useMemoOne(() => {
        if (updateModeProp == null) {
            return undefined;
        }
        return {
            state: dicePieces?.get(updateModeProp.pieceId),
            onUpdate: newState => {
                if (newState == null || myUserUid == null) {
                    return;
                }
                const { boardId, pieceId } = updateModeProp;
                setRoomState(roomState => {
                    const dicePieces = roomState.boards?.[boardId]?.dicePieces;
                    if (dicePieces == null) {
                        return;
                    }
                    dicePieces[pieceId] = newState;
                });
            },
        };
    }, [dicePieces, updateModeProp, myUserUid, setRoomState]);
    const { state, updateState, ok } = useStateEditor({ createMode, updateMode });
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
                    case 'close':
                        break;
                }
            },
        });
        return () => subscription.unsubscribe();
    }, [actionRequest, ok]);
    const labelStyle: React.CSSProperties = React.useMemo(() => ({ minWidth: 100 }), []);

    if (myUserUid == null || state == null || boardId == null) {
        return null;
    }

    return (
        <Table labelStyle={labelStyle}>
            {dicePieceStrIndexes.map(key => {
                const die = state.dice?.[key];

                // minHeight: 28
                return (
                    <TableRow
                        key={keyNames('DicePieceEditor', 'ダイス', key)}
                        label={`ダイス${key}`}
                    >
                        <InputDie
                            size='small'
                            state={die ?? null}
                            onChange={e => {
                                updateState(pieceValue => {
                                    if (pieceValue == null) {
                                        return;
                                    }
                                    if (pieceValue.dice == null) {
                                        pieceValue.dice = {};
                                    }
                                    if (e.type === replace) {
                                        pieceValue.dice[key] =
                                            e.newValue == null
                                                ? undefined
                                                : {
                                                      $v: 1,
                                                      $r: 1,
                                                      dieType: e.newValue.dieType,
                                                      isValuePrivate: false,
                                                      value: undefined,
                                                  };
                                        return;
                                    }
                                    const die = pieceValue.dice[key];
                                    if (die == null) {
                                        return;
                                    }
                                    die.value = e.newValue === noValue ? undefined : e.newValue;
                                });
                            }}
                            onIsValuePrivateChange={e => {
                                updateState(pieceValue => {
                                    const die = pieceValue?.dice?.[key];
                                    if (die == null) {
                                        return;
                                    }
                                    die.isValuePrivate = e;
                                });
                            }}
                        />
                    </TableRow>
                );
            })}

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

            <PieceEditorIdRow pieceId={updateModeProp?.pieceId} />

            <TableRow label='所有者'>
                <MyCharactersSelect
                    selectedCharacterId={
                        createModeProp == null ? state.ownerCharacterId : activeCharacter?.id
                    }
                    readOnly={createModeProp == null}
                    onSelect={setActiveCharacter}
                />
            </TableRow>
        </Table>
    );
};
