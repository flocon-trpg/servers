import { Button, Tooltip } from 'antd';
import React from 'react';
import { TableRow } from '@/components/ui/Table/Table';

export const PieceEditorCloneButtonRow: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    return (
        <TableRow>
            {/* TODO: 複製したことを何らかの形で通知したほうがいい */}
            <Tooltip title='このコマを複製します。'>
                <Button size='small' onClick={() => onClick()}>
                    このコマを複製
                </Button>
            </Tooltip>
        </TableRow>
    );
};
