import { Checkbox, Col, Drawer, InputNumber, Row } from 'antd';
import React from 'react';
import DrawerFooter from '../../layouts/DrawerFooter';
import { simpleId } from '../../utils/generators';
import { replace } from '../../stateManagers/states/types';
import { DrawerProps } from 'antd/lib/drawer';
import { Gutter } from 'antd/lib/grid/row';
import { useStateEditor } from '../../hooks/useStateEditor';
import { useOperate } from '../../hooks/useOperate';
import { useMe } from '../../hooks/useMe';
import { NumberPieceValueState, UpOperation, toNumberPieceValueUpOperation, numberPieceValueDiff, CharacterState } from '@kizahasi/flocon-core';
import { compositeKeyToString } from '@kizahasi/util';
import { useNumberPieceValues } from '../../hooks/state/useNumberPieceValues';
import { useDispatch } from 'react-redux';
import { useSelector } from '../../store';
import { create, roomDrawerModule, update } from '../../modules/roomDrawerModule';
import { MyCharactersSelect } from '../../components/MyCharactersSelect';

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

export const NumberPieceValueDrawer: React.FC = () => {
    const drawerType = useSelector(state => state.roomDrawerModule.numberPieceValueDrawerType);
    const dispatch = useDispatch();
    const operate = useOperate();
    const { userUid: myUserUid } = useMe();
    const numberPieceValues = useNumberPieceValues();
    const [activeCharacter, setActiveCharacter] = React.useState<{ key: string; state: CharacterState }>();

    const { state, setState, stateToCreate } = useStateEditor(
        drawerType?.type === update ? numberPieceValues?.find(value => value.characterKey.createdBy === myUserUid)?.value : null,
        defaultNumberPieceValue,
        ({ prevState, nextState }) => {
            if (myUserUid == null || drawerType?.type !== update) {
                return;
            }
            const diff = numberPieceValueDiff({ prevState, nextState });
            if (diff == null) {
                return;
            }
            const operation: UpOperation = {
                $version: 1,
                characters: {
                    [myUserUid]: {
                        [drawerType.characterKey.createdBy]: {
                            type: update,
                            update: {
                                $version: 1,
                                numberPieceValues: {
                                    [drawerType.stateKey]: {
                                        type: update,
                                        update: toNumberPieceValueUpOperation(diff),
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
                                numberPieceValues: {
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
            dispatch(roomDrawerModule.actions.set({ numberPieceValueDrawerType: null }));
            setActiveCharacter(undefined);
            setState(defaultNumberPieceValue);
        };
    }

    return (
        <Drawer
            {...drawerBaseProps}
            title={stateToCreate == null ? '数値コマの編集' : '数値コマの新規作成'}
            visible={drawerType != null}
            closable
            onClose={() => dispatch(roomDrawerModule.actions.set({ numberPieceValueDrawerType: null }))}
            footer={(
                <DrawerFooter
                    close={({
                        textType: stateToCreate == null ? 'close' : 'cancel',
                        onClick: () => dispatch(roomDrawerModule.actions.set({ numberPieceValueDrawerType: null }))
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
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>値</Col>
                    <Col span={inputSpan}>
                        <InputNumber size='small' value={state.value ?? 0} onChange={e => {
                            if (typeof e !== 'number') {
                                return;
                            }
                            setState({ ...state, value: e });
                        }} />
                    </Col>
                </Row>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>値を非公開にする</Col>
                    <Col span={inputSpan}>
                        <Checkbox checked={state.isValuePrivate} onChange={e => setState({ ...state, isValuePrivate: e.target.checked })} />
                    </Col>
                </Row>
            </div>
        </Drawer>
    );
};