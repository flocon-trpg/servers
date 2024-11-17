import { loggerRef } from '@flocon-trpg/utils';
import {
    UpOperation,
    UpOperationUnit,
    apply,
    diff,
    serializeUpOperation,
    toUpOperation,
    transformUpOperation,
} from '@kizahasi/ot-string';
import classNames from 'classnames';
import React, { useState } from 'react';
import { useInterval, useLatest } from 'react-use';
import './CollaborativeInput.css';

export type OnSkippingParams =
    | {
          isSkipping: false;
          previousValue: string;
          currentValue: string;
      }
    | {
          isSkipping: true;
          previousValue?: undefined;
          currentValue?: undefined;
      };

export type Props = {
    /** 現在の部屋の State 由来の文字列。この値が変わっても CollaborativeInput にはすぐには反映されず、適当なときに CollaborativeInput コンポーネント内の input 等に反映されなおかつ `onChange` が実行されます。これらの文字列は一致します。 */
    value: string;

    /** `value` が変更されるべきときに実行されます。これが実行されたとき、`value` を即座にその値に変更してください。もしそうしないと、例えば `value` が 'a' のときに 'onChange('b')' が実行されたとき、もし `value` を 'b' に変更する前に Collaborative 内で定期実行される突合処理(`matchData` 関数)が実行されてしまうと、「`value` が API サーバー等により 'a' に戻った」と判断され、`onChange('a')` が実行されてしまい、望まない状態を引き起こします。 */
    onChange: (newValue: string) => void;

    // コードエディターなどを作る際に「解析中」のメッセージを出せるようにするためのプロパティ。
    // 当初は createBottomElement という名前であり戻り値の型も void ではなく JSX.Element | null で、返された値をCollaborativeInput 側で表示するようにしていた。
    // だが、そうするとメインのElementとBottomElementの2つを返すことになるため、React.Fragmentもしくはdivで包む必要がある。どちらの場合でもstyleやclassNameの設定で混乱する可能性があるため、ボツにした。
    onSkipping?: (params: OnSkippingParams) => void;

    /** 0以下の値にしてはならない。0より大きい値であっても小さい値にしてしまうと、文字列比較が頻繁に行われてしまいパフォーマンスが悪化するのでこれも避けるべき。*/
    bufferDuration: number | 'default' | 'short';

    // trueならばtextareaのように、そうでなければinputのようにふるまう
    multiline?: boolean;

    placeholder?: string;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
    size?: 'verySmall' | 'small' | 'medium' | undefined;
};

namespace ClassNames {
    export const collaborativeInput = 'collaborative-input';
    const small = 'small';
    const verySmall = 'very-small';
    const medium = 'medium';
    export const getSize = (size: Props['size']) => {
        switch (size) {
            case 'verySmall':
                return verySmall;
            case 'small':
                return small;
            case 'medium':
                return medium;
            default:
                return medium;
        }
    };
    export const disabled = 'disabled';
}

const useParseBufferDuration = (value: Props['bufferDuration']): number => {
    if (value === 'default') {
        return 1000;
    }
    if (value === 'short') {
        return 333;
    }
    if (value <= 0) {
        throw new Error(`bufferDuration must be greater than 0. but got ${value}`);
    }
    return value;
};

const ot = ({
    rootText,
    currentMyText,
    currentTheirText,
}: {
    rootText: string;
    currentMyText: string;
    currentTheirText: string;
}) => {
    const first =
        rootText === currentTheirText
            ? undefined
            : diff({ prevState: rootText, nextState: currentTheirText });
    const second =
        rootText === currentMyText
            ? undefined
            : diff({ prevState: rootText, nextState: currentMyText });

    const firstUpOperation = first == null ? undefined : toUpOperation(first);
    const secondUpOperation = second == null ? undefined : toUpOperation(second);

    let firstPrime: UpOperation | undefined;
    if (firstUpOperation == null) {
        firstPrime = undefined;
    } else {
        if (secondUpOperation == null) {
            firstPrime = firstUpOperation;
        } else {
            const xform = transformUpOperation({
                first: firstUpOperation,
                second: secondUpOperation,
            });
            if (xform.isError) {
                loggerRef.fatal(
                    {
                        rootText,
                        currentMyText,
                        currentTheirText,
                        first: firstUpOperation,
                        second: secondUpOperation,
                        error: xform.error,
                    },
                    'OT failed at CollaborativeInput.tsx',
                );
                throw new Error('OT failed at CollaborativeInput.tsx. See the log for details.');
            }
            firstPrime = xform.value.firstPrime;
        }
    }

    if (firstPrime == null) {
        return { state: currentMyText, upOperation: undefined };
    }

    const result = apply({ prevState: currentMyText, upOperation: firstPrime });
    if (result.isError) {
        loggerRef.fatal(
            {
                rootText,
                currentMyText,
                currentTheirText,
                first: firstUpOperation,
                second: secondUpOperation,
                error: result.error,
            },
            'Applying operation is failed at CollaborativeInput.tsx',
        );
        throw new Error(
            'Applying operation is failed at CollaborativeInput.tsx. See the log for details.',
        );
    }
    return { state: result.value, upOperation: firstPrime };
};

function* toOperationUnitByChar(operation: readonly UpOperationUnit[]) {
    for (const unit of operation) {
        switch (unit.t) {
            case 'r':
                for (let i = 0; i < unit.r; i++) {
                    yield { type: 'retain' } as const;
                }
                break;
            case 'i':
                for (const char of unit.i) {
                    yield { type: 'insert', char } as const;
                }
                break;
            case 'd':
                for (let i = 0; i < unit.d; i++) {
                    yield { type: 'delete' } as const;
                }
                break;
        }
    }
}

