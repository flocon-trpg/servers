import { Radio } from 'antd';
import React from 'react';

type NonEmptyReadonlyArray<T> = readonly [T, ...T[]];

type Props<T> = {
    className?: string;
    style?: React.CSSProperties;
    render: (key: T) => React.ReactNode;
    getName: (key: T) => string;
    keys: NonEmptyReadonlyArray<T>;
    activeKey: T;
    onChange: (newKey: T) => void;
};

export const UISelector = <T,>({
    className,
    style,
    render,
    getName,
    keys,
    activeKey,
    onChange,
}: Props<T>) => {
    return (
        <div className={className} style={style}>
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
