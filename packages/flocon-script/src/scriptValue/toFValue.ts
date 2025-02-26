/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { FArray } from './FArray';
import { FBoolean } from './FBoolean';
import { FFunction } from './FFunction';
import { FMap } from './FMap';
import { FNumber } from './FNumber';
import { FObject } from './FObject';
import { FString } from './FString';
import { FSymbol } from './FSymbol';
import { FValue } from './FValue';
import { toFRecord } from './toFRecord';

export function toFValue(source: unknown): FValue {
    if (source === null) {
        return null;
    }
    if (source === undefined) {
        return undefined;
    }
    switch (typeof source) {
        case 'boolean':
            return new FBoolean(source);
        case 'number':
            return new FNumber(source);
        case 'string':
            return new FString(source);
        case 'symbol':
            return new FSymbol(source);
        case 'function':
            throw new Error('Function is not supported. Use FFunction instead.');
        default:
            break;
    }
    if (
        source instanceof FArray ||
        source instanceof FBoolean ||
        source instanceof FFunction ||
        source instanceof FNumber ||
        source instanceof FObject ||
        source instanceof FString ||
        source instanceof FSymbol
    ) {
        return source;
    }
    if (Array.isArray(source)) {
        return FArray.create(source.map(x => toFValue(x)));
    }
    if (source instanceof Map) {
        return FMap.create(source);
    }
    return toFRecord(source as Record<string, unknown>);
}
