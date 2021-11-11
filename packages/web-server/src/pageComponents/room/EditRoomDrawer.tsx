import { Col, Drawer, Input, Row } from 'antd';
import React from 'react';
import { DrawerFooter } from '../../layouts/DrawerFooter';
import { DrawerProps } from 'antd/lib/drawer';
import { Gutter } from 'antd/lib/grid/row';
import { useSelector } from '../../store';
import { useDispatch } from 'react-redux';
import { roomDrawerAndPopoverAndModalModule } from '../../modules/roomDrawerAndPopoverAndModalModule';
import { useOperateAsStateWithImmer } from '../../hooks/useOperateAsStateWithImmer';
import produce from 'immer';
import { useAtomSelector } from '../../atoms/useAtomSelector';
import { roomAtom } from '../../atoms/room/roomAtom';

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
    const operateAsStateWithImmer = useOperateAsStateWithImmer();
    const name = useAtomSelector(roomAtom, state => state.roomState?.state?.name);

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
                                operateAsStateWithImmer(state => {
                                    state.name = e.target.value;
                                });
                            }}
                        />
                    </Col>
                </Row>
            </div>
        </Drawer>
    );
};
