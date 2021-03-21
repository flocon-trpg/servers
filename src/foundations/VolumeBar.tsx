import React from 'react';
import { Row, Col, Slider, InputNumber } from 'antd';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {
    value: number;
    onChange: (newValue: number) => void;
};

const VolumeBar: React.FC<Props> = ({ value, onChange }: Props) => {
    return <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Slider
            style={{ flex: 1, minWidth: 50 }}
            min={0}
            max={100}
            step={1}
            onChange={(newValue: unknown) => {
                if (typeof newValue !== 'number') {
                    return;
                }
                onChange(newValue);
            }}
            value={value}
        />
        <InputNumber
            min={0}
            max={100}
            step={1}
            style={{ flex: '100px', margin: '0 16px', minWidth: 50 }}
            value={value}
            onChange={newValue => {
                if (typeof newValue !== 'number') {
                    return;
                }
                onChange(newValue);
            }}
        />
    </div>;
};

export default VolumeBar;