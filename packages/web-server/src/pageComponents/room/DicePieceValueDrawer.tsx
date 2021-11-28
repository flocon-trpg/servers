import { Col, Drawer, Row } from 'antd';
import React from 'react';
import { DrawerFooter } from '../../layouts/DrawerFooter';
import { replace } from '../../stateManagers/states/types';
import { DrawerProps } from 'antd/lib/drawer';
import { Gutter } from 'antd/lib/grid/row';
import { StateEditorParams, useStateEditor } from '../../hooks/useStateEditor';
import {
    DicePieceValueState,
    CharacterState,
    dicePieceValueStrIndexes,
    simpleId,
} from '@flocon-trpg/core';
import { useDicePieceValues } from '../../hooks/state/useDicePieceValues';
import { MyCharactersSelect } from '../../components/MyCharactersSelect';
import { InputDie } from '../../components/InputDie';
import { noValue } from '../../utils/dice';
import { useMyUserUid } from '../../hooks/useMyUserUid';
import { useAtomValue } from 'jotai/utils';
import { dicePieceDrawerAtom } from '../../atoms/overlay/dicePieceDrawerAtom';
import { create, update } from '../../utils/constants';
import { useAtom } from 'jotai';
import { useSetRoomStateWithImmer } from '../../hooks/useSetRoomStateWithImmer';

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

const defaultDicePieceValue: DicePieceValueState = {
    $v: 2,
    $r: 1,

    // createするときはこれに自身のIDを入れなければならない
    ownerCharacterId: undefined,

    memo: undefined,
    name: undefined,
    dice: {},
    pieces: {},
};

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

const IdView: React.FC = () => {
    const drawerType = useAtomValue(dicePieceDrawerAtom);
    const myUserUid = useMyUserUid();

    if (drawerType == null || myUserUid == null) {
        return null;
    }

    return (
        <Row gutter={gutter} align='middle'>
            <Col flex='auto' />
            <Col flex={0}>ID</Col>
            <Col span={inputSpan}>{drawerType.type === update ? drawerType.stateId : '(なし)'}</Col>
        </Row>
    );
};

export const DicePieceValueDrawer: React.FC = () => {
    const [drawerType, setDrawerType] = useAtom(dicePieceDrawerAtom);
    const setRoomState = useSetRoomStateWithImmer();
    const myUserUid = useMyUserUid();
    const dicePieceValues = useDicePieceValues();
    const [activeCharacter, setActiveCharacter] = React.useState<{
        id: string;
        state: CharacterState;
    }>();
    let stateEditorParams: StateEditorParams<DicePieceValueState | undefined>;
    switch (drawerType?.type) {
        case create:
        case undefined:
            stateEditorParams = {
                type: create,
                initState: defaultDicePieceValue,
            };
            break;
        case update:
            stateEditorParams = {
                type: update,
                state: dicePieceValues?.find(value => value.id === drawerType.stateId)?.value,
                onUpdate: newState => {
                    if (myUserUid == null || drawerType?.type !== update) {
                        return;
                    }
                    const stateId = drawerType.stateId;
                    setRoomState(roomState => {
                        roomState.dicePieceValues[stateId] = newState;
                    });
                },
            };
            break;
    }
    const { uiState, updateUiState, resetUiState } = useStateEditor(stateEditorParams);

    if (myUserUid == null || uiState == null) {
        return null;
    }

    let onCreate: (() => void) | undefined = undefined;
    // drawerType != nullを付けていることで、updateから閉じる際に一瞬onCreateボタンが出るのを防いでいる。ただし、これで適切なのかどうかは吟味していない
    if (drawerType != null && drawerType.type === create) {
        onCreate = () => {
            if (activeCharacter == null) {
                return;
            }

            const piece = drawerType.piece;
            const id = simpleId();
            setRoomState(roomState => {
                roomState.dicePieceValues[id] = {
                    ...uiState,
                    ownerCharacterId: activeCharacter.id,
                    pieces:
                        piece == null
                            ? {}
                            : {
                                  [drawerType.piece.boardId]: piece,
                              },
                };
            });
            setDrawerType(null);
            setActiveCharacter(undefined);
            resetUiState(defaultDicePieceValue);
        };
    }

    return (
        <Drawer
            {...drawerBaseProps}
            title={drawerType?.type === update ? 'ダイスコマの編集' : 'ダイスコマの新規作成'}
            visible={drawerType != null}
            closable
            onClose={() => setDrawerType(null)}
            footer={
                <DrawerFooter
                    close={{
                        textType: drawerType?.type === update ? 'close' : 'cancel',
                        onClick: () => setDrawerType(null),
                    }}
                    ok={onCreate == null ? undefined : { textType: 'create', onClick: onCreate }}
                />
            }
        >
            <div>
                <IdView />
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>所有者</Col>
                    <Col span={inputSpan}>
                        <MyCharactersSelect
                            selectedCharacterId={
                                drawerType?.type === update
                                    ? uiState.ownerCharacterId
                                    : activeCharacter?.id
                            }
                            readOnly={drawerType?.type === update}
                            onSelect={setActiveCharacter}
                        />
                    </Col>
                </Row>

                {dicePieceValueStrIndexes.map(key => {
                    const die = uiState.dice[key];

                    return (
                        <Row key={key} style={{ minHeight: 28 }} gutter={gutter} align='middle'>
                            <Col flex='auto' />
                            <Col flex={0}>{`ダイス${key}`}</Col>
                            <Col span={inputSpan}>
                                <InputDie
                                    size='small'
                                    state={die ?? null}
                                    onChange={e => {
                                        updateUiState(pieceValue => {
                                            if (pieceValue == null) {
                                                return;
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
                                            die.value =
                                                e.newValue === noValue ? undefined : e.newValue;
                                        });
                                    }}
                                    onIsValuePrivateChange={e => {
                                        updateUiState(pieceValue => {
                                            const die = pieceValue?.dice[key];
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
        </Drawer>
    );
};
