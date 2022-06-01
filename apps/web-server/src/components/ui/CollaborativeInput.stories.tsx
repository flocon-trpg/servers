import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { CollaborativeInput, OnChangeParams } from './CollaborativeInput';
import { interval } from 'rxjs';
import classNames from 'classnames';
import { flex, flex1, flexColumn, flexInitial } from '../../utils/className';

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
                                  </div>
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
    );
};

export default {
    title: 'UI/CollaborativeInput',
    component: Main,
    args: {
        bufferDuration: 'default',
        placeholder: 'placeholderです',
        multiline: false,
        disabled: false,
        testUpdate: false,
        testBottomElements: true,
    },
} as ComponentMeta<typeof Main>;

const Template: ComponentStory<typeof Main> = args => <Main {...args} />;

export const Default = Template.bind({});

export const DefaultMultiline = Template.bind({});
DefaultMultiline.args = {
    multiline: true,
};

export const Short = Template.bind({});
Short.args = {
    bufferDuration: 'short',
};

export const NoBuffer = Template.bind({});
NoBuffer.args = {
    bufferDuration: null,
};
