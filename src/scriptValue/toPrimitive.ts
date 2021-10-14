import { FValue } from './FValue';
import { FObjectBase } from './types';

// https://ja.javascript.info/object-toprimitive
export const toPrimitive = (value: FValue, hint: 'default' | 'string' | 'number') => {
    if (value == null) {
        return value;
    }

    if (hint === 'string') {
        return value.toPrimitiveAsString();
    }

    if (hint === 'number') {
        return value.toPrimitiveAsNumber();
    }

    const obj: FObjectBase = value;
    if (obj.toPrimitiveAsDefault == null) {
        return obj.toPrimitiveAsNumber();
    }

    return obj.toPrimitiveAsDefault();
};
