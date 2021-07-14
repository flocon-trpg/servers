import { Checkbox, Col, Drawer, InputNumber, Row } from 'antd';
import React from 'react';
import DrawerFooter from '../../layouts/DrawerFooter';
import { simpleId } from '../../utils/generators';
import { replace } from '../../stateManagers/states/types';
import { DrawerProps } from 'antd/lib/drawer';
import { Gutter } from 'antd/lib/grid/row';
import { StateEditorParams, useStateEditor } from '../../hooks/useStateEditor';
import { useOperate } from '../../hooks/useOperate';
import {
    NumberPieceValueState,
    UpOperation,
    toNumberPieceValueUpOperation,
    numberPieceValueDiff,
    CharacterState,
} from '@kizahasi/flocon-core';
import { compositeKeyToString } from '@kizahasi/util';
import { useNumberPieceValues } from '../../hooks/state/useNumberPieceValues';
import { useDispatch } from 'react-redux';
import { useSelector } from '../../store';
import {
    create,
    roomDrawerAndPopoverModule,
    update,
} from '../../modules/roomDrawerAndPopoverModule';
import { MyCharactersSelect } from '../../components/MyCharactersSelect';
import { useMyUserUid } from '../../hooks/useMyUserUid';

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

const defaultNumberPieceValue: NumberPieceValueState = {
    $version: 1,
    value: 0,
    isValuePrivate: false,
    pieces: {},
};

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

const IdView: React.FC = () => {
    const drawerType = useSelector(
        state => state.roomDrawerAndPopoverModule.dicePieceValueDrawerType
    );
    const myUserUid = useMyUserUid();

    if (drawerType == null || myUserUid == null) {
        return null;
    }

    return (
        <Row gutter={gutter} align="middle">
            <Col flex="auto" />
            <Col flex={0}>ID</Col>
            <Col span={inputSpan}>
                {drawerType.type === update
                    ? compositeKeyToString({ createdBy: myUserUid, id: drawerType.stateKey })
                    : '(なし)'}
            </Col>
        </Row>
    );
};

export const NumberPieceValueDrawer: React.FC = () => {
    const drawerType = useSelector(
        state => state.roomDrawerAndPopoverModule.numberPieceValueDrawerType
    );
    const dispatch = useDispatch();
    const operate = useOperate();
    const myUserUid = useMyUserUid();
    const numberPieceValues = useNumberPieceValues();
    const [activeCharacter, setActiveCharacter] = React.useState<{
        key: string;
        state: CharacterState;
    }>();
    let stateEditorParams: StateEditorParams<NumberPieceValueState | undefined>;
    switch (drawerType?.type) {
        case create:
        case undefined:
            stateEditorParams = {
                type: create,
                initState: defaultNumberPieceValue,
            };
            break;
        case update:
            stateEditorParams = {
                type: update,
                state: numberPieceValues?.find(
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
                    const diff = numberPieceValueDiff({ prevState, nextState });
                    if (diff == null) {
                        return;
                    }
                    const operation: UpOperation = {
                        $version: 1,
                        characters: {
                            [drawerType.characterKey.createdBy]: {
                                [drawerType.characterKey.id]: {
                                    type: update,
                                    update: {
                                        $version: 1,
                                        numberPieceValues: {
                                            [drawerType.stateKey]: {
                                                type: update,
                                                update: toNumberPieceValueUpOperation(diff),
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    };
                    operate(operation);
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
    if (drawerType != null && drawerType?.type === create) {
        onCreate = () => {
            if (activeCharacter == null) {
                return;
            }

            const id = simpleId();
            const operation: UpOperation = {
                $version: 1,
                characters: {
                    [myUserUid]: {
                        [activeCharacter.key]: {
                            type: update,
                            update: {
                                $version: 1,
                                numberPieceValues: {
                                    [id]: {
                                        type: replace,
                                        replace: {
                                            newValue: {
                                                ...state,
                                                pieces:
                                                    drawerType.boardKey == null
                                                        ? {}
                                                        : {
                                                              [drawerType.boardKey.createdBy]: {
                                                                  [drawerType.boardKey.id]:
                                                                      drawerType.piece,
                                                              },
                                                          },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            };
            operate(operation);
            dispatch(roomDrawerAndPopoverModule.actions.set({ numberPieceValueDrawerType: null }));
            setActiveCharacter(undefined);
            setState(defaultNumberPieceValue);
        };
    }

    return (
        <Drawer
            {...drawerBaseProps}
            title={drawerType?.type == update ? '数値コマの編集' : '数値コマの新規作成'}
            visible={drawerType != null}
            closable
            onClose={() =>
                dispatch(
                    roomDrawerAndPopoverModule.actions.set({ numberPieceValueDrawerType: null })
                )
            }
            footer={
                <DrawerFooter
                    close={{
                        textType: drawerType?.type === update ? 'close' : 'cancel',
                        onClick: () =>
                            dispatch(
                                roomDrawerAndPopoverModule.actions.set({
                                    numberPieceValueDrawerType: null,
                                })
                            ),
                    }}
                    ok={onCreate == null ? undefined : { textType: 'create', onClick: onCreate }}
                />
            }
        >
            <div>
                <IdView />
                <Row gutter={gutter} align="middle">
                    <Col flex="auto" />
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
                <Row gutter={gutter} align="middle">
                    <Col flex="auto" />
                    <Col flex={0}>値</Col>
                    <Col span={inputSpan}>
                        <InputNumber
                            size="small"
                            value={state.value ?? 0}
                            onChange={e => {
                                if (typeof e !== 'number') {
                                    return;
                                }
                                setState({ ...state, value: e });
                            }}
                        />
                    </Col>
                </Row>
                <Row gutter={gutter} align="middle">
                    <Col flex="auto" />
                    <Col flex={0}>値を非公開にする</Col>
                    <Col span={inputSpan}>
                        <Checkbox
                            checked={state.isValuePrivate}
                            onChange={e => setState({ ...state, isValuePrivate: e.target.checked })}
                        />
                    </Col>
                </Row>
            </div>
        </Drawer>
    );
};
