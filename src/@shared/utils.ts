import { DualKey } from './DualKeyMap';

export const chooseRecord = <TSource, TResult>(source: Record<string, TSource>, chooser: (element: TSource) => TResult | undefined): Record<string, TResult> => {
    const result: Record<string, TResult> = {};
    for (const key in source) {
        const element = source[key];
        if (element !== undefined) {
            const newElement = chooser(element);
            if (newElement !== undefined) {
                result[key] = newElement;
            }
        }
    }
    return result;
};

export const chooseDualKeyRecord = <TSource, TResult>(source: Record<string, Record<string, TSource>>, chooser: (element: TSource) => TResult | undefined): Record<string, Record<string, TResult>> => {
    const result: Record<string, Record<string, TResult>> = {};
    for (const key in source) {
        const element = source[key];
        if (element !== undefined) {
            result[key] = chooseRecord(element, chooser);
        }
    }
    return result;
};

export const recordToArray = <T>(source: Record<string, T>): { key: string; value: T }[] => {
    const result: { key: string; value: T }[] = [];
    for (const key in source) {
        const value = source[key];
        if (value !== undefined) {
            result.push({ key, value });
        }
    }
    return result;
};

export const recordToMap = <T>(source: Record<string, T>): Map<string, T> => {
    const result = new Map<string, T>();
    for (const key in source) {
        const value = source[key];
        if (value !== undefined) {
            result.set(key, value);
        }
    }
    return result;
};

export const mapToRecord = <TValue>(source: Map<string, TValue>): Record<string, TValue> => {
    const result: Record<string, TValue> = {};
    source.forEach((value, key) => {
        result[key] = value;
    });
    return result;
};

export const recordForEach = <T>(source: Record<string, T | undefined>, action: (value: T, key: string) => void): void => {
    for (const key in source) {
        const value = source[key];
        if (value === undefined) {
            continue;
        }
        action(value, key);
    }
};

export const recordForEachAsync = async <T>(source: Record<string, T | undefined>, action: (value: T, key: string) => Promise<void>): Promise<void> => {
    for (const key in source) {
        const value = source[key];
        if (value === undefined) {
            continue;
        }
        await action(value, key);
    }
};

export const dualKeyRecordForEach = <T>(source: Record<string, Record<string, T | undefined> | undefined>, action: (value: T, key: DualKey<string, string>) => void): void => {
    for (const first in source) {
        const inner = source[first];
        if (inner === undefined) {
            continue;
        }
        for (const second in inner) {
            const value = inner[second];
            if (value === undefined) {
                continue;
            }
            action(value, { first, second });
        }
    }
};

export const recordCompact = <T1, T2>(source: Record<string, T1 | undefined>, mapping: (value: T1, key: string) => T2 | undefined) => {
    const result: Record<string, T2> = {};
    for (const key in source) {
        const prevValue = source[key];
        if (prevValue === undefined) {
            continue;
        }
        const nextValue = mapping(prevValue, key);
        if (nextValue === undefined) {
            continue;
        }
        result[key] = nextValue;
    }
    return result;
};

export const dualKeyRecordFind = <T>(source: Record<string, Record<string, T | undefined> | undefined>, key: DualKey<string, string>) => {
    const inner = source[key.first];
    if (inner === undefined) {
        return undefined;
    }
    return inner[key.second];
};