export const maybeDice = 'maybeDice';
export const parameter = 'parameter';

export type MaybeDice = {
    type: typeof maybeDice;
    command: string;
}

export type CompareOperator = '≦' | '<=' | '≧' | '>=' | '＜' | '<' | '＞' | '>' | '≠' | '!=' | '＝' | '=';
const compareOperatorRegex = /(≦|<=|≧|>=|＜|<|＞|>|≠|!=|＝|=)/u;
const isCompareOperator = (str: string): str is CompareOperator => {
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
export const executeCompareOperator = (left: number, right: number, operator: CompareOperator): boolean => {
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
export const prettifyOperator = (operator: CompareOperator): CompareOperator => {
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

export type Parameter = {
    type: typeof parameter;
    parameter: string;
}

const toMaybeDiceOrParameter = (token: string): MaybeDice | Parameter => {
    const parameterMatch = token.trim().match(/^[{｛](?<value>.*)[}｝]$/u);
    const parameterGroups = parameterMatch?.groups;
    if (parameterGroups != null) {
        const value = parameterGroups['value'];
        if (value == null) {
            throw 'This should not happen. value == null';
        }
        return {
            type: parameter,
            parameter: value,
        };
    }
    return {
        type: maybeDice,
        command: token.trim(),
    };
};

export type Expression = {
    isCompare: true;
    left: MaybeDice | Parameter;
    compareOperator: CompareOperator;
    right: MaybeDice | Parameter;
} | {
    isCompare: false;
    text: MaybeDice | Parameter;
}

export const analyze = (text: string): Expression | null => {
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