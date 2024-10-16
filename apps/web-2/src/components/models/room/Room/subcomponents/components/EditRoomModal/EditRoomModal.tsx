import { Input, Modal, ModalProps } from 'antd';
import { useAtom } from 'jotai';
import React from 'react';
import { editRoomModalVisibilityAtom } from '../../atoms/editRoomModalVisibilityAtom/editRoomModalVisibilityAtom';
import { useSetRoomStateWithImmer } from '../../hooks/useSetRoomStateWithImmer';
import { DialogFooter } from '@/components/ui/DialogFooter/DialogFooter';
import { Table, TableRow } from '@/components/ui/Table/Table';
import { useRoomStateValueSelector } from '@/hooks/useRoomStateValueSelector';

const modalProps: Partial<ModalProps> = {
    width: 600,
};

export const EditRoomModal: React.FC = () => {
    const [editRoomModalVisibility, setEditRoomModalVisibility] = useAtom(
        editRoomModalVisibilityAtom,
    );
    const operateAsStateWithImmer = useSetRoomStateWithImmer();
    const name = useRoomStateValueSelector(state => state.name);

    return (
        <Modal
            {...modalProps}
            title='部屋の設定'
            open={editRoomModalVisibility}
            closable
            onCancel={() => setEditRoomModalVisibility(false)}
            footer={
                <DialogFooter
                    close={{
                        textType: 'close',
                        onClick: () => setEditRoomModalVisibility(false),
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
        </Modal>
    );
};
