import { Radio } from 'antd';
import React from 'react';

type NonEmptyReadonlyArray<T> = readonly [T, ...T[]];

type Props<T> = {
    style?: React.CSSProperties;
    render: (key: T) => React.ReactNode;
    getName: (key: T) => string;
    keys: NonEmptyReadonlyArray<T>;
    activeKey: T;
    onChange: (newKey: T) => void;
};

export const UISelector = <T,>({ style, render, getName, keys, activeKey, onChange }: Props<T>) => {
    return (
        <div style={style}>
            <Radio.Group value={activeKey} onChange={e => onChange(e.target.value)}>
                {keys.map((key, i) => (
                    <Radio.Button key={i} value={key}>
                        {getName(key)}
                    </Radio.Button>
                ))}
            </Radio.Group>
            {render(activeKey)}
        </div>
    );
};
