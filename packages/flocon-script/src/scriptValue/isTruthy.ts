import { FType } from './FType';
import { FValue } from './FValue';

// https://developer.mozilla.org/ja/docs/Glossary/Falsy
export const isTruthy = (value: FValue): boolean => {
    if (value == null) {
        return false;
    }
    switch (value.type) {
        case FType.Boolean:
        case FType.Number:
        case FType.String:
        case FType.Symbol:
            if (value.raw) {
                return true;
            } else {
                return false;
            }
        default:
            return true;
    }
};
