/** @jsxImportSource @emotion/react */
import { SerializedStyles, css } from '@emotion/react';
import { loggerRef } from '@flocon-trpg/utils';
import { diff, serializeUpOperation, toUpOperation } from '@kizahasi/ot-string';
import Quill from 'quill';
import QuillDelta from 'quill-delta';
import React from 'react';
import { useQuill } from 'react-quilljs';
import { useLatest, usePrevious } from 'react-use';
// react-quilljs などを使わず直接 Quill を使うと、next build 時に ReferenceError: document is not defined というエラーが出てビルドできない。おそらくawait importでも回避できそうだが、react-quilljs を利用することで解決している。
import { Subject, Subscription, debounceTime } from 'rxjs';
import useConstant from 'use-constant';

/*
quill.bubble.css:389 に、下のようにplaceholderに関するstyleが記述されている。

.ql-editor.ql-blank::before {
    color: rgba(0,0,0,0.6);
    content: attr(data-placeholder);
    font-style: italic;
    left: 15px;
    pointer-events: none;
    position: absolute;
    right: 15px;
}

だが、これには次の問題点があるので一部変更している。
- color: デフォルトだと黒っぽくてほぼ見えない。変更後の色は適当なので後で見直したほうがいいかも。
- font-style: 日本語などは斜体にならないため、英数字と混ざると不格好である。

borderはantdになるべく合わせている。
*/
const generateBaseCss = ({ size }: { size: 'verySmall' | 'small' | 'medium' }) => {
    let fontSize: string;
    let padding: string;
    let paddingX: string;
    switch (size) {
        case 'verySmall': {
            fontSize = '0.7rem';
            padding = '2px 4px';
            paddingX = '4px';
            break;
        }
        case 'small': {
            fontSize = '0.75rem';
            padding = '2px 4px';
            paddingX = '4px';
            break;
        }
        case 'medium': {
            fontSize = '0.8rem';
            padding = '4px 8px';
            paddingX = '8px';
            break;
        }
    }
    return css`
        .ql-editor.ql-blank::before {
            color: rgb(140, 140, 140);
            font-style: normal;
            left: ${paddingX};
            right: ${paddingX};
        }

        .ql-editor {
            font-size: ${fontSize};
            padding: ${padding};
            border: 1px solid #434343;
            border-radius: 2px;
        }
    `;
};

const verySmallCss = generateBaseCss({ size: 'verySmall' });

const smallCss = generateBaseCss({ size: 'small' });

const mediumCss = generateBaseCss({ size: 'medium' });

const disabledCss = css`
    * {
        background-color: rgb(40, 40, 40);
        cursor: not-allowed;
    }

    .ql-editor {
        color: gray;
    }
`;

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

export type OnChangeParams = {
    previousValue: string;
    currentValue: string;
};

const createDelta = ({ prev, next }: { prev: string; next: string }): QuillDelta => {
    /*
    単純にdiffを取ってDeltaを生成しているだけ。そのため、厳密には編集者が編集した部分と異なる部分が編集されたとみなされる可能性がある。
    例えば'abababab'という文字を他の人が'ababab'にした場合、どこのabが削除されたかはdiffを取るだけではわからない。自分のカーソルの位置を|として'abab|abab'となっている場合、どこのabが削除されたかによって次のカーソルの位置は本来は変わるはずである。この場合は'ab|abab'もしくは'abab|ab'のいずれかが考えられる（厳密には他にも例えばababが削除されて別の場所にabが挿入されるケースもあるため、これら以外の場合も取りうる）。
    だが、このようなことが起こるのはそう多くないと考えられるし、起こっても不便さは感じないと思われるので問題なしとしている。
    */

    const result = new QuillDelta();
    const diffResult = diff({ prevState: prev, nextState: next });
    const upOperation = toUpOperation(diffResult);
    const serializedUpOperation = serializeUpOperation(upOperation);
    for (const unit of serializedUpOperation) {
        switch (unit.t) {
            case 'r':
                result.retain(unit.r);
                break;
            case 'd':
                result.delete(unit.d);
                break;
            case 'i':
                result.insert(unit.i);
                break;
        }
    }
    return result;
};

