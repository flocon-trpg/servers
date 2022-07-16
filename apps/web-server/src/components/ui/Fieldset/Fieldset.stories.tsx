import React from 'react';
import { ComponentMeta } from '@storybook/react';
import { Fieldset } from './Fieldset';
import { Calendar } from 'antd';

export const Default: React.FC = () => {
    return (
        <Fieldset legend='タイトル'>
            <Calendar fullscreen={false} />
        </Fieldset>
    );
};

export default {
    title: 'UI/Fieldset',
    component: Default,
} as ComponentMeta<typeof Default>;
