import React from 'react';
import { CollaborativeInput } from '@/components/ui/CollaborativeInput/CollaborativeInput';
import { TableRow } from '@/components/ui/Table/Table';

export const PieceEditorMemoRow: React.FC<{
    state: string | undefined;
    onChange: (newValue: string) => void;
}> = ({ state, onChange }) => {
    return (
        <TableRow label='メモ'>
            <CollaborativeInput
                style={{ height: 100 }}
                multiline
                size='small'
                bufferDuration='default'
                value={state ?? ''}
                onChange={e => {
                    if (e.previousValue === e.currentValue) {
                        return;
                    }
                    onChange(e.currentValue);
                }}
            />
        </TableRow>
    );
};
