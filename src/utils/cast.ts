import { __ } from '../@shared/collection';
import isObject from './isObject';

export const castToArray = <T>(source: unknown, inner: (x: unknown) => T | undefined): T[] | undefined => {
    if (Array.isArray(source)) {
        return __(source.map(inner)).compact(x => x).toArray();
    }
    return undefined;
};

export const castToBoolean = (source: unknown): boolean | undefined => {
    if (typeof source === 'boolean') {
        return source;
    }
    return undefined;
};

export const castToNumber = (source: unknown): number | undefined => {
    if (typeof source === 'number') {
        return source;
    }
    return undefined;
};

export const castToRecord = <T>(source: unknown, inner: (x: unknown) => T | undefined): Record<string, T> | undefined => {
    if (!isObject<Record<string, T>>(source)) {
        return;
    }
    const result: Record<string, T> = {};
    for (const key in source) {
        const element = inner(source[key]);
        if (element !== undefined) {
            result[key] = element;
        }
    }
    return result;
};

export const castToString = (source: unknown): string | undefined => {
    if (typeof source === 'string') {
        return source;
    }
    return undefined;
};

export const castToNullableString = (source: unknown): string | null | undefined => {
    if (source === null) {
        return null;
    }
    if (typeof source === 'string') {
        return source;
    }
    return undefined;
};