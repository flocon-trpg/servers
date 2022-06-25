import React from 'react';
import { CollaborativeInput } from '@/components/ui/CollaborativeInput/CollaborativeInput';
import { TableRow } from '@/components/ui/Table/Table';

export const PieceEditorNameRow: React.FC<{
    state: string | undefined;
    onChange: (newValue: string) => void;
}> = ({ state, onChange }) => {
    return (
        <TableRow label='名前'>
            <CollaborativeInput
                bufferDuration='default'
                size='small'
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
