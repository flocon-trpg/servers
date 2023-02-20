import { ComponentMeta, ComponentStory } from '@storybook/react';
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

export default {
    title: 'UI/Fieldset',
    component: Default,
    args: {
        compact: false,
    },
} as ComponentMeta<typeof Default>;

const Template: ComponentStory<typeof Default> = args => <Default {...args} />;

export const Compact = Template.bind({});
Compact.args = {
    compact: true,
};
