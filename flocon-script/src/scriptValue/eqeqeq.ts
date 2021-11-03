import { FType } from './FType';
import { FValue } from './FValue';
import { FObjectBase } from './types';

export const eqeqeq = (x: FValue, y: FValue): boolean => {
    if (x === null) {
        return y === null;
    }
    if (x === undefined) {
        return y === undefined;
    }
    const xAsObjectBase: FObjectBase = x;
    if (xAsObjectBase.equals != null) {
        return xAsObjectBase.equals(y, '===');
    }
    switch (x.type) {
        case FType.Boolean:
        case FType.Number:
        case FType.String:
        case FType.Symbol:
            if (y?.type !== x.type) {
                return false;
            }
            return x.raw === y.raw;
        default:
            return x === y;
    }
};