function useBuffer<TValue, TComponent>({
    value,
    bufferDuration,
    onChangeOutput,
    setValueToComponent,
}: {
    value: TValue;
    bufferDuration: number | null;
    onChangeOutput: (params: { previousValue: TValue; currentValue: TValue }) => void;
    setValueToComponent: (params: { value: TValue; component: TComponent }) => void;
}) {
    if (bufferDuration != null && bufferDuration < 0) {
        throw new Error('bufferDuration < 0');
    }

    const onChangeRef = useLatest(onChangeOutput);
    const setValueToComponentRef = useLatest(setValueToComponent);

    const ref = React.useRef<TComponent | null>(null);
    const subject = useConstant(() => new Subject<TValue>());
    const latestOnChangeInputValueRef = React.useRef(value);
    const onChangeInput: (value: TValue) => void = useConstant(() => {
        return x => {
            latestOnChangeInputValueRef.current = x;
            subject.next(x);
        };
    });
    const [, setSubscription] = React.useState<Subscription>();
    const [changeParams, setChangeParams] = React.useState<{
        previousValue?: TValue;
        currentValue: TValue;
    }>({ currentValue: value });
    const changeParamsRef = useLatest(changeParams);
    const [subscriptionUpdateKey, setSubscriptionUpdateKey] = React.useState(0);

    React.useEffect(() => {
        if (ref.current != null) {
            setValueToComponentRef.current({ value, component: ref.current });
        }

        setSubscriptionUpdateKey(oldState => oldState + 1);
        setChangeParams({ currentValue: value });
    }, [setValueToComponentRef, value]);

    React.useEffect(() => {
        const newSubscription = (
            bufferDuration == null ? subject : subject.pipe(debounceTime(bufferDuration))
        ).subscribe(newValue => {
            setChangeParams(oldResult => {
                return {
                    previousValue: oldResult.currentValue,
                    currentValue: newValue,
                };
            });
        });
        setSubscription(oldSubscription => {
            oldSubscription?.unsubscribe();
            return newSubscription;
        });
        return () => {
            newSubscription.unsubscribe();
        };
    }, [subject, bufferDuration, subscriptionUpdateKey]);

    React.useEffect(() => {
        if (changeParams.previousValue !== undefined) {
            onChangeRef.current({
                previousValue: changeParams.previousValue,
                currentValue: changeParams.currentValue,
            });
        }
    }, [changeParams, onChangeRef]);

    // unmount時にonChangeを実行させている
    React.useEffect(() => {
        const $changeParamsRef = changeParamsRef;
        const $latestOnChangeInputValueRef = latestOnChangeInputValueRef;
        const $onChangeRef = onChangeRef;
        return () => {
            const previousValue = $changeParamsRef.current.currentValue;
            const currentValue = $latestOnChangeInputValueRef.current;
            if (previousValue !== currentValue) {
                $onChangeRef.current({ previousValue, currentValue });
            }
        };
    }, [changeParamsRef, onChangeRef]);

    return {
        onChangeInput,
        ref,
    };
}

export type Props = {
    value: string;
    onChange: (e: OnChangeParams) => void;
    // コードエディターなどを作る際に「解析中」のメッセージを出せるようにするためのプロパティ。
    // 当初は createBottomElement という名前であり戻り値の型も void ではなく JSX.Element | null で、返された値をCollaborativeInput 側で表示するようにしていた。
    // だが、そうするとメインのElementとBottomElementの2つを返すことになるため、React.Fragmentもしくはdivで包む必要がある。どちらの場合でもstyleやclassNameの設定で混乱する可能性があるため、ボツにした。
    onSkipping?: (params: OnSkippingParams) => void;
    onGetQuill?: (nextQuill: Quill | undefined) => void;
    // trueならばtextareaのように、そうでなければinputのようにふるまう
    multiline?: boolean;
    bufferDuration: number | 'default' | 'short' | null;
    // placeholderの変更は反映されない。最初の値が常に使われる。
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
    size?: 'verySmall' | 'small' | 'medium' | undefined;
};

const useWarnPlaceholderChanges = ({
    quill,
    placeholderProp,
}: {
    quill: Quill | undefined;
    placeholderProp: string | undefined;
}) => {
    const currentQuillRef = React.useRef(quill);
    const prevQuill = usePrevious(quill);
    const prevQuillRef = React.useRef(prevQuill);
    const currentPlaceholderRef = useLatest(placeholderProp);
    const prevPlaceholder = usePrevious(placeholderProp);
    const prevPlaceholderRef = useLatest(prevPlaceholder);

    React.useEffect(() => {
        if (prevQuillRef.current !== currentQuillRef.current) {
            return;
        }
        if (prevPlaceholderRef.current !== currentPlaceholderRef.current) {
            loggerRef.warn(
                'placeholderプロパティの値が更新されましたが、CollaborativeInputではplaceholderの更新に対応していないため無視されます。',
            );
        }
    }, [currentPlaceholderRef, prevPlaceholderRef]);
};

