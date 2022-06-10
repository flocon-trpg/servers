import React from 'react';
import { Col, Row } from 'antd';
import { replace } from '../../../../../../stateManagers/states/types';
import { Gutter } from 'antd/lib/grid/row';
import {
    CreateModeParams,
    UpdateModeParams,
    useStateEditor,
} from '../../../../../../hooks/useStateEditor';
import {
    State,
    characterTemplate,
    dicePieceStrIndexes,
    dicePieceTemplate,
    simpleId,
} from '@flocon-trpg/core';
import { useDicePieces } from '../../../../../../hooks/state/useDicePieces';
import { MyCharactersSelect } from '../MyCharactersSelect/MyCharactersSelect';
import { InputDie } from '../InputDie/InputDie';
import { noValue } from '../../../../../../utils/board/dice';
import { useMyUserUid } from '../../../../../../hooks/useMyUserUid';
import { close, ok } from '../../../../../../utils/constants';
import { useSetRoomStateWithImmer } from '../../../../../../hooks/useSetRoomStateWithImmer';
import { PiecePositionWithCell } from '../../../../../../utils/types';
import { CollaborativeInput } from '../../../../../ui/CollaborativeInput/CollaborativeInput';
import { Subscribable } from 'rxjs';
import { IsCellModeSelector } from '../IsCellModeSelector/IsCellModeSelector';
import { applyPiecePositionWithCell } from '../../../../../../utils/applyPiecePositionWithCell';

type CharacterState = State<typeof characterTemplate>;
type DicePieceState = State<typeof dicePieceTemplate>;

const defaultDicePieceValue = (
    piecePosition: PiecePositionWithCell,
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

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

type ActionRequest = Subscribable<typeof ok | typeof close>;

export type CreateMode = {
    boardId: string;
    piecePosition: PiecePositionWithCell;
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
    const dicePieces = useDicePieces(updateModeProp == null ? undefined : updateModeProp.boardId);
    const [activeCharacter, setActiveCharacter] = React.useState<{
        id: string;
        state: CharacterState;
    }>();

    // TODO: useStateEditorの性質上、useMemoでは不十分
    const createMode: CreateModeParams<DicePieceState | undefined> | undefined =
        React.useMemo(() => {
            if (createModeProp == null) {
                return undefined;
            }
            return {
                createInitState: () =>
                    defaultDicePieceValue(createModeProp.piecePosition, true, undefined),
                updateInitState: prevState => {
                    if (prevState == null) {
                        return;
                    }
                    applyPiecePositionWithCell({
                        state: prevState,
                        operation: createModeProp.piecePosition,
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
        }, [activeCharacter, createModeProp, setRoomState]);
    const updateMode: UpdateModeParams<DicePieceState | undefined> | undefined =
        React.useMemo(() => {
            if (updateModeProp == null) {
                return undefined;
            }
            return {
                state: dicePieces?.get(updateModeProp.pieceId),
                updateWithImmer: newState => {
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
                }
            },
        });
        return () => subscription.unsubscribe();
    }, [actionRequest, ok]);

    if (myUserUid == null || state == null) {
        return null;
    }

    return (
        <div>
            <Row gutter={gutter} align='middle'>
                <Col flex='auto' />
                <Col flex={0}>ID</Col>
                <Col span={inputSpan}>{updateModeProp?.pieceId ?? '(なし)'}</Col>
            </Row>

            <Row gutter={gutter} align='middle'>
                <Col flex='auto' />
                <Col flex={0}></Col>
                <Col span={inputSpan}>
                    <IsCellModeSelector
                        value={state.isCellMode}
                        onChange={newValue =>
                            updateState(prevState => {
                                if (prevState == null) {
                                    return;
                                }
                                prevState.isCellMode = newValue;
                            })
                        }
                    />
                </Col>
            </Row>

            <Row gutter={gutter} align='middle'>
                <Col flex='auto' />
                <Col flex={0}>所有者</Col>
                <Col span={inputSpan}>
                    <MyCharactersSelect
                        selectedCharacterId={
                            createModeProp == null ? state.ownerCharacterId : activeCharacter?.id
                        }
                        readOnly={createModeProp == null}
                        onSelect={setActiveCharacter}
                    />
                </Col>
            </Row>

            <Row gutter={gutter} align='middle'>
                <Col flex='auto' />
                <Col flex={0}>名前</Col>
                <Col span={inputSpan}>
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
                </Col>
            </Row>

            {dicePieceStrIndexes.map(key => {
                const die = state.dice?.[key];

                return (
                    <Row key={key} style={{ minHeight: 28 }} gutter={gutter} align='middle'>
                        <Col flex='auto' />
                        <Col flex={0}>{`ダイス${key}`}</Col>
                        <Col span={inputSpan}>
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
                        </Col>
                    </Row>
                );
            })}
        </div>
    );
};
