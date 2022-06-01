import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { OnChangeParams } from './CollaborativeInput';
import { interval } from 'rxjs';
import classNames from 'classnames';
import { flex, flex1, flexColumn, flexInitial } from '../../utils/className';
import { TomlInput } from './Tomllnput';

const Main: React.FC<{
    bufferDuration: number | 'default' | 'short' | null;
    placeholder?: string;
    disabled: boolean;
    testUpdate: boolean;
    initText: string;
}> = ({ bufferDuration, placeholder, disabled, testUpdate, initText }) => {
    const [changelog, setChangelog] = React.useState<OnChangeParams[]>([]);
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
            />
            <div className={classNames(flexInitial)}>
                {changelog.slice(-3).map((log, i) => (
                    <div
                        key={i}
                    >{`previousValue: ${log.previousValue}, currentValue: ${log.currentValue}`}</div>
                ))}
            </div>
        </div>
    );
};

export default {
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
} as ComponentMeta<typeof Main>;

const Template: ComponentStory<typeof Main> = args => <Main {...args} />;

export const Default = Template.bind({});

export const ValidToml = Template.bind({});
ValidToml.args = {
    initText: 'n = 1',
};

export const InvalidToml = Template.bind({});
InvalidToml.args = {
    initText: 'this is invalid text!',
};

export const Short = Template.bind({});
Short.args = {
    bufferDuration: 'short',
};

export const NoBuffer = Template.bind({});
NoBuffer.args = {
    bufferDuration: null,
};
