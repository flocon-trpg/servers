import React from 'react';
import { CollaborativeInput } from '@/components/ui/CollaborativeInput/CollaborativeInput';
import { HelpMessageTooltip } from '@/components/ui/HelpMessageTooltip/HelpMessageTooltip';
import { TableRow } from '@/components/ui/Table/Table';

export const CardName: React.FC<{
    name: string | undefined;
    onChange?: (newValue: string) => void;
}> = ({ name, onChange }) => {
    return (
        <TableRow
            label={
                <HelpMessageTooltip title="カードの名前を設定できます（例: 「ハートの3」）。省略可。">
                    {'名前'}
                </HelpMessageTooltip>
            }
        >
            <CollaborativeInput
                bufferDuration="default"
                value={name ?? ''}
                disabled={onChange == null}
                onChange={e => {
                    onChange && onChange(e);
                }}
            />
        </TableRow>
    );
};
