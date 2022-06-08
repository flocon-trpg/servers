import React from 'react';
import { Col, Row } from 'antd';
import { replace } from '../../../../stateManagers/states/types';
import { Gutter } from 'antd/lib/grid/row';
import { StateEditorParams, useStateEditor } from '../../../../hooks/useStateEditor';
import {
    State,
    characterTemplate,
    dicePieceStrIndexes,
    dicePieceTemplate,
    simpleId,
} from '@flocon-trpg/core';
import { useDicePieces } from '../../../../hooks/state/useDicePieces';
import { MyCharactersSelect } from '../character/MyCharactersSelect';
import { InputDie } from './die/InputDie';
import { noValue } from '../../../../utils/board/dice';
import { useMyUserUid } from '../../../../hooks/useMyUserUid';
import { close, create, ok, update } from '../../../../utils/constants';
import { useSetRoomStateWithImmer } from '../../../../hooks/useSetRoomStateWithImmer';
import { PiecePositionWithCell } from '../../../../utils/types';
import { CollaborativeInput } from '../../../ui/CollaborativeInput';
import { Subscribable } from 'rxjs';

type CharacterState = State<typeof characterTemplate>;
type DicePieceState = State<typeof dicePieceTemplate>;

const defaultDicePieceValue = (
    piecePosition: PiecePositionWithCell,
    ownerCharacterId: string | undefined
): DicePieceState => ({
    ownerCharacterId,

    dice: {},
    memo: undefined,
    name: undefined,
    opacity: undefined,
    isPositionLocked: false,

    ...piecePosition,

    $v: 2,
    $r: 1,
});

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

type ActionRequest = Subscribable<typeof ok | typeof close>;

export type Props =
    | {
          type: undefined;
      }
    | {
          type: typeof create;
          actionRequest: ActionRequest;
          boardId: string;
          piecePosition: PiecePositionWithCell;
      }
    | {
          type: typeof update;
          actionRequest: ActionRequest;
          boardId: string;
          pieceId: string;
      };

export const DicePieceEditor: React.FC<Props> = props => {
    const setRoomState = useSetRoomStateWithImmer();
    const myUserUid = useMyUserUid();
    const dicePieces = useDicePieces(props.type === update ? props.boardId : undefined);
    const [activeCharacter, setActiveCharacter] = React.useState<{
        id: string;
        state: CharacterState;
    }>();

    let stateEditorParams: StateEditorParams<DicePieceState | undefined> | undefined;
    switch (props.type) {
        case undefined:
            stateEditorParams = undefined;
            break;
        case create:
            stateEditorParams = {
                type: create,
                // createする際にownerCharacterIdをセットする必要がある
                createInitState: () => defaultDicePieceValue(props.piecePosition, undefined),
                onCreate: newState => {
                    if (newState == null || activeCharacter == null || props.type !== create) {
                        return;
                    }
                    const id = simpleId();
                    setRoomState(roomState => {
                        const dicePieces = roomState.boards?.[props.boardId]?.dicePieces;
                        if (dicePieces == null) {
                            return;
                        }
                        dicePieces[id] = { ...newState, ownerCharacterId: activeCharacter.id };
                    });
                },
            };
            break;
        case update:
            stateEditorParams = {
                type: update,
                state: dicePieces?.get(props.pieceId),
                updateWithImmer: newState => {
                    if (newState == null || myUserUid == null || props?.type !== update) {
                        return;
                    }
                    const { boardId, pieceId } = props;
                    setRoomState(roomState => {
                        const dicePieces = roomState.boards?.[boardId]?.dicePieces;
                        if (dicePieces == null) {
                            return;
                        }
                        dicePieces[pieceId] = newState;
                    });
                },
            };
            break;
    }
    const { state, updateState, ok } = useStateEditor(stateEditorParams);
    const actionRequest = props.type == null ? undefined : props.actionRequest;
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
                <Col span={inputSpan}>{props.type === update ? props.pieceId : '(なし)'}</Col>
            </Row>
            <Row gutter={gutter} align='middle'>
                <Col flex='auto' />
                <Col flex={0}>所有者</Col>
                <Col span={inputSpan}>
                    <MyCharactersSelect
                        selectedCharacterId={
                            props.type === update ? state.ownerCharacterId : activeCharacter?.id
                        }
                        readOnly={props.type === update}
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
