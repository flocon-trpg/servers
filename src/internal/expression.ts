/* eslint-disable @typescript-eslint/no-namespace */

import { CustomResult, Result } from '@kizahasi/result';

export const plain = 'plain';
export const expr1 = 'expr1';
const expr2 = 'expr2';

type ExpressionCore =
    | {
          type: typeof plain;
          text: string; // 空文字になることがある。
      }
    | {
          type: typeof expr1 | typeof expr2;
          path: string[];
      };

type ExpressionTail =
    | {
          type: typeof plain;
          text: string;
      }
    | {
          type: typeof expr1 | typeof expr2;
          path: string[];
          reading:
              | {
                    // 'Begin' は、式の最初、もしくは . の次を表す。
                    // 'EndOfProp' の Prop とは、例えば foo."bar".baz における foo, bar, baz のことである。
                    type: 'Begin' | 'EndOfProp';
                }
              | {
                    type: 'InSingleQuote' | 'InDoubleQuote';
                    text: string;
                }
              | {
                    type: 'Bare';
                    text: string; // 空文字になることはない。
                };
      };

type Error = {
    index: number;
    message: string;
};

const toExpressionCore = (
    text: string
): CustomResult<ExpressionCore[], Error> => {
    const bareKey = /[a-zA-Z0-9_-]/;

    const head: ExpressionCore[] = []; // plainが連続して続くことはない。
    let tail: ExpressionTail = {
        type: plain,
        text: '',
    };

    const charArray = text.split('');
    let cursor = 0;

    for (; cursor < charArray.length; cursor++) {
        const char = charArray[cursor];
        if (char === undefined) {
            throw new Error('this should not happen. charArray out of range.');
        }

        switch (tail.type) {
            case plain:
                switch (char) {
                    case '\\': {
                        const nextChar: string | undefined =
                            charArray[cursor + 1];
                        if (nextChar == null) {
                            return Result.error({
                                message: '末尾を \\ にすることはできません。',
                                index: cursor,
                            });
                        }
                        cursor++;
                        tail = { ...tail, text: tail.text + nextChar };
                        continue;
                    }
                    case '{': {
                        const nextChar: string | undefined =
                            charArray[cursor + 1];
                        if (tail != null) {
                            head.push(tail);
                        }
                        if (nextChar === '{') {
                            cursor++;
                            tail = {
                                type: expr2,
                                path: [],
                                reading: {
                                    type: 'Begin',
                                },
                            };
                            continue;
                        }
                        tail = {
                            type: expr1,
                            path: [],
                            reading: {
                                type: 'Begin',
                            },
                        };
                        continue;
                    }
                    case '}': {
                        return Result.error({
                            message: '} に対応する { が見つかりません。',
                            index: cursor,
                        });
                    }
                    default: {
                        tail = { ...tail, text: tail.text + char };
                        continue;
                    }
                }
            case expr1:
            case expr2: {
                // 基本的に、まずtail.reading.typeで分類して、その次にcharごとに処理を行っている。
                // ただし、char === '}' のケースは、共通処理がある程度複雑なため、同じコードをコピペしたくないので例外的にここでまず処理してしまっている。
                if (char === '}') {
                    switch (tail.reading.type) {
                        case 'Begin':
                            return Result.error({
                                message:
                                    'プロパティを空にすることはできません。',
                                index: cursor,
                            });
                        case 'Bare':
                        case 'EndOfProp': {
                            if (tail.type === expr1) {
                                head.push({
                                    type: expr1,
                                    path:
                                        tail.reading.type === 'Bare'
                                            ? [...tail.path, tail.reading.text]
                                            : tail.path,
                                });
                                tail = { type: plain, text: '' };
                                continue;
                            }
                            const nextChar = charArray[cursor + 1];
                            if (nextChar !== '}') {
                                return Result.error({
                                    message:
                                        '{{ を } で閉じることはできません。',
                                    index: cursor,
                                });
                            }
                            continue;
                        }
                        default:
                            break;
                    }
                }

                switch (tail.reading.type) {
                    case 'Begin': {
                        switch (char) {
                            // { が3つ以上続いていた場合は char === '{' になる。

                            case ' ':
                                continue;
                            case "'": {
                                tail = {
                                    ...tail,
                                    reading: {
                                        type: 'InSingleQuote',
                                        text: '',
                                    },
                                };
                                continue;
                            }
                            case '"': {
                                tail = {
                                    ...tail,
                                    reading: {
                                        type: 'InDoubleQuote',
                                        text: '',
                                    },
                                };
                                continue;
                            }
                            default: {
                                if (!bareKey.test(char)) {
                                    return Result.error({
                                        message: `${char} はこの場所で使うことはできません。`,
                                        index: cursor,
                                    });
                                }
                                tail = {
                                    ...tail,
                                    reading: {
                                        type: 'Bare',
                                        text: char,
                                    },
                                };
                                continue;
                            }
                        }
                    }
                    case 'EndOfProp': {
                        switch (char) {
                            case ' ':
                                continue;
                            case '.': {
                                tail = {
                                    ...tail,
                                    reading: { type: 'Begin' },
                                };
                                continue;
                            }
                            default: {
                                return Result.error({
                                    message: `${char} はこの場所で使うことはできません。`,
                                    index: cursor,
                                });
                            }
                        }
                    }
                    case 'Bare': {
                        switch (char) {
                            case ' ': {
                                tail = {
                                    ...tail,
                                    path: [...tail.path, tail.reading.text],
                                    reading: { type: 'EndOfProp' },
                                };
                                continue;
                            }
                            case '.':
                                tail = {
                                    type: tail.type,
                                    path: [...tail.path, tail.reading.text],
                                    reading: {
                                        type: 'Begin',
                                    },
                                };
                                continue;

                            default: {
                                if (!bareKey.test(char)) {
                                    return Result.error({
                                        message: `${char} は ' か " で囲む必要があります。`,
                                        index: cursor,
                                    });
                                }
                                tail = {
                                    ...tail,
                                    reading: {
                                        type: 'Bare',
                                        text: tail.reading.text + char,
                                    },
                                };
                                continue;
                            }
                        }
                    }
                    case 'InDoubleQuote': {
                        switch (char) {
                            case '"': {
                                tail = {
                                    ...tail,
                                    path: [...tail.path, tail.reading.text],
                                    reading: {
                                        type: 'EndOfProp',
                                    },
                                };
                                continue;
                            }
                            case '\\': {
                                const nextChar: string | undefined =
                                    charArray[cursor + 1];
                                switch (nextChar) {
                                    case '"':
                                        tail = {
                                            ...tail,
                                            reading: {
                                                type: tail.reading.type,
                                                text: tail.reading.text + '"',
                                            },
                                        };
                                        cursor++;
                                        continue;
                                    case '\\': {
                                        tail = {
                                            ...tail,
                                            reading: {
                                                type: tail.reading.type,
                                                text: tail.reading.text + '\\',
                                            },
                                        };
                                        cursor++;
                                        continue;
                                    }
                                    case undefined:
                                        return Result.error({
                                            message:
                                                'エスケープ文字の次に文字がありません。',
                                            index: cursor,
                                        });
                                    default:
                                        // TOMLでは\uXXXXなどでunicodeを直接指定できるが、面倒なので今のところ実装は省略している。
                                        return Result.error({
                                            message: `\\${nextChar} は無効なエスケープシーケンスです。`,
                                            index: cursor,
                                        });
                                }
                            }
                            default:
                                tail = {
                                    ...tail,
                                    reading: {
                                        type: tail.reading.type,
                                        text: tail.reading.text + char,
                                    },
                                };
                                continue;
                        }
                    }
                    case 'InSingleQuote': {
                        switch (char) {
                            case "'":
                                tail = {
                                    ...tail,
                                    path: [...tail.path, tail.reading.text],
                                    reading: { type: 'EndOfProp' },
                                };
                                continue;
                            default:
                                tail = {
                                    ...tail,
                                    reading: {
                                        type: tail.reading.type,
                                        text: tail.reading.text + char,
                                    },
                                };
                                continue;
                        }
                    }
                }
            }
        }
    }

    switch (tail.type) {
        case plain:
            return Result.ok([...head, tail]);
        case expr1:
            return Result.error({
                index: cursor + 1,
                message: '} に対応する { がありません。',
            });
        case expr2:
            return Result.error({
                index: cursor + 1,
                message: '}} に対応する {{ がありません。',
            });
    }
};

export type Expression =
    | {
          type: typeof plain;
          text: string;
      }
    | {
          type: typeof expr1;
          path: string[];
      };

export const analyze = (text: string): Result<Expression[]> => {
    const expressions = toExpressionCore(text);
    if (expressions.isError) {
        return Result.error(
            `${expressions.error.index}: ${expressions.error.message}`
        );
    }
    const result: Expression[] = [];
    for (const expr of expressions.value) {
        switch (expr.type) {
            case expr2:
                return Result.error(
                    '{{と}}で囲む構文は将来のために予約されているため、現在は使用することはできません。'
                );
            case expr1:
                result.push({ type: expr1, path: expr.path });
                continue;
            default:
                if (expr.text !== '') {
                    result.push({ type: plain, text: expr.text });
                }
                continue;
        }
    }
    return Result.ok(result);
};
