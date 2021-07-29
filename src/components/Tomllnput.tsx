import { isValidVarToml } from '@kizahasi/flocon-core';
import React from 'react';
import {
    BufferedTextArea,
    BottomElementParams,
    Props as BufferedTextAreaProps,
} from './BufferedTextArea';

type Props = Omit<BufferedTextAreaProps, 'spellCheck'>;

export const TomlInput: React.FC<Props> = (props: Props) => {
    const { ...inputProps } = props;
    const bottomElement = (params: BottomElementParams): JSX.Element | null => {
        if (params.isSkipping) {
            return <div>編集中…</div>;
        }
        const result = isValidVarToml(params.currentValue);
        if (result.isError) {
            return <div>TOML文法エラー</div>;
        }
        return <div>OK</div>;
    };

    return <BufferedTextArea {...inputProps} spellCheck={false} bottomElement={bottomElement} />;
};
