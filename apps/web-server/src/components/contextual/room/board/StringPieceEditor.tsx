import React from 'react';
import { Checkbox, Col, Row } from 'antd';
import { Gutter } from 'antd/lib/grid/row';
import { StateEditorParams, useStateEditor } from '../../../../hooks/useStateEditor';
import { State, String, characterTemplate, simpleId, stringPieceTemplate } from '@flocon-trpg/core';
import { useMyUserUid } from '../../../../hooks/useMyUserUid';
import { close, create, ok, update } from '../../../../utils/constants';
import { useSetRoomStateWithImmer } from '../../../../hooks/useSetRoomStateWithImmer';
import { PiecePositionWithCell } from '../../../../utils/types';
import { CollaborativeInput } from '../../../ui/CollaborativeInput';
import { Subscribable } from 'rxjs';
import { useStringPieces } from '../../../../hooks/state/useStringPieces';
import { MyCharactersSelect } from '../character/MyCharactersSelect';

type CharacterState = State<typeof characterTemplate>;
type StringPieceState = State<typeof stringPieceTemplate>;

type ActionRequest = Subscribable<typeof ok | typeof close>;

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

const defaultStringPieceValue = (
    piecePosition: PiecePositionWithCell,
    ownerCharacterId: string | undefined
): StringPieceState => ({
    ownerCharacterId,
    value: '',
    isValuePrivate: false,
    valueInputType: String,
    memo: undefined,
    name: undefined,
    opacity: undefined,
    isPositionLocked: false,

    ...piecePosition,

    $v: 2,
    $r: 1,
});

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

export const StringPieceEditor: React.FC<Props> = props => {
    const setRoomState = useSetRoomStateWithImmer();
    const myUserUid = useMyUserUid();
    const stringPieces = useStringPieces(props.type === update ? props.boardId : undefined);
    const [activeCharacter, setActiveCharacter] = React.useState<{
        id: string;
        state: CharacterState;
    }>();

    let stateEditorParams: StateEditorParams<StringPieceState | undefined> | undefined;
    switch (props.type) {
        case undefined:
            stateEditorParams = undefined;
            break;
        case create:
            stateEditorParams = {
                type: create,
                createInitState: () => defaultStringPieceValue(props.piecePosition, undefined),
                onCreate: newState => {
                    if (newState == null || props.type !== create) {
                        return;
                    }
                    const id = simpleId();
                    setRoomState(roomState => {
                        const stringPieces = roomState.boards?.[props.boardId]?.stringPieces;
                        if (stringPieces == null) {
                            return;
                        }
                        stringPieces[id] = newState;
                    });
                },
            };
            break;
        case update:
            stateEditorParams = {
                type: update,
                state: stringPieces?.get(props.pieceId),
                updateWithImmer: newState => {
                    if (myUserUid == null || props.type !== update) {
                        return;
                    }
                    const boardId = props.boardId;
                    const pieceId = props.pieceId;
                    setRoomState(roomState => {
                        const stringPieces = roomState.boards?.[boardId]?.stringPieces;
                        if (stringPieces == null) {
                            return;
                        }
                        stringPieces[pieceId] = newState;
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
            <Row gutter={gutter} align='middle'>
                <Col flex='auto' />
                <Col flex={0}>値</Col>
                <Col span={inputSpan}>
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
                </Col>
            </Row>
            <Row gutter={gutter} align='middle'>
                <Col flex='auto' />
                <Col flex={0}>値を非公開にする</Col>
                <Col span={inputSpan}>
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
                </Col>
            </Row>
        </div>
    );
};
