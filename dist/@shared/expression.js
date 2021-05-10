"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyze = exports.expr1 = exports.plain = void 0;
const Result_1 = require("./Result");
exports.plain = 'plain';
exports.expr1 = 'expr1';
const expr2 = 'expr2';
const toExpressionCore = (text) => {
    const head = [];
    let tail = null;
    const append = (source, text) => {
        switch (source === null || source === void 0 ? void 0 : source.type) {
            case undefined:
                return { type: exports.plain, text };
            case exports.plain:
            case exports.expr1:
            case expr2:
                return Object.assign(Object.assign({}, source), { text: source.text + text });
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
                const nextChar = charArray[cursor + 1];
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
                const nextChar = charArray[cursor + 1];
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
                tail = { type: exports.expr1, text: '' };
                continue;
            }
            case '}': {
                if (braCountInExpr >= 1) {
                    braCountInExpr--;
                    tail = append(tail, '}');
                    continue;
                }
                const nextChar = charArray[cursor + 1];
                if (nextChar === '}') {
                    switch (tail === null || tail === void 0 ? void 0 : tail.type) {
                        case undefined:
                        case exports.plain:
                            return Result_1.ResultModule.error({ index: cursor + 1, message: '}}に対応する{{がありません。' });
                        case exports.expr1:
                            return Result_1.ResultModule.error({ index: cursor + 1, message: '{を}}で閉じることはできません。' });
                    }
                    cursor++;
                    isInExpr = false;
                    if (tail != null) {
                        head.push(tail);
                    }
                    tail = null;
                    continue;
                }
                switch (tail === null || tail === void 0 ? void 0 : tail.type) {
                    case undefined:
                    case exports.plain:
                        return Result_1.ResultModule.error({ index: cursor + 1, message: '}に対応する{がありません。' });
                    case expr2:
                        return Result_1.ResultModule.error({ index: cursor + 1, message: '{{を}で閉じることはできません。' });
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
    switch (tail === null || tail === void 0 ? void 0 : tail.type) {
        case undefined:
            return Result_1.ResultModule.ok(head);
        case exports.plain:
            return Result_1.ResultModule.ok([...head, tail]);
        case exports.expr1:
            return Result_1.ResultModule.error({ index: cursor + 1, message: '}に対応する{がありません。' });
        case expr2:
            return Result_1.ResultModule.error({ index: cursor + 1, message: '}}に対応する{{がありません。' });
    }
};
const analyze = (text) => {
    const expressions = toExpressionCore(text);
    if (expressions.isError) {
        return Result_1.ResultModule.error(`${expressions.error.index}: ${expressions.error.message}`);
    }
    const result = [];
    for (const expr of expressions.value) {
        if (expr.type === expr2) {
            return Result_1.ResultModule.error('{{と}}で囲む構文は将来のために予約されているため、現在は使用することはできません。');
        }
        if (expr.type === exports.expr1) {
            result.push({ type: exports.expr1, variable: expr.text });
            continue;
        }
        result.push(expr);
    }
    return Result_1.ResultModule.ok(result);
};
exports.analyze = analyze;
