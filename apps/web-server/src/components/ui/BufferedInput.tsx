import { Input } from 'antd';
import { InputProps, InputRef } from 'antd/lib/input';
import React from 'react';
import { useBuffer } from '../../hooks/useBuffer';

// Inputの制御は、Controlled（useStateなどを用いて値をInputにわたす）ではなくUncontrolled（DOMを直接操作）を採用している。
// 現段階の状態ではControlledでも書けるが、collaborative editingを実現するためにはカーソルの自動移動も必要だと考えられ、この場合はおそらくDOM操作が必須になる。これを見越してUncontrolledで書いている。

export type OnChangeParams = {
    previousValue: string;
    currentValue: string;
};

export type Props = Omit<InputProps, 'defaultValue' | 'value' | 'ref' | 'onChange'> & {
    value: string;
    bufferDuration: number | 'default' | 'short';
    onChange: (params: OnChangeParams) => void;
};

export const BufferedInput: React.FC<Props> = (props: Props) => {
    const { value, bufferDuration: bufferDurationCore, onChange } = props;

    if (bufferDurationCore < 0) {
        throw new Error('bufferDurationCore < 0');
    }

    let bufferDuration: number | null;
    switch (bufferDurationCore) {
        case 'default':
            bufferDuration = 500;
            break;
        case 'short':
            bufferDuration = 100;
            break;
        default:
            bufferDuration = bufferDurationCore === 0 ? null : bufferDurationCore;
            break;
    }

    const { ref, onChangeInput } = useBuffer<string, InputRef>({
        value,
        bufferDuration,
        onChangeOutput: onChange,
        setValueToComponent: ({ value, component }) => {
            if (component.input == null) {
                return;
            }
            component.input.value = value;
        },
    });

    return (
        <Input
            {...props}
            ref={ref}
            defaultValue={undefined}
            onChange={e => {
                onChangeInput(e.currentTarget.value);
            }}
        />
    );
};
