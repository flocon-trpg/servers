import { Button, Checkbox, Col, Drawer, InputNumber, Row, Typography } from 'antd';
import React from 'react';
import DrawerFooter from '../../layouts/DrawerFooter';
import { simpleId } from '../../utils/generators';
import { replace } from '../../stateManagers/states/types';
import { DrawerProps } from 'antd/lib/drawer';
import { Gutter } from 'antd/lib/grid/row';
import { useStateEditor } from '../../hooks/useStateEditor';
import { useOperate } from '../../hooks/useOperate';
import { useMe } from '../../hooks/useMe';
import { UpOperation, toDicePieceValueUpOperation, dicePieceValueDiff, DicePieceValueState, CharacterState, dicePieceValueStrIndexes } from '@kizahasi/flocon-core';
import { compositeKeyToString } from '@kizahasi/util';
import { useDispatch } from 'react-redux';
import { useSelector } from '../../store';
import { create, roomDrawerModule, update } from '../../modules/roomDrawerModule';
import { useDicePieceValues } from '../../hooks/state/useDicePieceValues';
import { MyCharactersSelect } from '../../components/MyCharactersSelect';

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

const defaultDicePieceValue: DicePieceValueState = {
    $version: 1,
    dice: {},
    pieces: {},
};

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

const IdView: React.FC = () => {
    const drawerType = useSelector(state => state.roomDrawerModule.dicePieceValueDrawerType);
    const { userUid: myUserUid } = useMe();

    if (drawerType == null || myUserUid == null) {
        return null;
    }

    return <Row gutter={gutter} align='middle'>
        <Col flex='auto' />
        <Col flex={0}>ID</Col>
        <Col span={inputSpan}>
            {drawerType.type === update ? compositeKeyToString({ createdBy: myUserUid, id: drawerType.stateKey }) : '(なし)'}
        </Col>
    </Row>;
};

export const DicePieceValueDrawer: React.FC = () => {
    const drawerType = useSelector(state => state.roomDrawerModule.dicePieceValueDrawerType);
    const dispatch = useDispatch();
    const operate = useOperate();
    const { userUid: myUserUid } = useMe();
    const dicePieceValues = useDicePieceValues();
    const [activeCharacter, setActiveCharacter] = React.useState<{ key: string; state: CharacterState }>();

    const { state, setState, stateToCreate } = useStateEditor(
        drawerType?.type === update ? dicePieceValues?.find(value => value.characterKey.createdBy === myUserUid)?.value : null,
        defaultDicePieceValue,
        ({ prevState, nextState }) => {
            if (myUserUid == null || drawerType?.type !== update) {
                return;
            }
            const diff = dicePieceValueDiff({ prevState, nextState });
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
                                dicePieceValues: {
                                    [drawerType.stateKey]: {
                                        type: update,
                                        update: toDicePieceValueUpOperation(diff),
                                    }
                                }
                            }
                        }
                    }
                }
            };
            operate(operation);
        });

    if (myUserUid == null) {
        return null;
    }

    let onCreate: (() => void) | undefined = undefined;
    // drawerType != nullを付けていることで、updateから閉じる際に一瞬onCreateボタンが出るのを防いでいる。ただし、これで適切なのかどうかは吟味していない
    if (drawerType != null && stateToCreate !== undefined) {
        onCreate = () => {
            if (drawerType?.type !== create || activeCharacter == null) {
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
                                dicePieceValues: {
                                    [id]: {
                                        type: replace,
                                        replace: {
                                            newValue: {
                                                ...stateToCreate,
                                                pieces: drawerType.boardKey == null ? {} : {
                                                    [drawerType.boardKey.createdBy]: {
                                                        [drawerType.boardKey.id]: drawerType.piece,
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };
            operate(operation);
            dispatch(roomDrawerModule.actions.set({ dicePieceValueDrawerType: null }));
            setActiveCharacter(undefined);
            setState(defaultDicePieceValue);
        };
    }

    return (
        <Drawer
            {...drawerBaseProps}
            title={stateToCreate == null ? 'ダイスコマの編集' : 'ダイスコマの新規作成'}
            visible={drawerType != null}
            closable
            onClose={() => dispatch(roomDrawerModule.actions.set({ dicePieceValueDrawerType: null }))}
            footer={(
                <DrawerFooter
                    close={({
                        textType: stateToCreate == null ? 'close' : 'cancel',
                        onClick: () => dispatch(roomDrawerModule.actions.set({ dicePieceValueDrawerType: null }))
                    })}
                    ok={onCreate == null ? undefined : ({ textType: 'create', onClick: onCreate })} />)}>
            <div>
                <IdView />
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>所有者</Col>
                    <Col span={inputSpan}>
                        <MyCharactersSelect
                            fixedCharacterId={drawerType?.type === update ? drawerType.characterKey.id : undefined}
                            onSelect={setActiveCharacter} />
                    </Col>
                </Row>
                {dicePieceValueStrIndexes.map(key => {
                    const title = `ダイス${key}`;
                    const value = state.dice[key];

                    if (value == null) {
                        return <>
                            <Typography.Title level={4}>{title}</Typography.Title>
                            <Row gutter={gutter} align='middle'>
                                <Col flex='auto' />
                                <Col flex={0}></Col>
                                <Col span={inputSpan}>
                                    <Button
                                        onClick={() => {
                                            if (drawerType == null) {
                                                return;
                                            }
                                            setState({
                                                ...state,
                                                dice: {
                                                    ...state.dice,
                                                    [key]: {
                                                        $version: 1,
                                                        dieType: 'D6',
                                                        isValuePrivate: false,
                                                        value: null,
                                                    }
                                                }
                                            });
                                        }}>追加</Button>
                                </Col>
                            </Row>
                        </>;
                    }

                    return <>
                        <Typography.Title level={4}>{title}</Typography.Title>
                        <Row gutter={gutter} align='middle'>
                            <Col flex='auto' />
                            <Col flex={0}>値</Col>
                            <Col span={inputSpan}>
                                <InputNumber min={1} max={6} size='small' value={value.value ?? undefined} onChange={e => {
                                    setState({
                                        ...state,
                                        dice: {
                                            ...state.dice,
                                            [key]: {
                                                ...value,
                                                value: e,
                                            }
                                        }
                                    });
                                }} />
                            </Col>
                        </Row>
                        <Row gutter={gutter} align='middle'>
                            <Col flex='auto' />
                            <Col flex={0}>値を非公開にする</Col>
                            <Col span={inputSpan}>
                                <Checkbox
                                    checked={value.isValuePrivate}
                                    onChange={e => setState({
                                        ...state,
                                        dice: {
                                            ...state.dice,
                                            [key]: {
                                                ...value,
                                                isValuePrivate: e.target.checked,
                                            }
                                        }
                                    })} />
                            </Col>
                        </Row>
                    </>;
                })}
            </div>
        </Drawer>
    );
};