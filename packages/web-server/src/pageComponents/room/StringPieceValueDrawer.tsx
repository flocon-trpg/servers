import { Checkbox, Col, Drawer, InputNumber, Row } from 'antd';
import React from 'react';
import { DrawerFooter } from '../../layouts/DrawerFooter';
import { replace } from '../../stateManagers/states/types';
import { DrawerProps } from 'antd/lib/drawer';
import { Gutter } from 'antd/lib/grid/row';
import { StateEditorParams, useStateEditor } from '../../hooks/useStateEditor';
import { useSetRoomStateByApply } from '../../hooks/useSetRoomStateByApply';
import {
    StringPieceValueState,
    toStringPieceValueUpOperation,
    stringPieceValueDiff,
    CharacterState,
    simpleId,
} from '@flocon-trpg/core';
import { useStringPieceValues } from '../../hooks/state/useStringPieceValues';
import { MyCharactersSelect } from '../../components/MyCharactersSelect';
import { useMyUserUid } from '../../hooks/useMyUserUid';
import { keyNames } from '@flocon-trpg/utils';
import { characterUpdateOperation } from '../../utils/characterUpdateOperation';
import { useAtomValue } from 'jotai/utils';
import { dicePieceDrawerAtom } from '../../atoms/overlay/dicePieceDrawerAtom';
import { create, update } from '../../utils/constants';
import { stringPieceDrawerAtom } from '../../atoms/overlay/stringPieceDrawerAtom';
import { useAtom } from 'jotai';

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

const defaultStringPieceValue: StringPieceValueState = {
    $v: 1,
    $r: 1,
    value: '',
    isValuePrivate: false,
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
            <Col span={inputSpan}>
                {drawerType.type === update
                    ? keyNames({ createdBy: myUserUid, id: drawerType.stateKey })
                    : '(なし)'}
            </Col>
        </Row>
    );
};

const parseIntSafe = (value: string) => {
    const result = parseInt(value, 10);
    if (Number.isNaN(result) || !Number.isFinite(result)) {
        return 0;
    }
    return result;
};

export const StringPieceValueDrawer: React.FC = () => {
    const [drawerType, setDrawerType] = useAtom(stringPieceDrawerAtom)
    const operate = useSetRoomStateByApply();
    const myUserUid = useMyUserUid();
    const stringPieceValues = useStringPieceValues();
    const [activeCharacter, setActiveCharacter] = React.useState<{
        key: string;
        state: CharacterState;
    }>();

    let stateEditorParams: StateEditorParams<StringPieceValueState | undefined>;
    switch (drawerType?.type) {
        case create:
        case undefined:
            stateEditorParams = {
                type: create,
                initState: defaultStringPieceValue,
            };
            break;
        case update:
            stateEditorParams = {
                type: update,
                state: stringPieceValues?.find(
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
                    const diff = stringPieceValueDiff({ prevState, nextState });
                    if (diff == null) {
                        return;
                    }
                    operate(
                        characterUpdateOperation(drawerType.characterKey, {
                            $v: 1,
                            $r: 2,
                            stringPieceValues: {
                                [drawerType.stateKey]: {
                                    type: update,
                                    update: toStringPieceValueUpOperation(diff),
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
    if (drawerType != null && drawerType?.type === create) {
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
                        stringPieceValues: {
                            [id]: {
                                type: replace,
                                replace: {
                                    newValue: {
                                        ...state,
                                        pieces:
                                            drawerType.piece?.boardKey == null
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
            setDrawerType(null);
            setActiveCharacter(undefined);
            setState(defaultStringPieceValue);
        };
    }

    return (
        <Drawer
            {...drawerBaseProps}
            title={drawerType?.type == update ? '数値コマの編集' : '数値コマの新規作成'}
            visible={drawerType != null}
            closable
            onClose={() =>
                setDrawerType(null)
            }
            footer={
                <DrawerFooter
                    close={{
                        textType: drawerType?.type === update ? 'close' : 'cancel',
                        onClick: () =>
                        setDrawerType(null)
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
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>値</Col>
                    <Col span={inputSpan}>
                        <InputNumber
                            size='small'
                            value={parseIntSafe(state.value)}
                            onChange={e => {
                                setState({ ...state, value: e.toString() });
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
                            onChange={e => setState({ ...state, isValuePrivate: e.target.checked })}
                        />
                    </Col>
                </Row>
            </div>
        </Drawer>
    );
};
