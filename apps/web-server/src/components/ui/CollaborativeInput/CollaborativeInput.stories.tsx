import { Meta, StoryObj } from '@storybook/react';
import classNames from 'classnames';
import React from 'react';
import { interval } from 'rxjs';
import { CollaborativeInput, OnChangeParams } from './CollaborativeInput';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { flex, flex1, flexColumn, flexInitial } from '@/styles/className';

const Main: React.FC<{
    bufferDuration: number | 'default' | 'short' | null;
    placeholder?: string;
    disabled: boolean;
    multiline: boolean;
    testUpdate: boolean;
    testBottomElement: boolean;
}> = ({ bufferDuration, placeholder, disabled, multiline, testUpdate, testBottomElement }) => {
    const [changelog, setChangelog] = React.useState<OnChangeParams[]>([]);
    const [value, setValue] = React.useState<string>('init text');
    const [bottomElement, setBottomElement] = React.useState<JSX.Element>();
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
            <div
                className={classNames(flex, flexColumn)}
                style={multiline ? { height: 300 } : undefined}
            >
                <CollaborativeInput
                    className={classNames(flex1)}
                    style={multiline ? { overflow: 'auto' } : undefined}
                    value={value}
                    multiline={multiline}
                    onChange={e => {
                        setChangelog(state => [...state, e]);
                    }}
                    bufferDuration={bufferDuration}
                    placeholder={placeholder}
                    disabled={disabled}
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
                <div className={classNames(flexInitial)}>
                    {changelog.slice(-3).map((log, i) => (
                        <div
                            key={i}
                        >{`previousValue: ${log.previousValue}, currentValue: ${log.currentValue}`}</div>
                    ))}
                </div>
            </div>
        </StorybookProvider>
    );
};

const meta = {
    title: 'UI/CollaborativeInput',
    component: Main,
    args: {
        bufferDuration: 'default',
        placeholder: 'placeholderです',
        multiline: false,
        disabled: false,
        testUpdate: false,
        testBottomElement: true,
    },
} satisfies Meta<typeof Main>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DefaultMultiline: Story = {
    args: {
        multiline: true,
    },
};

export const Short: Story = {
    args: {
        bufferDuration: 'short',
    },
};

export const NoBuffer: Story = {
    args: {
        bufferDuration: null,
    },
};
