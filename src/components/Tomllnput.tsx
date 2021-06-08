import { isValidVarToml, tomlToCharacterAction } from '@kizahasi/flocon-core';
import React from 'react';
import { useBufferValue } from '../hooks/useBufferValue';
import BufferedTextArea, { Props as BufferedTextAreaProps } from './BufferedTextArea';

export const characterVariable = 'characterVariable';
export const characterCommand = 'characterCommand';

type TomlType = typeof characterVariable | typeof characterCommand

type Props = BufferedTextAreaProps & {
    tomlType: TomlType;
};

type TomlError = {
    type: 'error';
    message: string;
} | {
    type: 'ok';
} | {
    type: 'skip';
}

export const TomlInput: React.FC<Props> = (props: Props) => {
    const { ...inputProps } = props;
    const [currentText, setCurrentText] = React.useState<string>(props.value);
    const { currentValue: bufferedText, isSkipping } = useBufferValue({ value: currentText, bufferDuration: 1000 });
    const validator = React.useCallback((toml: string, tomlType: TomlType): TomlError => {
        switch (tomlType) {
            case characterVariable: {
                const result = isValidVarToml(toml);
                if (result.isError) {
                    return { type: 'error', message: result.error };
                }
                return { type: 'ok' };
            }
            case characterCommand: {
                const result = tomlToCharacterAction(toml);
                if (result.isError) {
                    return { type: 'error', message: result.error };
                }
                return { type: 'ok' };
            }
        }
    }, []);

    const [tomlError, setTomlError] = React.useState<TomlError>(() => validator(props.value, props.tomlType));

    React.useEffect(() => {
        if (isSkipping) {
            setTomlError({ type: 'skip' });
            return;
        }
        setTomlError(validator(bufferedText, props.tomlType));
    }, [bufferedText, isSkipping, props.tomlType, validator]);

    return (<div style={{ display: 'flex', flexDirection: 'column' }}>
        <BufferedTextArea {...inputProps} spellCheck={false} onChangeImmediate={newValue => {
            setCurrentText(newValue);
        }} />
        {tomlError.type === 'error' ? tomlError.message : (tomlError.type === 'ok' ? 'エラーなし' : '不明')}
    </div>);
};