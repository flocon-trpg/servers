import { Meta, StoryObj } from '@storybook/react';
import { Input } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { CollaborativeInput, Props } from './CollaborativeInput';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { flex, flexColumn, flexInitial } from '@/styles/className';

const Main: React.FC<{
    bufferDuration: number | 'default' | 'short';
    multiline?: boolean;
    disabled?: boolean;
    size?: Props['size'];
    placeholder?: string;
    testBottomElement: boolean;
}> = ({ bufferDuration, multiline, disabled, size, placeholder, testBottomElement }) => {
    const [value, setValue] = React.useState<string>(placeholder == null ? 'init text' : '');
    const [bottomElement, setBottomElement] = React.useState<JSX.Element>();

    return (
        <StorybookProvider compact roomClientContextValue={null}>
            <div className={classNames(flex, flexColumn)}>
                <h2>CollaborativeInput</h2>
                <CollaborativeInput
                    value={value}
                    onChange={e => {
                        setValue(e);
                    }}
                    bufferDuration={bufferDuration}
                    multiline={multiline}
                    disabled={disabled}
                    size={size}
                    placeholder={placeholder}
                    onSkipping={
                        testBottomElement
                            ? e =>
                                  setBottomElement(
                                      <div className={classNames(flexInitial)}>
                                          {e.isSkipping ? 'skipping' : 'not skipping'}
                                      </div>,
                                  )
                            : undefined
                    }
                />
                {testBottomElement ? bottomElement : null}
                <h2>↓ これでCollaborativeInput.roomStateTextを変更できる</h2>
                {multiline === true ? (
                    <Input.TextArea value={value} onChange={e => setValue(e.target.value)} />
                ) : (
                    <Input value={value} onChange={e => setValue(e.target.value)} />
                )}
            </div>
        </StorybookProvider>
    );
};

const meta = {
    title: 'UI/CollaborativeInput',
    component: Main,
    args: {
        bufferDuration: 'default',
        testBottomElement: true,
    },
} satisfies Meta<typeof Main>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const PlaceHolder: Story = { args: { placeholder: 'placeholder' } };

export const Medium: Story = { args: { size: 'medium' } };

export const Small: Story = { args: { size: 'small' } };

export const VerySmall: Story = { args: { size: 'verySmall' } };

export const FiveSeconds: Story = {
    args: {
        bufferDuration: 5000,
    },
};

export const Short: Story = {
    args: {
        bufferDuration: 'short',
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
    },
};

export const Multiline: Story = {
    args: {
        multiline: true,
    },
};

export const MultilinePlaceHolder: Story = {
    args: { multiline: true, placeholder: 'placeholder' },
};
