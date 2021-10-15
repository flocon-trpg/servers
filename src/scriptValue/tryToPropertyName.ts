import { FType } from './FType';
import { FValue } from './FValue';

export const tryToPropertyName = (value: FValue): string | symbol | undefined => {
    switch (value?.type) {
        case FType.Number:
        case FType.String:
            return value.raw.toString();
        case FType.Symbol:
            return value.raw;
        default:
            return undefined;
    }
};
