/* eslint-disable @typescript-eslint/no-namespace */

import { CustomResult, Result, ResultModule } from './Result';

export const plain = 'plain';
export const expr1 = 'expr1';
const expr2 = 'expr2';

type ExpressionCore = {
    type: typeof plain;
    text: string;
} | {
    type: typeof expr1;
    text: string;
} | {
    type: typeof expr2;
    text: string;
}

type Error = {
    index: number;
    message: string;
}

const toExpressionCore = (text: string): CustomResult<ExpressionCore[], Error> => {
    // head内のexpr1やexpr2は、braとketが対応できている。
    // tail内のそれらは、braの数は正しいがketが正しく対応しているかはまだわからない。
    const head: ExpressionCore[] = [];
    let tail: ExpressionCore | null = null;

    const append = (source: ExpressionCore | null, text: string): ExpressionCore => {
        switch (source?.type) {
            case undefined:
                return { type: plain, text };
            case plain:
            case expr1:
            case expr2:
                return { ...source, text: source.text + text };
        }
    };

    const charArray = text.split('');
    let cursor = 0;
    let isInExpr = false;
    let braCountInExpr = 0;
    for (; cursor < charArray.length; cursor++) {
        const char = charArray[cursor];
        if (char === undefined) {
            throw 'this should not happen. charArray out of range.';
        }

        switch (char) {
            case '\\': {
                const nextChar: string | undefined = charArray[cursor + 1];
                switch (nextChar) {
                    case '{':
                    case '}':
                        cursor++;
                        tail = append(tail, nextChar);
                        continue;
                    default:
                        if (isInExpr) {
                            cursor++;
                            tail = append(tail, nextChar);
                            continue;
                        }
                        break;
                }
                tail = append(tail, nextChar);
                continue;
            }
            case '{': {
                if (isInExpr) {
                    braCountInExpr++;
                    tail = append(tail, '{');
                    continue;
                }

                const nextChar: string | undefined = charArray[cursor + 1];
                if (nextChar === '{') {
                    cursor++;
                    isInExpr = true;
                    if (tail != null) {
                        head.push(tail);
                    }
                    tail = { type: expr2, text: '' };
                    continue;
                }
                isInExpr = true;
                if (tail != null) {
                    head.push(tail);
                }
                tail = { type: expr1, text: '' };
                continue;
            }
            case '}': {
                if (braCountInExpr >= 1) {
                    braCountInExpr--;
                    tail = append(tail, '}');
                    continue;
                }

                const nextChar: string | undefined = charArray[cursor + 1];
                if (nextChar === '}') {
                    switch (tail?.type) {
                        case undefined:
                        case plain:
                            return ResultModule.error({ index: cursor + 1, message: '}}に対応する{{がありません。' });
                        case expr1:
                            return ResultModule.error({ index: cursor + 1, message: '{を}}で閉じることはできません。' });
                    }
                    cursor++;
                    isInExpr = false;
                    if (tail != null) {
                        head.push(tail);
                    }
                    tail = null;
                    continue;
                }
                switch (tail?.type) {
                    case undefined:
                    case plain:
                        return ResultModule.error({ index: cursor + 1, message: '}に対応する{がありません。' });
                    case expr2:
                        return ResultModule.error({ index: cursor + 1, message: '{{を}で閉じることはできません。' });
                }
                if (tail != null) {
                    head.push(tail);
                }
                tail = null;
                continue;
            }
            default:
                tail = append(tail, char);
                continue;
        }
    }

    switch (tail?.type) {
        case undefined:
            return ResultModule.ok(head);
        case plain:
            return ResultModule.ok([...head, tail]);
        case expr1:
            return ResultModule.error({ index: cursor + 1, message: '}に対応する{がありません。' });
        case expr2:
            return ResultModule.error({ index: cursor + 1, message: '}}に対応する{{がありません。' });
    }
};

export type Expression = {
    type: typeof plain;
    text: string;
} | {
    type: typeof expr1;
    variable: string;
}

export const analyze = (text: string): Result<Expression[]> => {
    const expressions = toExpressionCore(text);
    if (expressions.isError) {
        return ResultModule.error(`${expressions.error.index}: ${expressions.error.message}`);
    }
    const result: Expression[] = [];
    for (const expr of expressions.value) {
        if (expr.type === expr2) {
            return ResultModule.error('{{と}}で囲む構文は将来のために予約されているため、現在は使用することはできません。');
        }
        if (expr.type === expr1) {
            result.push({ type: expr1, variable: expr.text });
            continue;
        }
        result.push(expr);
    }
    return ResultModule.ok(result);
};