import React from 'react';
import { Radio } from 'antd';

type Props = {
    value: boolean;
    onChange: (newValue: boolean) => void;
};

export const IsCellModeSelector: React.FC<Props> = ({ value, onChange }) => {
    return (
        <Radio.Group value={value} onChange={e => onChange(e.target.value)}>
            <Radio.Button value={true}>セルにスナップさせる</Radio.Button>
            <Radio.Button value={false}>セルにスナップさせない</Radio.Button>
        </Radio.Group>
    );
};
