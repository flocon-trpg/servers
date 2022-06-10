import React from 'react';
import { Checkbox, Col, Row } from 'antd';
import { Gutter } from 'antd/lib/grid/row';
import {
    CreateModeParams,
    UpdateModeParams,
    useStateEditor,
} from '../../../../hooks/useStateEditor';
import { State, String, characterTemplate, simpleId, stringPieceTemplate } from '@flocon-trpg/core';
import { useMyUserUid } from '../../../../hooks/useMyUserUid';
import { close, ok } from '../../../../utils/constants';
import { useSetRoomStateWithImmer } from '../../../../hooks/useSetRoomStateWithImmer';
import { PiecePositionWithCell } from '../../../../utils/types';
import { CollaborativeInput } from '../../../ui/CollaborativeInput';
import { Subscribable } from 'rxjs';
import { useStringPieces } from '../../../../hooks/state/useStringPieces';
import { MyCharactersSelect } from '../character/MyCharactersSelect';
import { IsCellModeSelector } from './IsCellModeSelector';

type CharacterState = State<typeof characterTemplate>;
type StringPieceState = State<typeof stringPieceTemplate>;

type ActionRequest = Subscribable<typeof ok | typeof close>;

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

const defaultStringPieceValue = (
    piecePosition: PiecePositionWithCell,
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
    piecePosition: PiecePositionWithCell;
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
    const stringPieces = useStringPieces(updateMode == null ? undefined : updateMode.boardId);
    const [activeCharacter, setActiveCharacter] = React.useState<{
        id: string;
        state: CharacterState;
    }>();
    // TODO: useStateEditorの性質上、useMemoでは不十分
    const createModeParams: CreateModeParams<StringPieceState | undefined> | undefined =
        React.useMemo(() => {
            if (createMode == null) {
                return undefined;
            }
            return {
                createInitState: () =>
                    defaultStringPieceValue(createMode.piecePosition, true, undefined),
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
        }, [activeCharacter, createMode, setRoomState]);
    const updateModeParams: UpdateModeParams<StringPieceState | undefined> | undefined =
        React.useMemo(() => {
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

    if (myUserUid == null || state == null) {
        return null;
    }

    return (
        <div>
            <Row gutter={gutter} align='middle'>
                <Col flex='auto' />
                <Col flex={0}>ID</Col>
                <Col span={inputSpan}>{updateMode != null ? updateMode.pieceId : '(なし)'}</Col>
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
                            updateMode != null ? state.ownerCharacterId : activeCharacter?.id
                        }
                        readOnly={createMode == null}
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
