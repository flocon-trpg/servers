import { Col, Drawer, Input, Row } from 'antd';
import React from 'react';
import { DrawerFooter } from '../../layouts/DrawerFooter';
import { DrawerProps } from 'antd/lib/drawer';
import { Gutter } from 'antd/lib/grid/row';
import { useOperate } from '../../hooks/useOperate';
import { useSelector } from '../../store';
import { UpOperation } from '@kizahasi/flocon-core';
import { useDispatch } from 'react-redux';
import { roomDrawerAndPopoverAndModalModule } from '../../modules/roomDrawerAndPopoverAndModalModule';

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

export const EditRoomDrawer: React.FC = () => {
    const editRoomDrawerVisibility = useSelector(
        state => state.roomDrawerAndPopoverAndModalModule.editRoomDrawerVisibility
    );
    const dispatch = useDispatch();
    const operate = useOperate();
    const name = useSelector(state => state.roomModule.roomState?.state?.name);

    return (
        <Drawer
            {...drawerBaseProps}
            title='部屋の設定'
            visible={editRoomDrawerVisibility}
            closable
            onClose={() =>
                dispatch(
                    roomDrawerAndPopoverAndModalModule.actions.set({
                        editRoomDrawerVisibility: false,
                    })
                )
            }
            footer={
                <DrawerFooter
                    close={{
                        textType: 'close',
                        onClick: () =>
                            dispatch(
                                roomDrawerAndPopoverAndModalModule.actions.set({
                                    editRoomDrawerVisibility: false,
                                })
                            ),
                    }}
                />
            }
        >
            <div>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>名前</Col>
                    <Col span={inputSpan}>
                        <Input
                            size='small'
                            value={name}
                            onChange={e => {
                                const operation: UpOperation = {
                                    $v: 2,
                                    name: { newValue: e.target.value },
                                };
                                operate(operation);
                            }}
                        />
                    </Col>
                </Row>
            </div>
        </Drawer>
    );
};
