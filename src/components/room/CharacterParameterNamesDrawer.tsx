import { Button, Col, Collapse, Drawer, Form, Input, Row, Select, Space } from 'antd';
import React from 'react';
import DrawerFooter from '../../layouts/DrawerFooter';
import * as Room from '../../stateManagers/states/room';
import ComponentsStateContext from './contexts/RoomComponentsStateContext';
import OperateContext from './contexts/OperateContext';
import DispatchRoomComponentsStateContext from './contexts/DispatchRoomComponentsStateContext';
import InputModal from '../InputModal';
import { characterParameterNamesDrawerVisibility } from './RoomComponentsState';
import produce from 'immer';
import { isStrIndex20, StrIndex100, strIndex100Array, StrIndex20, strIndex20Array } from '../../@shared/indexes';
import { RoomParameterNameType } from '../../generated/graphql';
import { replace, update } from '../../stateManagers/states/types';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import CollaborativeInput from '../../foundations/CollaborativeInput';

type Props = {
    roomState: Room.State;
}

type VisibleParameterForm = {
    type: RoomParameterNameType;
    key: StrIndex100;
}

const CharacterParameterNamesDrawer: React.FC<Props> = ({ roomState }: Props) => {
    const operate = React.useContext(OperateContext);
    const componentsState = React.useContext(ComponentsStateContext);
    const dispatch = React.useContext(DispatchRoomComponentsStateContext);
    const [visibleParameterForm, setVisibleParameterForm] = React.useState<VisibleParameterForm>();
    const [addNumParamSelector, setAddNumParamSelector] = React.useState<StrIndex20>();
    const [addBoolParamSelector, setAddBoolParamSelector] = React.useState<StrIndex20>();
    const [addStrParamSelector, setAddStrParamSelector] = React.useState<StrIndex20>();

    const modalTitle = (() => {
        if (visibleParameterForm == null) {
            return '';
        }
        let type = '';
        switch (visibleParameterForm.type) {
            case RoomParameterNameType.Num:
                type = '数値';
                break;
            case RoomParameterNameType.Bool:
                type = 'チェックマーク';
                break;
            case RoomParameterNameType.Str:
                type = '文字列';
                break;
        }
        return `${type}パラメーター${visibleParameterForm.key}の名前を設定`;
    })();

    const formItemStyle: React.CSSProperties = { margin: 0 }; // margin-bottomのデフォルト値(24px)を上書きさせている

    const createNumParamName = (key: StrIndex20) => {
        const state = roomState.paramNames.get({ key, type: RoomParameterNameType.Num });
        if (state == null) {
            return null;
        }
        return (
            <Form.Item
                key={`numParameter${key}`}
                style={formItemStyle}
                label={`数値パラメーター${key}`}
                name={`numParameter${key}`}>
                <Space>
                    <Input
                        size='small'
                        value={state.name}
                        onChange={e => {
                            const operation = Room.createPostOperationSetup();
                            operation.paramNames.set({ key, type: RoomParameterNameType.Num }, { type: update, operation: { name: { newValue: e.target.value } } });
                            operate(operation);
                        }} />
                    <Button
                        size='small'
                        onClick={() => {
                            const operation = Room.createPostOperationSetup();
                            operation.paramNames.set({ key, type: RoomParameterNameType.Num }, { type: replace, newValue: undefined });
                            operate(operation);
                        }} >
                        <DeleteOutlined />
                    </Button>
                </Space>
            </Form.Item>
        );
    };

    const createBoolParamName = (key: StrIndex20) => {
        const state = roomState.paramNames.get({ key, type: RoomParameterNameType.Bool });
        if (state == null) {
            return null;
        }
        return (
            <Form.Item
                key={`boolParameter${key}`}
                style={formItemStyle}
                label={`チェックマークパラメーター${key}`}
                name={`boolParameter${key}`}>
                <Space>
                    <Input
                        size='small'
                        value={state.name}
                        onChange={e => {
                            const operation = Room.createPostOperationSetup();
                            operation.paramNames.set({ key, type: RoomParameterNameType.Bool }, { type: update, operation: { name: { newValue: e.target.value } } });
                            operate(operation);
                        }} />
                    <Button
                        size='small'
                        onClick={() => {
                            const operation = Room.createPostOperationSetup();
                            operation.paramNames.set({ key, type: RoomParameterNameType.Bool }, { type: replace, newValue: undefined });
                            operate(operation);
                        }} >
                        <DeleteOutlined />
                    </Button>
                </Space>
            </Form.Item>
        );
    };

    const createStrParamName = (key: StrIndex20) => {
        const state = roomState.paramNames.get({ key, type: RoomParameterNameType.Str });
        if (state == null) {
            return null;
        }
        return (
            <Form.Item
                key={`strParameter${key}`}
                style={formItemStyle}
                label={`文字列パラメーター${key}`}
                name={`strParameter${key}`}>
                <Space>
                    <CollaborativeInput
                        size='small'
                        value={state.name}
                        bufferDuration={200}
                        onChange={e => {
                            if (e.previousValue === e.currentValue) {
                                return;
                            }
                            const operation = Room.createPostOperationSetup();
                            operation.paramNames.set({ key, type: RoomParameterNameType.Str }, { type: update, operation: { name: { newValue: e.currentValue } } });
                            operate(operation);
                        }} />
                    <Button
                        size='small'
                        onClick={() => {
                            const operation = Room.createPostOperationSetup();
                            operation.paramNames.set({ key, type: RoomParameterNameType.Str }, { type: replace, newValue: undefined });
                            operate(operation);
                        }} >
                        <DeleteOutlined />
                    </Button>
                </Space>
            </Form.Item>
        );
    };

    return (
        <Drawer
            title="キャラクターのパラメーター名の追加・編集・削除"
            width={600}
            visible={componentsState.characterParameterNamesDrawerVisibility}
            closable
            onClose={() => dispatch({ type: characterParameterNamesDrawerVisibility, newValue: false })}
            footer={(
                <DrawerFooter
                    close={({
                        textType: 'close',
                        onClick: () => dispatch({ type: characterParameterNamesDrawerVisibility, newValue: false })
                    })} />)}>
            <Form>
                <Collapse defaultActiveKey={['num', 'str', 'bool']}>
                    <Collapse.Panel header='数値パラメーター' key='num'>
                        {
                            strIndex20Array.map(createNumParamName)
                        }
                        {
                            strIndex20Array.filter(key => roomState.paramNames.has({ key, type: RoomParameterNameType.Num })).length === 0 ? null : <div style={({ padding: 6 })} />
                        }
                        <div style={({ display: 'flex', flexDirection: 'row' })}>
                            <Select
                                style={({ minWidth: 150 })}
                                size='small'
                                value={addNumParamSelector}
                                onSelect={newValue => {
                                    setAddNumParamSelector(newValue);
                                }}
                                onDeselect={() => {
                                    setAddNumParamSelector(undefined);
                                }}>
                                {strIndex20Array.map(key => {
                                    const hasKey = roomState.paramNames.has({ key, type: RoomParameterNameType.Num });
                                    if (hasKey) {
                                        return null;
                                    }
                                    return <Select.Option key={key} value={key}>{`パラメーター${key}`}</Select.Option>;
                                })}
                            </Select>
                            <Button
                                size='small'
                                disabled={addNumParamSelector == null}
                                onClick={() => {
                                    if (addNumParamSelector == null) {
                                        return;
                                    }
                                    const hasKey = roomState.paramNames.has({ key: addNumParamSelector, type: RoomParameterNameType.Num });
                                    if (hasKey) {
                                        return null;
                                    }
                                    setVisibleParameterForm({
                                        type: RoomParameterNameType.Num,
                                        key: addNumParamSelector,
                                    });
                                }}>
                                追加
                            </Button>
                        </div>
                    </Collapse.Panel>
                    <Collapse.Panel header='チェックマークパラメーター' key='bool'>
                        {
                            strIndex20Array.map(createBoolParamName)
                        }
                        {
                            strIndex20Array.filter(key => roomState.paramNames.has({ key, type: RoomParameterNameType.Bool })).length === 0 ? null : <div style={({ padding: 6 })} />
                        }
                        <div style={({ display: 'flex', flexDirection: 'row' })}>
                            <Select
                                style={({ minWidth: 150 })}
                                size='small'
                                value={addNumParamSelector}
                                onSelect={newValue => {
                                    setAddBoolParamSelector(newValue);
                                }}
                                onDeselect={() => {
                                    setAddBoolParamSelector(undefined);
                                }}>
                                {strIndex20Array.map(key => {
                                    const hasKey = roomState.paramNames.has({ key, type: RoomParameterNameType.Bool });
                                    if (hasKey) {
                                        return null;
                                    }
                                    return <Select.Option key={key} value={key}>{`パラメーター${key}`}</Select.Option>;
                                })}
                            </Select>
                            <Button
                                size='small'
                                disabled={addBoolParamSelector == null}
                                onClick={() => {
                                    if (addBoolParamSelector == null) {
                                        return;
                                    }
                                    const hasKey = roomState.paramNames.has({ key: addBoolParamSelector, type: RoomParameterNameType.Bool });
                                    if (hasKey) {
                                        return null;
                                    }
                                    setVisibleParameterForm({
                                        type: RoomParameterNameType.Bool,
                                        key: addBoolParamSelector,
                                    });
                                }}>
                                追加
                            </Button>
                        </div>
                    </Collapse.Panel>
                    <Collapse.Panel header='文字列パラメーター' key='str'>
                        {
                            strIndex20Array.map(createStrParamName)
                        }
                        {
                            strIndex20Array.filter(key => roomState.paramNames.has({ key, type: RoomParameterNameType.Str })).length === 0 ? null : <div style={({ padding: 6 })} />
                        }
                        <div style={({ display: 'flex', flexDirection: 'row' })}>
                            <Select
                                style={({ minWidth: 150 })}
                                size='small'
                                value={addStrParamSelector}
                                onSelect={newValue => {
                                    setAddStrParamSelector(newValue);
                                }}
                                onDeselect={() => {
                                    setAddStrParamSelector(undefined);
                                }}>
                                {strIndex20Array.map(key => {
                                    const hasKey = roomState.paramNames.has({ key, type: RoomParameterNameType.Str });
                                    if (hasKey) {
                                        return null;
                                    }
                                    return <Select.Option key={key} value={key}>{`パラメーター${key}`}</Select.Option>;
                                })}
                            </Select>
                            <Button
                                size='small'
                                disabled={addStrParamSelector == null}
                                onClick={() => {
                                    if (addStrParamSelector == null) {
                                        return;
                                    }
                                    const hasKey = roomState.paramNames.has({ key: addStrParamSelector, type: RoomParameterNameType.Str });
                                    if (hasKey) {
                                        return null;
                                    }
                                    setVisibleParameterForm({
                                        type: RoomParameterNameType.Str,
                                        key: addStrParamSelector,
                                    });
                                }}>
                                追加
                            </Button>
                        </div>
                    </Collapse.Panel>
                </Collapse>
            </Form>
            { operate == null ? null : <InputModal
                title={modalTitle}
                visible={visibleParameterForm != null}
                onOk={value => {
                    if (visibleParameterForm == null) {
                        return;
                    }
                    const operation = Room.createPostOperationSetup();
                    operation.paramNames.set({ key: visibleParameterForm.key, type: visibleParameterForm.type }, { type: replace, newValue: { name: value } });
                    operate(operation);
                    switch (visibleParameterForm.type) {
                        case RoomParameterNameType.Num:
                            setAddNumParamSelector(undefined);
                            break;
                    }
                    setVisibleParameterForm(undefined);
                }}
                disabled={value => value.trim() === ''}
                onClose={() => setVisibleParameterForm(undefined)} />}
        </Drawer>
    );
};

export default CharacterParameterNamesDrawer;