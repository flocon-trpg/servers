import { FType } from './FType';
import { FValue } from './FValue';

export const eqeqeq = (x: FValue, y: FValue): boolean => {
    if (x === null) {
        return y === null;
    }
    if (x === undefined) {
        return y === undefined;
    }
    switch (x.type) {
        case FType.Boolean:
        case FType.Number:
        case FType.String:
            if (y?.type !== x.type) {
                return false;
            }
            return x.raw === y.raw;
        default:
            return x === y;
    }
};
