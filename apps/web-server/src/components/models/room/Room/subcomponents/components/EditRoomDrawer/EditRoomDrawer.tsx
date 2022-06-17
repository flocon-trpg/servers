import { Drawer, Input } from 'antd';
import React from 'react';
import { DialogFooter } from '@/components/ui/DialogFooter/DialogFooter';
import { DrawerProps } from 'antd/lib/drawer';
import { useSetRoomStateWithImmer } from '@/hooks/useSetRoomStateWithImmer';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { roomAtom } from '@/atoms/roomAtom/roomAtom';
import { editRoomDrawerVisibilityAtom } from '../../atoms/editRoomDrawerVisibilityAtom/editRoomDrawerVisibilityAtom';
import { useAtom } from 'jotai';
import { Table, TableRow } from '@/components/ui/Table/Table';

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

export const EditRoomDrawer: React.FC = () => {
    const [editRoomDrawerVisibility, setEditRoomDrawerVisibility] = useAtom(
        editRoomDrawerVisibilityAtom
    );
    const operateAsStateWithImmer = useSetRoomStateWithImmer();
    const name = useAtomSelector(roomAtom, state => state.roomState?.state?.name);

    return (
        <Drawer
            {...drawerBaseProps}
            title='部屋の設定'
            visible={editRoomDrawerVisibility}
            closable
            onClose={() => setEditRoomDrawerVisibility(false)}
            footer={
                <DialogFooter
                    close={{
                        textType: 'close',
                        onClick: () => setEditRoomDrawerVisibility(false),
                    }}
                />
            }
        >
            <Table>
                <TableRow label='名前'>
                    <Input
                        size='small'
                        value={name}
                        onChange={e => {
                            operateAsStateWithImmer(state => {
                                state.name = e.target.value;
                            });
                        }}
                    />
                </TableRow>
            </Table>
        </Drawer>
    );
};
