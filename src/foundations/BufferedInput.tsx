import React from 'react';
import { Input } from 'antd';
import { useBuffer } from '../hooks/useBuffer';
import { InputProps } from 'antd/lib/input';

export type OnChangeParams = {
    previousValue: string;
    currentValue: string;
    isReset: boolean;
}

export type Props = Omit<InputProps, 'defaultValue' | 'ref' | 'onChange' | 'value'> & {
    value: string;
    valueResetKey: number;
    onChange: (params: OnChangeParams) => void;
};

const BufferedInput: React.FC<Props> = (props: Props) => {
    const {value, valueResetKey: valueResetKey, onChange} = props;
    const [localState, setLocalState] = React.useState<string>(value);
    const buffer = useBuffer(localState, value, valueResetKey);
    const ref = React.useRef<Input>(null);

    React.useEffect(() => {
        ref.current?.setValue(value);
        setLocalState(value);
    }, [value, valueResetKey]);

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
    }, [buffer]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <Input {...props} value={undefined} ref={ref} defaultValue={value} onChange={e => setLocalState(e.target.value)} />
    );
};

export default BufferedInput;