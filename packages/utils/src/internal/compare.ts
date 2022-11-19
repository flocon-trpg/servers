export type Operator = '=' | '<' | '<=' | '>' | '>=';

export const compare = (left: number, operator: Operator, right: number): boolean => {
    switch (operator) {
        case '=':
            return left === right;
        case '<':
            return left < right;
        case '<=':
            return left <= right;
        case '>':
            return left > right;
        case '>=':
            return left >= right;
    }
};
