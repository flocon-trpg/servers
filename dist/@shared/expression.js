"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyze = exports.expr1 = exports.plain = void 0;
const Result_1 = require("./Result");
exports.plain = 'plain';
exports.expr1 = 'expr1';
const expr2 = 'expr2';
const toExpressionCore = (text) => {
    const bareKey = /[a-zA-Z0-9_-]/;
    const head = [];
    let tail = {
        type: exports.plain,
        text: '',
    };
    const charArray = text.split('');
    let cursor = 0;
    for (; cursor < charArray.length; cursor++) {
        const char = charArray[cursor];
        if (char === undefined) {
            throw 'this should not happen. charArray out of range.';
        }
        switch (tail.type) {
            case exports.plain:
                switch (char) {
                    case '\\': {
                        const nextChar = charArray[cursor + 1];
                        if (nextChar == null) {
                            return Result_1.ResultModule.error({ message: '末尾を \\ にすることはできません。', index: cursor });
                        }
                        cursor++;
                        tail = Object.assign(Object.assign({}, tail), { text: tail.text + nextChar });
                        continue;
                    }
                    case '{': {
                        const nextChar = charArray[cursor + 1];
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
                                }
                            };
                            continue;
                        }
                        tail = {
                            type: exports.expr1,
                            path: [],
                            reading: {
                                type: 'Begin',
                            }
                        };
                        continue;
                    }
                    case '}': {
                        return Result_1.ResultModule.error({ message: '} に対応する { が見つかりません。', index: cursor });
                    }
                    default: {
                        tail = Object.assign(Object.assign({}, tail), { text: tail.text + char });
                        continue;
                    }
                }
            case exports.expr1:
            case expr2: {
                if (char === '}') {
                    switch (tail.reading.type) {
                        case 'Begin':
                            return Result_1.ResultModule.error({ message: 'プロパティを空にすることはできません。', index: cursor });
                        case 'Bare':
                        case 'EndOfProp': {
                            if (tail.type === exports.expr1) {
                                head.push({
                                    type: exports.expr1,
                                    path: tail.reading.type === 'Bare' ? [...tail.path, tail.reading.text] : tail.path,
                                });
                                tail = { type: exports.plain, text: '' };
                                continue;
                            }
                            const nextChar = charArray[cursor + 1];
                            if (nextChar !== '}') {
                                return Result_1.ResultModule.error({ message: '{{ を } で閉じることはできません。', index: cursor });
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
                            case ' ':
                                continue;
                            case '\'': {
                                tail = Object.assign(Object.assign({}, tail), { reading: { type: 'InSingleQuote', text: '' } });
                                continue;
                            }
                            case '"': {
                                tail = Object.assign(Object.assign({}, tail), { reading: { type: 'InDoubleQuote', text: '' } });
                                continue;
                            }
                            default: {
                                if (!bareKey.test(char)) {
                                    return Result_1.ResultModule.error({ message: `${char} はこの場所で使うことはできません。`, index: cursor });
                                }
                                tail = Object.assign(Object.assign({}, tail), { reading: {
                                        type: 'Bare',
                                        text: char,
                                    } });
                                continue;
                            }
                        }
                    }
                    case 'EndOfProp': {
                        switch (char) {
                            case ' ':
                                continue;
                            case '.': {
                                tail = Object.assign(Object.assign({}, tail), { reading: { type: 'Begin' } });
                                continue;
                            }
                            default: {
                                return Result_1.ResultModule.error({ message: `${char} はこの場所で使うことはできません。`, index: cursor });
                            }
                        }
                    }
                    case 'Bare': {
                        switch (char) {
                            case ' ': {
                                tail = Object.assign(Object.assign({}, tail), { path: [...tail.path, tail.reading.text], reading: { type: 'EndOfProp' } });
                                continue;
                            }
                            case '.':
                                tail = {
                                    type: tail.type,
                                    path: [...tail.path, tail.reading.text],
                                    reading: {
                                        type: 'Begin',
                                    }
                                };
                                continue;
                            default: {
                                if (!bareKey.test(char)) {
                                    return Result_1.ResultModule.error({ message: `${char} は ' か " で囲む必要があります。`, index: cursor });
                                }
                                tail = Object.assign(Object.assign({}, tail), { reading: {
                                        type: 'Bare',
                                        text: tail.reading.text + char,
                                    } });
                                continue;
                            }
                        }
                    }
                    case 'InDoubleQuote': {
                        switch (char) {
                            case '"': {
                                tail = Object.assign(Object.assign({}, tail), { path: [...tail.path, tail.reading.text], reading: {
                                        type: 'EndOfProp',
                                    } });
                                continue;
                            }
                            case '\\': {
                                const nextChar = charArray[cursor + 1];
                                switch (nextChar) {
                                    case '"':
                                        tail = Object.assign(Object.assign({}, tail), { reading: {
                                                type: tail.reading.type,
                                                text: tail.reading.text + '"'
                                            } });
                                        cursor++;
                                        continue;
                                    case '\\': {
                                        tail = Object.assign(Object.assign({}, tail), { reading: {
                                                type: tail.reading.type,
                                                text: tail.reading.text + '\\'
                                            } });
                                        cursor++;
                                        continue;
                                    }
                                    case undefined:
                                        return Result_1.ResultModule.error({ message: 'エスケープ文字の次に文字がありません。', index: cursor });
                                    default:
                                        return Result_1.ResultModule.error({ message: `\\${nextChar} は無効なエスケープシーケンスです。`, index: cursor });
                                }
                            }
                            default:
                                tail = Object.assign(Object.assign({}, tail), { reading: {
                                        type: tail.reading.type,
                                        text: tail.reading.text + char,
                                    } });
                                continue;
                        }
                    }
                    case 'InSingleQuote': {
                        switch (char) {
                            case '\'':
                                tail = Object.assign(Object.assign({}, tail), { path: [...tail.path, tail.reading.text], reading: { type: 'EndOfProp' } });
                                continue;
                            default:
                                tail = Object.assign(Object.assign({}, tail), { reading: {
                                        type: tail.reading.type,
                                        text: tail.reading.text + char,
                                    } });
                                continue;
                        }
                    }
                }
            }
        }
    }
    switch (tail.type) {
        case exports.plain:
            return Result_1.ResultModule.ok([...head, tail]);
        case exports.expr1:
            return Result_1.ResultModule.error({ index: cursor + 1, message: '} に対応する { がありません。' });
        case expr2:
            return Result_1.ResultModule.error({ index: cursor + 1, message: '}} に対応する {{ がありません。' });
    }
};
const analyze = (text) => {
    const expressions = toExpressionCore(text);
    if (expressions.isError) {
        return Result_1.ResultModule.error(`${expressions.error.index}: ${expressions.error.message}`);
    }
    const result = [];
    for (const expr of expressions.value) {
        switch (expr.type) {
            case expr2:
                return Result_1.ResultModule.error('{{と}}で囲む構文は将来のために予約されているため、現在は使用することはできません。');
            case exports.expr1:
                result.push({ type: exports.expr1, path: expr.path });
                continue;
            default:
                if (expr.text !== '') {
                    result.push({ type: exports.plain, text: expr.text });
                }
                continue;
        }
    }
    return Result_1.ResultModule.ok(result);
};
exports.analyze = analyze;
