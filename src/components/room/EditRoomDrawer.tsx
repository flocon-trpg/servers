import { Checkbox, Col, Drawer, Form, Input, InputNumber, Row, Space } from 'antd';
import React from 'react';
import DrawerFooter from '../../layouts/DrawerFooter';
import ComponentsStateContext from './contexts/RoomComponentsStateContext';
import DispatchRoomComponentsStateContext from './contexts/DispatchRoomComponentsStateContext';
import OperateContext from './contexts/OperateContext';
import { DrawerProps } from 'antd/lib/drawer';
import { editRoomDrawerVisibility } from './RoomComponentsState';
import { Gutter } from 'antd/lib/grid/row';
import { Room } from '../../stateManagers/states/room';

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

type Props = {
    roomState: Room.State;
}

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

const EditRoomDrawer: React.FC<Props> = ({ roomState }: Props) => {
    const componentsState = React.useContext(ComponentsStateContext);
    const dispatch = React.useContext(DispatchRoomComponentsStateContext);
    const operate = React.useContext(OperateContext);

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
                            value={roomState.name}
                            onChange={e => {
                                const operation = Room.createPostOperationSetup();
                                operation.name = { newValue: e.target.value };
                                operate(operation);
                            }} />
                    </Col>
                </Row>
            </div>
        </Drawer>
    );
};

export default EditRoomDrawer;