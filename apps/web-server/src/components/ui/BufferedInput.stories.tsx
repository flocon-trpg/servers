import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { BufferedInput, OnChangeParams } from './BufferedInput';
import { interval } from 'rxjs';

const Main: React.FC<{ bufferDuration: number | 'default' | 'short' }> = ({ bufferDuration }) => {
    const [changelog, setChangelog] = React.useState<OnChangeParams[]>([]);
    const [value, setValue] = React.useState<string>('init text');
    React.useEffect(() => {
        interval(3000).subscribe(i => {
            setValue('new text ' + i);
        });
    }, []);

    return (
        <div>
            <BufferedInput
                value={value}
                bufferDuration={bufferDuration}
                onChange={e => {
                    setChangelog(state => [...state, e]);
                }}
            />
            <div>
                {changelog.map((log, i) => (
                    <div
                        key={i}
                    >{`previousValue: ${log.previousValue}, currentValue: ${log.currentValue}`}</div>
                ))}
            </div>
        </div>
    );
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'UI/BufferedInput',
    component: Main,
} as ComponentMeta<typeof Main>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Main> = args => <Main {...args} />;

export const Default = Template.bind({});
Default.args = {
    bufferDuration: 'default',
};

export const Short = Template.bind({});
Short.args = {
    bufferDuration: 'short',
};
