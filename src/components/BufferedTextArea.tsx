import classNames from 'classnames';
import React from 'react';
import { useBuffer } from '../hooks/useBuffer';
import * as Icons from '@ant-design/icons';

// Inputの制御は、Controlled（useStateなどを用いて値をInputにわたす）ではなくUncontrolled（DOMを直接操作）を採用している。
// 現段階の状態ではControlledでも書けるが、collaborative editingを実現するためにはカーソルの自動移動も必要だと考えられ、この場合はおそらくDOM操作が必須になる。これを見越してUncontrolledで書いている。

export type OnChangeParams = {
    previousValue: string;
    currentValue: string;
};

export type BottomElementParams =
    | {
          isSkipping: false;
          previousValue?: string;
          currentValue: string;
      }
    | {
          isSkipping: true;
      };

export type Props = {
    style?: React.CSSProperties;
    value: string;
    rows?: number;
    cols?: number;
    size?: 'small' | 'middle';
    spellCheck?: boolean;
    bufferDuration: number | 'default' | 'short';
    onChange?: (params: OnChangeParams) => void;
    bottomElement?: (params: BottomElementParams) => JSX.Element | null;
};

export const BufferedTextArea: React.FC<Props> = (props: Props) => {
    const {
        value,
        bufferDuration: bufferDurationCore,
        onChange,
        bottomElement: createBottomElementCore,
        size,
        ...inputProps
    } = props;
    const createBottomElement = (params: BottomElementParams): JSX.Element | null => {
        if (createBottomElementCore == null) {
            if (params.isSkipping) {
                return <Icons.EditOutlined />;
            }
            return <Icons.CheckOutlined />
        }
        return createBottomElementCore(params);
    }
    const [bottomElement, setBottomElement] = React.useState<JSX.Element | null>(() => {
        if (createBottomElement == null) {
            return null;
        }
        return createBottomElement({ isSkipping: false, currentValue: value });
    });
    const onChangeOutput = (params: OnChangeParams) => {
        if (onChange != null) {
            onChange(params);
        }
        if (createBottomElement == null) {
            setBottomElement(null);
            return;
        }
        setBottomElement(createBottomElement({ ...params, isSkipping: false }));
    };

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

    const { ref, onChangeInput } = useBuffer<string, HTMLTextAreaElement>({
        value,
        bufferDuration,
        onChangeOutput,
        setValueToComponent: ({ value, component }) => {
            component.value = value;
            if (createBottomElement == null) {
                return;
            }
            setBottomElement(createBottomElement({ isSkipping: true }));
        },
    });

    // antdのInput.TextAreaだと、refで文字を直接編集する方法がわからなかったので代わりにtextareaを使っている。
    // Input.TextAreaでは単なるtextareaとしてレンダリングされるため、classNameを設定するだけでantdのInput.TextAreaを再現できると思われる。
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <textarea
                {...inputProps}
                className={classNames({ ['ant-input']: true, ['ant-input-sm']: size === 'small' })}
                value={undefined}
                ref={ref}
                defaultValue={undefined}
                onChange={e => {
                    onChangeInput(e.currentTarget.value);
                }}
            />
            {bottomElement}
        </div>
    );
};

