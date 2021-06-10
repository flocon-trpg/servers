import classNames from 'classnames';
import React from 'react';
import { useBuffer } from '../hooks/useBuffer';

// Inputの制御は、Controlled（useStateなどを用いて値をInputにわたす）ではなくUncontrolled（DOMを直接操作）を採用している。
// 現段階の状態ではControlledでも書けるが、collaborative editingを実現するためにはカーソルの自動移動も必要だと考えられ、この場合はおそらくDOM操作が必須になる。これを見越してUncontrolledで書いている。

export type OnChangeParams = {
    previousValue: string;
    currentValue: string;
}

export type Props = {
    style?: React.CSSProperties;
    value: string;
    rows?: number;
    cols?: number;
    size?: 'small' | 'middle';
    spellCheck?: boolean;
    bufferDuration: number | 'default' | 'short';
    onChange: (params: OnChangeParams) => void;
    
    // Bufferされていない状態で、TextAreaの変換を即時に伝える。同じ値が連続して送られることがあるかもしれない。
    onChangeImmediate?: (newValue: string) => void;
};

const BufferedTextArea: React.FC<Props> = (props: Props) => {
    const { value, bufferDuration: bufferDurationCore, onChange, onChangeImmediate, size, ...inputProps } = props;

    if (bufferDurationCore < 0) {
        throw 'bufferDurationCore < 0';
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

    const { ref, onChangeInput } = useBuffer<string, HTMLTextAreaElement>({
        value,
        bufferDuration,
        onChangeOutput: onChange,
        equal: ({ value, component }) => {
            const inputValue = component.value;
            return inputValue === value;
        },
        setValueToComponent: ({ value, component }) => {
            component.value = value;
            if (onChangeImmediate != null) {
                onChangeImmediate(value);
            }
        },
    });

    // antdのInput.TextAreaだと、refで文字を直接編集する方法がわからなかったので代わりにtextareaを使っている。
    // Input.TextAreaでは単なるtextareaとしてレンダリングされるため、classNameを設定するだけでantdのInput.TextAreaを再現できると思われる。
    return (
        <textarea
            {...inputProps}
            className={classNames({ ['ant-input']: true, ['ant-input-sm']: size === 'small' })}
            value={undefined}
            ref={ref}
            defaultValue={undefined}
            onChange={e => {
                onChangeInput(e.currentTarget.value);
                if (onChangeImmediate != null) {
                    onChangeImmediate(e.currentTarget.value);
                }
            }} />
    );
};

export default BufferedTextArea;