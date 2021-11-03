// 例えばxとyがObjectのときは x === y で比較されるため、「toPrimitiveで変換してから==で比較」という作戦は使えない。そのため、ここで専用の関数を定義している。

import { FType } from './FType';
import { FValue } from './FValue';
import { toPrimitive } from './toPrimitive';
import { FObjectBase } from './types';

// https://developer.mozilla.org/ja/docs/Web/JavaScript/Equality_comparisons_and_sameness
export const eqeq = (x: FValue, y: FValue): boolean => {
    if (x == null) {
        return y == null;
    }
    if (y == null) {
        return false;
    }
    const xAsObjectBase: FObjectBase = x;
    if (xAsObjectBase.equals != null) {
        return xAsObjectBase.equals(y, '==');
    }

    switch (x.type) {
        case FType.Boolean:
        case FType.Number:
        case FType.String:
        case FType.Symbol:
            switch (y.type) {
                case FType.Boolean:
                case FType.Number:
                case FType.String:
                    // eslint-disable-next-line eqeqeq
                    return x.raw == y.raw;
                default:
                    // eslint-disable-next-line eqeqeq
                    return x.raw == toPrimitive(y, 'default');
            }
        default:
            switch (y.type) {
                case FType.Boolean:
                case FType.Number:
                case FType.String:
                case FType.Symbol:
                    // eslint-disable-next-line eqeqeq
                    return toPrimitive(x, 'default') == y.raw;
                default:
                    return x === y;
            }
    }
};
