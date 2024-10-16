import { Meta, StoryObj } from '@storybook/react';
import React, { PropsWithChildren } from 'react';
import { HelpMessageTooltip, Props } from './HelpMessageTooltip';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';

const Main: React.FC<Props & { compact: boolean } & PropsWithChildren> = props => {
    const { compact, ...restProps } = props;
    return (
        <StorybookProvider roomClientContextValue={null} compact={compact}>
            <HelpMessageTooltip {...restProps} />
        </StorybookProvider>
    );
};

const meta = {
    title: 'UI/HelpMessageTooltip',
    component: Main,
    args: {
        title: 'Title',
        children: 'Children',
        compact: false,
    },
} satisfies Meta<typeof Main>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = ({});

export const Compact: Story = ({
    args:{
    compact: true,
    }
});

export const NoTitle: Story = ({
    args: {
    title: undefined,
    children: 'No title',
    }
});

export const NoChildren: Story = ({
    args: {
    children: undefined,
    }
});

export const Empty: Story = ({
    args: {
    title: undefined,
    children: undefined,
    }
});