const moveCursorByUpOperation = (
    input: HTMLInputElement | HTMLTextAreaElement,
    operation: UpOperation,
    newValue: string,
) => {
    if (input.selectionStart == null) {
        return;
    }

    // value のセットの前にカーソル位置を取得しないとカーソル位置がリセットされてしまうのでここで取得。
    const selectionStart = input.selectionStart;
    const selectionEnd = input.selectionEnd;

    input.value = newValue;

    let oldSelectionStart = 0;
    let newSelectionStart = 0;

    for (const unit of toOperationUnitByChar(serializeUpOperation(operation))) {
        switch (unit.type) {
            case 'retain':
                oldSelectionStart++;
                newSelectionStart++;
                break;
            case 'insert':
                newSelectionStart++;
                break;
            case 'delete':
                oldSelectionStart++;
                break;
        }
        if (oldSelectionStart >= selectionStart) {
            break;
        }
    }

    if (selectionEnd != null) {
        let oldSelectionEnd = 0;
        let newSelectionEnd = 0;

        for (const unit of toOperationUnitByChar(serializeUpOperation(operation))) {
            switch (unit.type) {
                case 'retain':
                    oldSelectionEnd++;
                    newSelectionEnd++;
                    break;
                case 'insert':
                    newSelectionEnd++;
                    break;
                case 'delete':
                    oldSelectionEnd++;
                    break;
            }
            if (oldSelectionEnd >= selectionEnd) {
                break;
            }
        }

        input.setSelectionRange(newSelectionStart, newSelectionEnd);
        return;
    }

    input.setSelectionRange(newSelectionStart, newSelectionStart);
};

/**
 * 他のユーザーと文字列を共同で編集可能なコンポーネントを表します。カーソルの位置も適当な位置に自動で移動されます。
 */
export const CollaborativeInput: React.FC<Props> = ({
    value,
    onChange,
    onSkipping,
    bufferDuration: bufferDurationProp,
    multiline,
    placeholder,
    disabled,
    className: classNameProp,
    style,
    size,
}) => {
    // コンポーネントの ref
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

    // props から受け取った関数の ref
    const onChangeRef = useLatest(onChange);
    const onSkippingRef = useLatest(onSkipping);

    const valueRef = useLatest(value);

    const [inputText, setInputText] = useState(value);
    const inputTextRef = useLatest(inputText);

    const [inputTextAtLastDataMatch, setInputTextAtLastDataMatch] = useState(value);
    const inputTextAtLastDataMatchRef = useLatest(inputTextAtLastDataMatch);

    const isSkipping = inputText !== inputTextAtLastDataMatch;

    const [valueAtLastDataMatch, setValueAtLastDataMatch] = useState(value);
    const valueAtLastDataMatchRef = useLatest(valueAtLastDataMatch);

    const matchData = React.useCallback(() => {
        const { state: nextInputText, upOperation } = ot({
            rootText: valueAtLastDataMatchRef.current,
            currentMyText: inputTextRef.current,
            currentTheirText: valueRef.current,
        });
        if (valueRef.current !== nextInputText) {
            onChangeRef.current(nextInputText);
        }
        setInputText(nextInputText);
        setInputTextAtLastDataMatch(nextInputText);
        setValueAtLastDataMatch(nextInputText);
        if (inputRef.current != null) {
            if (upOperation != null) {
                moveCursorByUpOperation(inputRef.current, upOperation, nextInputText);
            }
        }
        if (textareaRef.current != null) {
            if (upOperation != null) {
                moveCursorByUpOperation(textareaRef.current, upOperation, nextInputText);
            }
        }
    }, [inputTextRef, valueRef, onChangeRef, valueAtLastDataMatchRef]);

    React.useEffect(() => {
        if (isSkipping) {
            onSkippingRef.current?.({ isSkipping });
            return;
        }
        onSkippingRef.current?.({
            isSkipping,
            previousValue: inputTextAtLastDataMatchRef.current,
            currentValue: inputTextRef.current,
        });
    }, [inputTextRef, isSkipping, onSkippingRef, inputTextAtLastDataMatchRef]);

    const bufferDuration = useParseBufferDuration(bufferDurationProp);
    // bufferDuration ミリ秒ごとに matchData を実行することで CollaborativeInput の機能を実現させているという仕組み。「文字列の変更があり、なおかつ変更がおさまったときにのみ matchData を実行する」という方法も考えられるが、その場合はロジックが複雑になるため、単純な方法を採用している。
    useInterval(matchData, bufferDuration);

    const className = classNames(
        ClassNames.collaborativeInput,
        ClassNames.getSize(size),
        disabled ? ClassNames.disabled : null,
        classNameProp,
    );

    // Ant Design の Input コンポーネントでは uncontrolled だと何故かうまく扱えなかったため、代わりに input 要素を直接使っている。
    if (multiline === true) {
        // Ant Design の Input コンポーネントは上のコメントのとおり正常に動作しなかったため、Input.TextArea も同様と考えて代わりに textarea 要素を直接使っている。
        return (
            <textarea
                ref={textareaRef}
                defaultValue={value}
                placeholder={placeholder}
                disabled={disabled}
                className={className}
                style={style}
                onChange={e => {
                    const newValue = e.target.value;
                    setInputText(newValue);
                }}
            />
        );
    }
    return (
        <input
            type="text"
            ref={inputRef}
            defaultValue={value}
            placeholder={placeholder}
            disabled={disabled}
            className={className}
            style={style}
            onChange={e => {
                const newValue = e.target.value;
                setInputText(newValue);
            }}
        />
    );
};
