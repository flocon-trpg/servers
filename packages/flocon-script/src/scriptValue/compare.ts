import { toJObject } from '../utils/toJObject';
import { FBoolean } from './FBoolean';
import { FNumber } from './FNumber';
import { FString } from './FString';
import { FValue } from './FValue';
import { toPrimitive } from './toPrimitive';

const compare = <T>(
    left: FValue,
    right: FValue,
    hint: 'default' | 'string' | 'number' | 'JObject',
    comparer: (left: unknown, right: unknown) => T,
): T => {
    if (hint === 'JObject') {
        return comparer(toJObject(left), toJObject(right));
    }
    return comparer(toPrimitive(left, hint), toPrimitive(right, hint));
};

export const compareToNumber = (
    left: FValue,
    right: FValue,
    hint: 'default' | 'string' | 'number',
    comparer: (left: any, right: any) => number,
) => {
    return new FNumber(compare(left, right, hint, comparer));
};

export const compareToBoolean = (
    left: FValue,
    right: FValue,
    hint: 'default' | 'string' | 'number' | 'JObject',
    comparer: (left: any, right: any) => boolean,
) => {
    return new FBoolean(compare(left, right, hint, comparer));
};

export const compareToNumberOrString = (
    left: FValue,
    right: FValue,
    hint: 'default',
    comparer: (left: any, right: any) => number | string,
) => {
    const r = compare(left, right, hint, comparer);
    if (typeof r === 'number') {
        return new FNumber(r);
    }
    return new FString(r);
};
