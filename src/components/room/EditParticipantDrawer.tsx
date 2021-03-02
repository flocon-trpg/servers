import React from 'react';
import { DrawerProps } from 'antd/lib/drawer';
import { Gutter } from 'antd/lib/grid/row';
import DispatchRoomComponentsStateContext from './contexts/DispatchRoomComponentsStateContext';
import OperateContext from './contexts/OperateContext';
import ComponentsStateContext from './contexts/RoomComponentsStateContext';
import { Col, Drawer, Input, Row } from 'antd';
import DrawerFooter from '../../layouts/DrawerFooter';
import { editParticipantDrawerVisibility } from './RoomComponentsState';
import { Participant } from '../../stateManagers/states/participant';
import { Room } from '../../stateManagers/states/room';

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

type Props = {
    me: Participant.State;
}

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

const EditRoomDrawer: React.FC<Props> = ({ me }: Props) => {
    const componentsState = React.useContext(ComponentsStateContext);
    const dispatch = React.useContext(DispatchRoomComponentsStateContext);
    const operate = React.useContext(OperateContext);

    // TODO: 作る
    return (
        <Drawer
            {...drawerBaseProps}
            title='部屋の設定'
            visible={componentsState.editParticipantDrawerVisibility}
            closable
            onClose={() => dispatch({ type: editParticipantDrawerVisibility, newValue: false })}
            footer={(
                <DrawerFooter
                    close={({
                        textType: 'close',
                        onClick: () => dispatch({ type: editParticipantDrawerVisibility, newValue: false })
                    })} />)}>
            <div>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>名前</Col>
                    <Col span={inputSpan}>
                        <Input size='small'
                            value={me.name}
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