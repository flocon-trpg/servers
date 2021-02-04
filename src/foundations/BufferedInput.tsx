import React from 'react';
import { Input } from 'antd';
import { useBuffer } from '../hooks/useBuffer';
import { InputProps } from 'antd/lib/input';

type OnChangeParams = {
    previousValue: string;
    currentValue: string;
    isReset: boolean;
}

export type Props = Omit<InputProps, 'defaultValue' | 'ref' | 'onChange' | 'value'> & {
    value: string;
    valueKey: number;
    // useEffectのdepsに使われているので、BufferedInputを使う際はuseConstantなどを使って固定化するのを忘れないように！
    onChange: (params: OnChangeParams) => void;
};

const BufferedInput: React.FC<Props> = (props: Props) => {
    const {value, valueKey, onChange} = props;
    const [localState, setLocalState] = React.useState<string>(value);
    const buffer = useBuffer(localState, value, valueKey);
    const ref = React.useRef<Input>(null);

    React.useEffect(() => {
        ref.current?.setValue(value);
        setLocalState(value);
    }, [value, valueKey]);

    React.useEffect(() => {
        if (buffer.previousValue == null) {
            return;
        }
        if (buffer.previousValue === buffer.currentValue) {
            return;
        }
        onChange({
            previousValue: buffer.previousValue,
            currentValue: buffer.currentValue,
            isReset: buffer.isReset,
        });
    }, [buffer, onChange]);

    return (
        <Input {...props} value={undefined} ref={ref} defaultValue={value} onChange={e => setLocalState(e.target.value)} />
    );
};

export default BufferedInput;