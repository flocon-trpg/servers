import { FValue } from './FValue';

export const toTypeName = (value: FValue) => {
    if (value === null) {
        return 'null';
    }
    if (value === undefined) {
        return 'undefined';
    }
    return value.type;
};
