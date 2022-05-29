/** @jsxImportSource @emotion/react */
import React from 'react';
import Quill from 'quill';
import QuillDelta from 'quill-delta';
import { css } from '@emotion/react';
import { useBuffer } from '../../hooks/useBuffer';
import { diff, serializeUpOperation, toUpOperation } from '@kizahasi/ot-string';
import { useLatest, usePrevious } from 'react-use';
// react-quilljs などを使わず直接 Quill を使うと、next build 時に ReferenceError: document is not defined というエラーが出てビルドできない。おそらくawait importでも回避できそうだが、react-quilljs を利用することで解決している。
import { useQuill } from 'react-quilljs';

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
const generateBaseCss = ({ size }: { size: 'small' | 'medium' }) => {
    const isSmall = size === 'small';
    return css`
        .ql-editor.ql-blank::before {
            color: rgb(140, 140, 140);
            font-style: normal;
            left: ${isSmall ? '4px' : '8px'};
            right: ${isSmall ? '4px' : '8px'};
        }

        .ql-editor {
            padding: ${isSmall ? '2px 4px' : '4px 8px'};
            border: 1px solid #434343;
            border-radius: 2px;
        }
    `;
};

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
          currentValue: string;
      }
    | {
          isSkipping: true;
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

export type Props = {
    value: string;
    onChange: (e: OnChangeParams) => void;
    // コードエディターなどを作る際に「解析中」のメッセージを出せるようにするためのプロパティ。
    // 当初は createBottomElement という名前であり戻り値の型も void ではなく JSX.Element | null で、返された値をCollaborativeInput 側で表示するようにしていた。
    // だが、そうするとメインのElementとBottomElementの2つを返すことになるため、React.Fragmentもしくはdivで包む必要がある。どちらの場合でもstyleやclassNameの設定で混乱する可能性があるため、ボツにした。
    onSkipping?: (params: OnSkippingParams) => void;
    onGetQuill?: (nextQuill: Quill | undefined) => void;
    // trueの場合、styleなどからheightをpxなどの値で指定することを推奨。そうしないとスクロールバーが出たときの挙動がややおかしくなるため。
    multiline?: boolean;
    bufferDuration: number | 'default' | 'short' | null;
    // placeholderの変更は反映されない。最初の値が常に使われる。
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
    size?: 'small' | 'medium' | undefined;
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
            console.warn(
                'placeholderプロパティの値が更新されましたが、CollaborativeInputではplaceholderの更新に対応していないため無視されます。'
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
            onSkippingRef.current({ isSkipping: false, currentValue: value });
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

    React.useEffect(() => {
        if (quill == null) {
            return;
        }

        quill.setText(valueRef.current);

        const textChangeHandler = () => {
            onSkippingRef.current({ isSkipping: true });
            onChangeInput(quill.getText());
        };
        quill.on('text-change', textChangeHandler);
    }, [onChangeInput, onSkippingRef, quill, valueRef]);

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

    const isSmall = size === 'small';
    const cssValue = React.useMemo(() => {
        return css([isSmall ? smallCss : mediumCss, disabled ? disabledCss : null]);
    }, [isSmall, disabled]);

    /* 
    refのあるdivにはQuillによってclassが自動的にセットされる。もしcssをrefのあるdivと同じ場所に置くと、cssValueが変わったときにrefのあるdivに入っていたclassが消失してしまう。
    それを防ぐため、cssとrefは別の場所に置いている。
    */
    return (
        <div css={cssValue} style={style} className={className}>
            <div ref={quillRef} spellCheck={false} />
        </div>
    );
};
