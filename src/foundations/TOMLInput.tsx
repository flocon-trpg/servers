import React, { useCallback } from 'react';
import { TOML } from '../@shared/flocommand';
import { useBufferValue } from '../hooks/useBufferValue';
import BufferedTextArea, { OnChangeParams, Props as BufferedTextAreaProps } from './BufferedTextArea';

type Props = BufferedTextAreaProps;

type TOMLError = {
    type: 'error';
    message: string;
} | {
    type: 'ok';
} | {
    type: 'skip';
}

export const TOMLInput: React.FC<Props> = (props: Props) => {
    const { ...inputProps } = props;
    const [currentText, setCurrentText] = React.useState<string>(props.value);
    const { currentValue: bufferedText, isSkipping } = useBufferValue({ value: currentText, bufferDuration: 1000 });

    const [tomlError, setTomlError] = React.useState<TOMLError>({ type: 'skip' });

    React.useEffect(() => {
        if (isSkipping) {
            setTomlError({ type: 'skip' });
            return;
        }
        const result = TOML.isValidVarToml(bufferedText);
        if (result.isError) {
            setTomlError({ type: 'error', message: result.error });
            return;
        }
        setTomlError({ type: 'ok' });
    }, [bufferedText, isSkipping]);

    return (<div style={{ display: 'flex', flexDirection: 'column' }}>
        <BufferedTextArea {...inputProps} onChangeImmediate={newValue => {
            setCurrentText(newValue);
        }} />
        {tomlError.type === 'error' ? tomlError.message : (tomlError.type === 'ok' ? 'エラーなし' : '不明')}
    </div>);
};