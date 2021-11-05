import { Col, Drawer, Row } from 'antd';
import React from 'react';
import { DrawerFooter } from '../../layouts/DrawerFooter';
import { replace } from '../../stateManagers/states/types';
import { DrawerProps } from 'antd/lib/drawer';
import { Gutter } from 'antd/lib/grid/row';
import { StateEditorParams, useStateEditor } from '../../hooks/useStateEditor';
import { useOperate } from '../../hooks/useOperate';
import {
    toDicePieceValueUpOperation,
    dicePieceValueDiff,
    DicePieceValueState,
    CharacterState,
    dicePieceValueStrIndexes,
    simpleId,
} from '@flocon-trpg/core';
import { useDispatch } from 'react-redux';
import { useSelector } from '../../store';
import {
    create,
    roomDrawerAndPopoverAndModalModule,
    update,
} from '../../modules/roomDrawerAndPopoverAndModalModule';
import { useDicePieceValues } from '../../hooks/state/useDicePieceValues';
import { MyCharactersSelect } from '../../components/MyCharactersSelect';
import { InputDie } from '../../components/InputDie';
import { noValue } from '../../utils/dice';
import { useMyUserUid } from '../../hooks/useMyUserUid';
import { keyNames } from '@flocon-trpg/utils';
import { characterUpdateOperation } from '../../utils/characterUpdateOperation';

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

const defaultDicePieceValue: DicePieceValueState = {
    $v: 1,
    $r: 1,
    dice: {},
    pieces: {},
};

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

const IdView: React.FC = () => {
    const drawerType = useSelector(
        state => state.roomDrawerAndPopoverAndModalModule.dicePieceValueDrawerType
    );
    const myUserUid = useMyUserUid();

    if (drawerType == null || myUserUid == null) {
        return null;
    }

    return (
        <Row gutter={gutter} align='middle'>
            <Col flex='auto' />
            <Col flex={0}>ID</Col>
            <Col span={inputSpan}>
                {drawerType.type === update
                    ? keyNames({ createdBy: myUserUid, id: drawerType.stateKey })
                    : '(なし)'}
            </Col>
        </Row>
    );
};

export const DicePieceValueDrawer: React.FC = () => {
    const drawerType = useSelector(
        state => state.roomDrawerAndPopoverAndModalModule.dicePieceValueDrawerType
    );
    const dispatch = useDispatch();
    const operate = useOperate();
    const myUserUid = useMyUserUid();
    const dicePieceValues = useDicePieceValues();
    const [activeCharacter, setActiveCharacter] = React.useState<{
        key: string;
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
                state: dicePieceValues?.find(
                    value =>
                        value.characterKey.createdBy === myUserUid &&
                        value.valueId === drawerType.stateKey
                )?.value,
                onUpdate: ({ prevState, nextState }) => {
                    if (myUserUid == null || drawerType?.type !== update) {
                        return;
                    }
                    if (prevState == null || nextState == null) {
                        return;
                    }
                    const diff = dicePieceValueDiff({ prevState, nextState });
                    if (diff == null) {
                        return;
                    }
                    operate(
                        characterUpdateOperation(drawerType.characterKey, {
                            $v: 1,
                            $r: 2,
                            dicePieceValues: {
                                [drawerType.stateKey]: {
                                    type: update,
                                    update: toDicePieceValueUpOperation(diff),
                                },
                            },
                        })
                    );
                },
            };
            break;
    }
    const { uiState: state, updateUiState: setState } = useStateEditor(stateEditorParams);

    if (myUserUid == null || state == null) {
        return null;
    }

    let onCreate: (() => void) | undefined = undefined;
    // drawerType != nullを付けていることで、updateから閉じる際に一瞬onCreateボタンが出るのを防いでいる。ただし、これで適切なのかどうかは吟味していない
    if (drawerType != null && drawerType.type === create) {
        onCreate = () => {
            if (activeCharacter == null) {
                return;
            }

            const id = simpleId();
            operate(
                characterUpdateOperation(
                    { createdBy: myUserUid, id: activeCharacter.key },
                    {
                        $v: 1,
                        $r: 2,
                        dicePieceValues: {
                            [id]: {
                                type: replace,
                                replace: {
                                    newValue: {
                                        ...state,
                                        pieces:
                                            drawerType?.piece?.boardKey == null
                                                ? {}
                                                : {
                                                      [drawerType.piece.boardKey.createdBy]: {
                                                          [drawerType.piece.boardKey.id]:
                                                              drawerType.piece,
                                                      },
                                                  },
                                    },
                                },
                            },
                        },
                    }
                )
            );
            dispatch(
                roomDrawerAndPopoverAndModalModule.actions.set({ dicePieceValueDrawerType: null })
            );
            setActiveCharacter(undefined);
            setState(defaultDicePieceValue);
        };
    }

    return (
        <Drawer
            {...drawerBaseProps}
            title={drawerType?.type === update ? 'ダイスコマの編集' : 'ダイスコマの新規作成'}
            visible={drawerType != null}
            closable
            onClose={() =>
                dispatch(
                    roomDrawerAndPopoverAndModalModule.actions.set({
                        dicePieceValueDrawerType: null,
                    })
                )
            }
            footer={
                <DrawerFooter
                    close={{
                        textType: drawerType?.type === update ? 'close' : 'cancel',
                        onClick: () =>
                            dispatch(
                                roomDrawerAndPopoverAndModalModule.actions.set({
                                    dicePieceValueDrawerType: null,
                                })
                            ),
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
                                    ? drawerType.characterKey.id
                                    : activeCharacter?.key
                            }
                            readOnly={drawerType?.type === update}
                            onSelect={setActiveCharacter}
                        />
                    </Col>
                </Row>

                {dicePieceValueStrIndexes.map(key => {
                    const die = state.dice[key];

                    return (
                        <Row key={key} style={{ minHeight: 28 }} gutter={gutter} align='middle'>
                            <Col flex='auto' />
                            <Col flex={0}>{`ダイス${key}`}</Col>
                            <Col span={inputSpan}>
                                <InputDie
                                    size='small'
                                    state={die ?? null}
                                    onChange={e => {
                                        if (e.type === replace) {
                                            setState({
                                                ...state,
                                                dice: {
                                                    ...state.dice,
                                                    [key]:
                                                        e.newValue == null
                                                            ? undefined
                                                            : {
                                                                  $v: 1,
                                                                  $r: 1,
                                                                  dieType: e.newValue.dieType,
                                                                  isValuePrivate: false,
                                                                  value: null,
                                                              },
                                                },
                                            });
                                            return;
                                        }
                                        setState({
                                            ...state,
                                            dice: {
                                                ...state.dice,
                                                [key]:
                                                    die == null
                                                        ? undefined
                                                        : {
                                                              ...die,
                                                              value:
                                                                  e.newValue === noValue
                                                                      ? null
                                                                      : e.newValue,
                                                          },
                                            },
                                        });
                                    }}
                                    onIsValuePrivateChange={e => {
                                        if (die == null) {
                                            return;
                                        }
                                        setState({
                                            ...state,
                                            dice: {
                                                ...state.dice,
                                                [key]: {
                                                    ...die,
                                                    isValuePrivate: e,
                                                },
                                            },
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
