import { ComponentMeta } from '@storybook/react';
import React from 'react';
import { Fieldset } from './Fieldset';

export const Default: React.FC = () => {
    return (
        <Fieldset legend='タイトル'>
            <div style={{ width: 400, height: 300, background: 'green', color: 'white' }}>
                children
            </div>
        </Fieldset>
    );
};

export default {
    title: 'UI/Fieldset',
    component: Default,
} as ComponentMeta<typeof Default>;
