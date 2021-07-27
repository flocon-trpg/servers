import { isValidChatPalette } from '@kizahasi/flocon-core';
import React from 'react';
import {
    BufferedTextArea,
    BottomElementParams,
    Props as BufferedTextAreaProps,
} from './BufferedTextArea';

type Props = Omit<BufferedTextAreaProps, 'spellCheck'>;

export const ChatPaletteTomlInput: React.FC<Props> = (props: Props) => {
    const { ...inputProps } = props;
    const bottomElement = (params: BottomElementParams): JSX.Element | null => {
        if (params.isSkipping) {
            return <div>編集中…</div>;
        }
        const result = isValidChatPalette(params.currentValue);
        if (result.isError) {
            return <div>エラー</div>;
        }
        return <div>OK</div>;
    };

    return <BufferedTextArea {...inputProps} spellCheck={false} bottomElement={bottomElement} />;
};
