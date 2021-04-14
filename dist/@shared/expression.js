"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyze = exports.prettifyOperator = exports.executeCompareOperator = exports.parameter = exports.maybeDice = void 0;
exports.maybeDice = 'maybeDice';
exports.parameter = 'parameter';
const compareOperatorRegex = /(≦|<=|≧|>=|＜|<|＞|>|≠|!=|＝|=)/u;
const isCompareOperator = (str) => {
    switch (str) {
        case '≦':
        case '<=':
        case '≧':
        case '>=':
        case '＜':
        case '<':
        case '＞':
        case '>':
        case '≠':
        case '!=':
        case '＝':
        case '=':
            return true;
        default:
            return false;
    }
};
const executeCompareOperator = (left, right, operator) => {
    switch (operator) {
        case '≦':
        case '<=':
            return left <= right;
        case '≧':
        case '>=':
            return left >= right;
        case '＜':
        case '<':
            return left < right;
        case '＞':
        case '>':
            return left > right;
        case '≠':
        case '!=':
            return left != right;
        case '＝':
        case '=':
            return left == right;
    }
};
exports.executeCompareOperator = executeCompareOperator;
const prettifyOperator = (operator) => {
    switch (operator) {
        case '≦':
        case '<=':
            return '≦';
        case '≧':
        case '>=':
            return '≧';
        case '＜':
        case '<':
            return '＜';
        case '＞':
        case '>':
            return '＞';
        case '≠':
        case '!=':
            return '≠';
        case '＝':
        case '=':
            return '＝';
    }
};
exports.prettifyOperator = prettifyOperator;
const toMaybeDiceOrParameter = (token) => {
    const parameterMatch = token.trim().match(/^[{｛](?<value>.*)[}｝]$/u);
    const parameterGroups = parameterMatch === null || parameterMatch === void 0 ? void 0 : parameterMatch.groups;
    if (parameterGroups != null) {
        const value = parameterGroups['value'];
        if (value == null) {
            throw 'This should not happen. value == null';
        }
        return {
            type: exports.parameter,
            parameter: value,
        };
    }
    return {
        type: exports.maybeDice,
        command: token.trim(),
    };
};
const analyze = (text) => {
    const tokens = text.split(compareOperatorRegex);
    if (tokens.length !== 3) {
        return {
            isCompare: false,
            text: toMaybeDiceOrParameter(text)
        };
    }
    const [rawLeft, rawOperator, rawRight] = tokens;
    const operator = isCompareOperator(rawOperator) ? rawOperator : null;
    if (operator == null) {
        return null;
    }
    const left = toMaybeDiceOrParameter(rawLeft);
    const right = toMaybeDiceOrParameter(rawRight);
    if (left == null || right == null) {
        return null;
    }
    return {
        isCompare: true,
        left,
        compareOperator: operator,
        right,
    };
};
exports.analyze = analyze;
