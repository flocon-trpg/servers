import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { HelpMessageTooltip, Props } from './HelpMessageTooltip';

const Main: React.FC<Props> = props => {
    return <HelpMessageTooltip {...props} />;
};

export default {
    title: 'UI/HelpMessageTooltip',
    component: Main,
    args: {
        title: 'Title',
        children: 'Children',
    },
} as ComponentMeta<typeof Main>;

const Template: ComponentStory<typeof Main> = args => <Main {...args} />;

export const Default = Template.bind({});

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
