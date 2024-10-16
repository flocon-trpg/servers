import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Fieldset } from './Fieldset';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';

export const Default: React.FC<{ compact: boolean }> = ({ compact }) => {
    return (
        <StorybookProvider compact={compact} roomClientContextValue={null}>
            <Fieldset legend='タイトル'>
                <div style={{ width: 400, height: 300, background: 'green', color: 'white' }}>
                    children
                </div>
            </Fieldset>
        </StorybookProvider>
    );
};

const meta = {
    title: 'UI/Fieldset',
    component: Default,
    args: {
        compact: false,
    },
} satisfies Meta<typeof Default>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Compact: Story = ({
    args: {
    compact: true,
    }
});