export const CollaborativeInput: React.FC<Props> = ({
    value,
    onChange,
    onSkipping: onSkippingProp,
    onGetQuill,
    multiline: multilineProp,
    bufferDuration: bufferDurationProp,
    placeholder,
    disabled: disabledProp,
    className,
    style,
    size,
}) => {
    const multiline = multilineProp === true;
    const disabled = disabledProp === true;

    const [isOnComposition, setIsOnComposition] = React.useState(false);
    const prevIsOnComposition = usePrevious(isOnComposition);
    const isOnCompositionRef = useLatest(isOnComposition);
    const valueRef = useLatest(value);
    const onGetQuillRef = useLatest(onGetQuill);

    const { quill, quillRef } = useQuill({
        modules: {
            toolbar: false,
            // https://github.com/quilljs/quill/issues/1432#issuecomment-486659920
            keyboard:
                multiline === true
                    ? undefined
                    : {
                          bindings: {
                              enter: {
                                  key: 13,
                                  handler: () => false,
                              },
                          },
                      },
        },
        placeholder,
        // プレーンテキスト以外を無効化している
        formats: [],
        theme: 'bubble',
    });
    const prevQuill = usePrevious(quill);

    let bufferDuration: number | null;
    switch (bufferDurationProp) {
        case 'default':
            bufferDuration = 500;
            break;
        case 'short':
            bufferDuration = 100;
            break;
        default:
            bufferDuration = bufferDurationProp === 0 ? null : bufferDurationProp;
            break;
    }

    const onSkipping = (params: OnSkippingParams): void => {
        if (onSkippingProp == null) {
            return;
        }
        onSkippingProp(params);
    };
    const onSkippingRef = useLatest(onSkipping);

    const { ref: bufferRef, onChangeInput } = useBuffer<string, Quill>({
        value,
        bufferDuration,
        onChangeOutput: params => {
            onSkippingRef.current({
                isSkipping: false,
                previousValue: params.previousValue,
                currentValue: params.currentValue,
            });
            multiline
                ? onChange(params)
                : onChange({
                      ...params,
                      currentValue: params.currentValue.replaceAll('\r', '').replaceAll('\n', ''),
                  });
        },
        setValueToComponent: ({ value, component }) => {
            const prev = component.getText();
            const delta = createDelta({ prev, next: value });
            component.updateContents(delta);
        },
    });

    React.useEffect(() => {
        bufferRef.current = quill ?? null;
        if (onGetQuillRef.current != null) {
            onGetQuillRef.current(quill);
        }
    }, [bufferRef, onGetQuillRef, quill]);

    const prevTextRef = React.useRef<string>();
    React.useEffect(() => {
        if (quill == null) {
            return;
        }

        const onTextChange = () => {
            const prevText = prevTextRef.current;
            if (prevText == null) {
                return;
            }
            const currentText = quill.getText();
            if (prevText !== currentText) {
                onSkippingRef.current({ isSkipping: true });
                onChangeInput(currentText);
            }
            prevTextRef.current = currentText;
        };
        if (prevQuill !== quill) {
            quill.setText(valueRef.current);
            prevTextRef.current = quill.getText();
            quill.on('text-change', () => {
                if (isOnCompositionRef.current) {
                    // 漢字変換前のひらがなの入力などの際は関数を実行しない(onCompositionEndが実行された際に実行する)ようにする処理。
                    // これにより、漢字変換前のひらがなが、しばしば二重で入力されることがある不具合を回避している。
                    return;
                }
                onTextChange();
            });
        }
        if (prevIsOnComposition === true && isOnComposition === false) {
            // 漢字変換前のひらがななどを入力していた場合は、onCompositionEndが実行された際に初めて変更を送信する処理。
            onTextChange();
        }
    }, [
        isOnComposition,
        isOnCompositionRef,
        onChangeInput,
        onSkippingRef,
        prevIsOnComposition,
        prevQuill,
        quill,
        valueRef,
    ]);

    React.useEffect(() => {
        if (quill == null) {
            return;
        }
        if (disabled) {
            quill.disable();
        } else {
            quill.enable();
        }
    }, [disabled, quill]);

    useWarnPlaceholderChanges({ quill, placeholderProp: placeholder });

    let sizeCss: SerializedStyles;
    switch (size) {
        case 'verySmall':
            sizeCss = verySmallCss;
            break;
        case 'small':
            sizeCss = smallCss;
            break;
        default:
            sizeCss = mediumCss;
    }
    const cssValue = React.useMemo(() => {
        return css([sizeCss, disabled ? disabledCss : null]);
    }, [sizeCss, disabled]);

    const onCompositionStart = React.useCallback(() => setIsOnComposition(true), []);
    const onCompositionEnd = React.useCallback(() => setIsOnComposition(false), []);
    /* 
    refのあるdivにはQuillによってclassが自動的にセットされる。もしcssをrefのあるdivと同じ場所に置くと、cssValueが変わったときにrefのあるdivに入っていたclassが消失してしまう。
    それを防ぐため、cssとrefは別の場所に置いている。
    */
    return (
        <div css={cssValue} style={style} className={className}>
            <div
                ref={quillRef}
                spellCheck={false}
                onCompositionStart={onCompositionStart}
                onCompositionEnd={onCompositionEnd}
            />
        </div>
    );
};
