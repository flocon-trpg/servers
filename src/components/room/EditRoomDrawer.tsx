import { Checkbox, Col, Drawer, Form, Input, InputNumber, Row, Space } from 'antd';
import React from 'react';
import DrawerFooter from '../../layouts/DrawerFooter';
import ComponentsStateContext from './contexts/RoomComponentsStateContext';
import DispatchRoomComponentsStateContext from './contexts/DispatchRoomComponentsStateContext';
import { DrawerProps } from 'antd/lib/drawer';
import { editRoomDrawerVisibility } from './RoomComponentsState';
import { Gutter } from 'antd/lib/grid/row';
import { useOperate } from '../../hooks/useOperate';
import { useSelector } from '../../store';
import { UpOperation } from '@kizahasi/flocon-core';

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

const EditRoomDrawer: React.FC = () => {
    const componentsState = React.useContext(ComponentsStateContext);
    const dispatch = React.useContext(DispatchRoomComponentsStateContext);
    const operate = useOperate();
    const name = useSelector(state => state.roomModule.roomState?.state?.name);

    return (
        <Drawer
            {...drawerBaseProps}
            title='部屋の設定'
            visible={componentsState.editRoomDrawerVisibility}
            closable
            onClose={() => dispatch({ type: editRoomDrawerVisibility, newValue: false })}
            footer={(
                <DrawerFooter
                    close={({
                        textType: 'close',
                        onClick: () => dispatch({ type: editRoomDrawerVisibility, newValue: false })
                    })} />)}>
            <div>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>名前</Col>
                    <Col span={inputSpan}>
                        <Input size='small'
                            value={name}
                            onChange={e => {
                                const operation: UpOperation = {
                                    $version: 1,
                                    name: { newValue: e.target.value },
                                };
                                operate(operation);
                            }} />
                    </Col>
                </Row>
            </div>
        </Drawer>
    );
};

export default EditRoomDrawer;