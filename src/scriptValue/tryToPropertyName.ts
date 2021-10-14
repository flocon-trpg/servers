import { FType } from './FType';
import { FValue } from './FValue';

export const tryToPropertyName = (value: FValue): string | undefined => {
    switch (value?.type) {
        case FType.Number:
        case FType.String:
            return value.raw.toString();
        default:
            return undefined;
    }
};
