import { Drawer, Input } from 'antd';
import { DrawerProps } from 'antd/lib/drawer';
import { useAtom } from 'jotai';
import React from 'react';
import { editRoomDrawerVisibilityAtom } from '../../atoms/editRoomDrawerVisibilityAtom/editRoomDrawerVisibilityAtom';
import { useSetRoomStateWithImmer } from '../../hooks/useSetRoomStateWithImmer';
import { DialogFooter } from '@/components/ui/DialogFooter/DialogFooter';
import { Table, TableRow } from '@/components/ui/Table/Table';
import { useRoomStateValueSelector } from '@/hooks/useRoomStateValueSelector';

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

export const EditRoomDrawer: React.FC = () => {
    const [editRoomDrawerVisibility, setEditRoomDrawerVisibility] = useAtom(
        editRoomDrawerVisibilityAtom
    );
    const operateAsStateWithImmer = useSetRoomStateWithImmer();
    const name = useRoomStateValueSelector(state => state.name);

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
                        value={name ?? undefined}
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
