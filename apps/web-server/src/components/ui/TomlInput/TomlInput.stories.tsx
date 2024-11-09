import { Meta, StoryObj } from '@storybook/react';
import classNames from 'classnames';
import React from 'react';
import { interval } from 'rxjs';
import { TomlInput } from './Tomllnput';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { flex, flex1, flexColumn, flexInitial } from '@/styles/className';

const Main: React.FC<{
    bufferDuration: number | 'default' | 'short';
    placeholder?: string;
    disabled: boolean;
    testUpdate: boolean;
    initText: string;
    multiline: boolean;
}> = ({ bufferDuration, placeholder, disabled, testUpdate, initText, multiline }) => {
    const [changelog, setChangelog] = React.useState<string[]>([]);
    const [value, setValue] = React.useState<string>(initText);
    React.useEffect(() => {
        if (!testUpdate) {
            return;
        }
        const subscription = interval(4000).subscribe(i => {
            setValue('new text ' + i);
        });
        return () => subscription.unsubscribe();
    }, [testUpdate]);

    return (
        <StorybookProvider compact roomClientContextValue={null}>
            <div className={classNames(flex, flexColumn)} style={{ height: 300 }}>
                <TomlInput
                    className={classNames(flex1)}
                    value={value}
                    onChange={e => {
                        setChangelog(state => [...state, e]);
                    }}
                    bufferDuration={bufferDuration}
                    placeholder={placeholder}
                    disabled={disabled}
                    multiline={multiline}
                />
                <div className={classNames(flexInitial)}>
                    {changelog.slice(-3).map((log, i) => (
                        <div key={i}>{log}</div>
                    ))}
                </div>
            </div>
        </StorybookProvider>
    );
};

const meta = {
    title: 'UI/TomlInput',
    component: Main,
    args: {
        initText: '',
        bufferDuration: 'default',
        placeholder: 'placeholderです',
        multiline: false,
        disabled: false,
        testUpdate: false,
    },
} satisfies Meta<typeof Main>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Multiline: Story = {
    args: {
        multiline: true,
    },
};

export const ValidToml: Story = {
    args: {
        initText: 'n = 1',
    },
};

export const InvalidToml: Story = {
    args: {
        initText: 'this is invalid text!',
    },
};

export const Short: Story = {
    args: {
        bufferDuration: 'short',
    },
};
