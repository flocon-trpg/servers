import { Button, Col, Drawer, Form, Input, Row, Space } from 'antd';
import React from 'react';
import DrawerFooter from '../../layouts/DrawerFooter';
import * as Room from '../../stateManagers/states/room';
import ComponentsStateContext from './contexts/RoomComponentsStateContext';
import OperateContext from './contexts/OperateContext';
import DispatchRoomComponentsStateContext from './contexts/DispatchRoomComponentsStateContext';
import InputModal from '../InputModal';
import { characterParameterNamesDrawerVisibility } from './RoomComponentsState';
import produce from 'immer';
import { StrIndex100, strIndex100Array, strIndex20Array } from '../../@shared/indexes';
import { RoomParameterNameType } from '../../generated/graphql';
import { replace } from '../../stateManagers/states/types';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

type Props = {
    roomState: Room.State;
}

type VisibleParameterForm = {
    type: RoomParameterNameType;
    key: StrIndex100;
}

type ParameterFormValues = {
    num: Map<StrIndex100, string>;
    bool: Map<StrIndex100, string>;
    str: Map<StrIndex100, string>;
}

const CharacterParameterNamesDrawer: React.FC<Props> = ({ roomState }: Props) => {
    const operate = React.useContext(OperateContext);
    const componentsState = React.useContext(ComponentsStateContext);
    const dispatch = React.useContext(DispatchRoomComponentsStateContext);
    const [visibleParameterForm, setVisibleParameterForm] = React.useState<VisibleParameterForm>();

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
                {
                    strIndex20Array.map(key => {
                        const state = roomState.paramNames.get({ key, type: RoomParameterNameType.Num });
                        return (
                            <Form.Item
                                key={`numParameter${key}`}
                                label={`数値パラメーター${key}`}
                                name={`numParameter${key}`}>
                                <Space>
                                    {state == null ? <Input size='small' disabled /> :
                                        <Input
                                            size='small'
                                            value={state.name}
                                            onChange={e => {
                                                const operation = Room.createPostOperationSetup();
                                                operation.paramNames.set({ key, type: RoomParameterNameType.Num }, { type: replace, newValue: { name: e.target.value } });
                                                operate(operation);
                                            }} />}
                                    <Button
                                        size='small'
                                        onClick={() => {
                                            if (state == null) {
                                                setVisibleParameterForm({
                                                    type: RoomParameterNameType.Num,
                                                    key,
                                                });
                                                return;
                                            }
                                            const operation = Room.createPostOperationSetup();
                                            operation.paramNames.set({ key, type: RoomParameterNameType.Num }, { type: replace, newValue: undefined });
                                            operate(operation);
                                        }} >
                                        {state == null ? <PlusOutlined /> : <DeleteOutlined />}
                                    </Button>
                                </Space>
                            </Form.Item>
                        );
                    })
                }
                {
                    strIndex20Array.map(key => {
                        const state = roomState.paramNames.get({ key, type: RoomParameterNameType.Bool });
                        return (
                            <Form.Item
                                key={`boolParameter${key}`}
                                label={`チェックマークパラメーター${key}`}
                                name={`boolParameter${key}`}>
                                <Space>
                                    {state == null ? <Input disabled /> :
                                        <Input
                                            value={state.name}
                                            onChange={e => {
                                                const operation = Room.createPostOperationSetup();
                                                operation.paramNames.set({ key, type: RoomParameterNameType.Bool }, { type: replace, newValue: { name: e.target.value } });
                                                operate(operation);
                                            }} />}
                                    <Button
                                        onClick={() => {
                                            if (state == null) {
                                                setVisibleParameterForm({
                                                    type: RoomParameterNameType.Bool,
                                                    key,
                                                });
                                                return;
                                            }
                                            const operation = Room.createPostOperationSetup();
                                            operation.paramNames.set({ key, type: RoomParameterNameType.Bool }, { type: replace, newValue: undefined });
                                            operate(operation);
                                        }} >
                                        {state == null ? <PlusOutlined /> : <DeleteOutlined />}
                                    </Button>
                                </Space>
                            </Form.Item>
                        );
                    })
                }
                {
                    strIndex20Array.map(key => {
                        const state = roomState.paramNames.get({ key, type: RoomParameterNameType.Str });
                        return (
                            <Form.Item
                                key={`strParameter${key}`}
                                label={`文字列パラメーター${key}`}
                                name={`strParameter${key}`}>
                                <Space>
                                    {state == null ? <Input disabled /> :
                                        <Input
                                            value={state.name}
                                            onChange={e => {
                                                const operation = Room.createPostOperationSetup();
                                                operation.paramNames.set({ key, type: RoomParameterNameType.Str }, { type: replace, newValue: { name: e.target.value } });
                                                operate(operation);
                                            }} />}
                                    <Button
                                        onClick={() => {
                                            if (state == null) {
                                                setVisibleParameterForm({
                                                    type: RoomParameterNameType.Str,
                                                    key,
                                                });
                                                return;
                                            }
                                            const operation = Room.createPostOperationSetup();
                                            operation.paramNames.set({ key, type: RoomParameterNameType.Str }, { type: replace, newValue: undefined });
                                            operate(operation);
                                        }} >
                                        {state == null ? <PlusOutlined /> : <DeleteOutlined />}
                                    </Button>
                                </Space>
                            </Form.Item>
                        );
                    })
                }
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
                    setVisibleParameterForm(undefined);
                }}
                disabled={value => value.trim() === ''}
                onClose={() => setVisibleParameterForm(undefined)} />}
        </Drawer>
    );
};

export default CharacterParameterNamesDrawer;