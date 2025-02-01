import React from 'react';
import { CollaborativeInput } from '@/components/ui/CollaborativeInput/CollaborativeInput';
import { HelpMessageTooltip } from '@/components/ui/HelpMessageTooltip/HelpMessageTooltip';
import { TableRow } from '@/components/ui/Table/Table';

export const CardDescription: React.FC<{
    description: string | undefined;
    onChange?: (newValue: string) => void;
}> = ({ description, onChange }) => {
    return (
        <TableRow
            label={
                <HelpMessageTooltip title="カードの説明文を入力できます。省略可。">
                    {'説明文'}
                </HelpMessageTooltip>
            }
        >
            <CollaborativeInput
                bufferDuration="default"
                value={description ?? ''}
                disabled={onChange == null}
                multiline
                onChange={e => {
                    onChange && onChange(e);
                }}
            />
        </TableRow>
    );
};
