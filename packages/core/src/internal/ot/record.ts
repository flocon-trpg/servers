import { z } from 'zod';

export const isEmptyRecord = (source: Record<string, unknown>): boolean => {
    for (const key in source) {
        const value = source[key];
        if (value !== undefined) {
            return false;
        }
    }
    return true;
};

export const isIdRecord = (source: Record<string, unknown>): boolean => {
    for (const key in source) {
        if (key === '$v' || key === '$r') {
            continue;
        }
        const value = source[key];
        if (value !== undefined) {
            return false;
        }
    }
    return true;
};

export const record = <Value extends z.ZodTypeAny>(value: Value) =>
    z.record(z.union([value, z.undefined()]));

export type StringKeyRecord<T> = Record<string, T | undefined>;
