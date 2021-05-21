import { Checkbox, Col, Drawer, InputNumber, Row } from 'antd';
import React from 'react';
import DrawerFooter from '../../layouts/DrawerFooter';
import ComponentsStateContext from './contexts/RoomComponentsStateContext';
import DispatchRoomComponentsStateContext from './contexts/DispatchRoomComponentsStateContext';
import { simpleId } from '../../utils/generators';
import { replace } from '../../stateManagers/states/types';
import { DrawerProps } from 'antd/lib/drawer';
import { create, myNumberValueDrawerType, update } from './RoomComponentsState';
import { Gutter } from 'antd/lib/grid/row';
import { useStateEditor } from '../../hooks/useStateEditor';
import { compositeKeyToString } from '../../@shared/StateMap';
import { __ } from '../../@shared/collection';
import { useOperate } from '../../hooks/useOperate';
import { useMe } from '../../hooks/useMe';
import * as Room from '../../@shared/ot/room/v1';
import * as MyNumberValue from '../../@shared/ot/room/participant/myNumberValue/v1';

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

const defaultMyNumberValue: MyNumberValue.State = {
    $version: 1,
    value: 0,
    isValuePrivate: false,
    pieces: {},
};

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

const MyNumberValueDrawer: React.FC = () => {
    const componentsState = React.useContext(ComponentsStateContext);
    const dispatch = React.useContext(DispatchRoomComponentsStateContext);
    const operate = useOperate();
    const { participant: me, userUid: myUserUid } = useMe();

    const drawerType = componentsState.myNumberValueDrawerType;

    const { state, setState, stateToCreate } = useStateEditor(drawerType?.type === update ? (me?.myNumberValues ?? {})[drawerType.stateKey] : null, defaultMyNumberValue, ({ prevState, nextState }) => {
        if (myUserUid == null || drawerType?.type !== update) {
            return;
        }
        const diff = MyNumberValue.diff({ prevState, nextState });
        if (diff == null) {
            return;
        }
        const operation: Room.UpOperation = {
            $version: 1,
            participants: {
                [myUserUid]: {
                    type: update,
                    update: {
                        $version: 1,
                        myNumberValues: {
                            [drawerType.stateKey]: {
                                type: update,
                                update: MyNumberValue.toUpOperation(diff),
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
            if (componentsState.myNumberValueDrawerType?.type !== create) {
                return;
            }

            const id = simpleId();
            const operation: Room.UpOperation = {
                $version: 1,
                participants: {
                    [myUserUid]: {
                        type: update,
                        update: {
                            $version: 1,
                            myNumberValues: {
                                [id]: {
                                    type: replace,
                                    replace: {
                                        newValue: {
                                            ...stateToCreate,
                                            pieces: componentsState.myNumberValueDrawerType.boardKey == null ? {} : {
                                                [componentsState.myNumberValueDrawerType.boardKey.createdBy]: {
                                                    [componentsState.myNumberValueDrawerType.boardKey.id]: componentsState.myNumberValueDrawerType.piece,
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
            dispatch({ type: myNumberValueDrawerType, newValue: null });
        };
    }

    return (
        <Drawer
            {...drawerBaseProps}
            title={stateToCreate === undefined ? '数値コマの新規作成' : '数値コマの編集'}
            visible={drawerType != null}
            closable
            onClose={() => dispatch({ type: myNumberValueDrawerType, newValue: null })}
            footer={(
                <DrawerFooter
                    close={({
                        textType: stateToCreate === undefined ? 'close' : 'cancel',
                        onClick: () => dispatch({ type: myNumberValueDrawerType, newValue: null })
                    })}
                    ok={onCreate == null ? undefined : ({ textType: 'create', onClick: onCreate })} />)}>
            <div>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>ID</Col>
                    <Col span={inputSpan}>
                        {drawerType?.type === update ? compositeKeyToString({ createdBy: myUserUid, id: drawerType.stateKey }) : '(なし)'}
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

export default MyNumberValueDrawer;