import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { HelpMessageTooltip, Props } from './HelpMessageTooltip';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';

const Main: React.FC<Props & { compact: boolean }> = props => {
    const { compact, ...restProps } = props;
    return (
        <StorybookProvider roomClientContextValue={null} compact={compact}>
            <HelpMessageTooltip {...restProps} />
        </StorybookProvider>
    );
};

export default {
    title: 'UI/HelpMessageTooltip',
    component: Main,
    args: {
        title: 'Title',
        children: 'Children',
        compact: false,
    },
} as ComponentMeta<typeof Main>;

const Template: ComponentStory<typeof Main> = args => <Main {...args} />;

export const Default = Template.bind({});

export const Compact = Template.bind({});
Compact.args = {
    compact: true,
};

export const NoTitle = Template.bind({});
NoTitle.args = {
    title: undefined,
    children: 'No title',
};

export const NoChildren = Template.bind({});
NoChildren.args = {
    children: undefined,
};

export const Empty = Template.bind({});
Empty.args = {
    title: undefined,
    children: undefined,
};
