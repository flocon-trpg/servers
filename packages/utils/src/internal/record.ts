// Recordのkeyは、numberはstringとして解釈され、symbolはfor in文で列挙されないため、stringのみの対応としている。

import { DualKey, DualKeyMap } from './dualKeyMap';

export const mapToRecord = <TValue>(source: Map<string, TValue>): Record<string, TValue> => {
    const result: Record<string, TValue> = {};
    source.forEach((value, key) => {
        if (result[key] !== undefined) {
            // プロトタイプ汚染などを防いでいる。ただ、これで十分なのだろうか？
            throw new Error(`${key} already exists`);
        }
        result[key] = value;
    });
    return result;
};

export const chooseRecord = <TSource, TResult>(
    source: Record<string, TSource | undefined>,
    chooser: (element: TSource, key: string) => TResult | undefined
): Record<string, TResult> => {
    const result = new Map<string, TResult>();
    for (const key in source) {
        const element = source[key];
        if (element !== undefined) {
            const newElement = chooser(element, key);
            if (newElement !== undefined) {
                result.set(key, newElement);
            }
        }
    }
    return mapToRecord(result);
};

export const chooseDualKeyRecord = <TSource, TResult>(
    source: Record<string, Record<string, TSource | undefined> | undefined>,
    chooser: (element: TSource, key: DualKey<string, string>) => TResult | undefined
): Record<string, Record<string, TResult>> => {
    return chooseRecord(source, (inner, key1) =>
        inner === undefined
            ? undefined
            : chooseRecord(inner, (value, key2) => chooser(value, { first: key1, second: key2 }))
    );
};

export const mapRecord = <TSource, TResult>(
    source: Record<string, TSource | undefined>,
    mapping: (element: TSource, key: string) => TResult
): Record<string, TResult> => {
    const result = new Map<string, TResult>();
    for (const key in source) {
        const element = source[key];
        if (element !== undefined) {
            const newElement = mapping(element, key);
            result.set(key, newElement);
        }
    }
    return mapToRecord(result);
};

export const mapDualKeyRecord = <TSource, TResult>(
    source: Record<string, Record<string, TSource | undefined> | undefined>,
    mapping: (element: TSource, key: DualKey<string, string>) => TResult
): Record<string, Record<string, TResult>> => {
    return chooseRecord(source, (inner, key1) =>
        inner === undefined
            ? undefined
            : mapRecord(inner, (value, key2) => mapping(value, { first: key1, second: key2 }))
    );
};

export function* recordToIterator<T>(
    source: Record<string, T | undefined>
): IterableIterator<{ key: string; value: T }> {
    for (const key in source) {
        const value = source[key];
        if (value !== undefined) {
            yield { key, value };
        }
    }
}

export const getExactlyOneKey = (record: Record<string, unknown>): string => {
    let lastKey: string | null = null;
    for (const pair of recordToIterator(record)) {
        if (lastKey != null) {
            throw new Error('Expected length to be 1, but actually more than 1.');
        }
        lastKey = pair.key;
    }
    if (lastKey == null) {
        throw new Error('Expected length to be 1, but actually 0.');
    }
    return lastKey;
};

export const recordToArray = <T>(
    source: Record<string, T | undefined>
): { key: string; value: T }[] => {
    return [...recordToIterator(source)];
};

export const recordToMap = <T>(source: Record<string, T | undefined>): Map<string, T> => {
    const result = new Map<string, T>();
    for (const key in source) {
        const value = source[key];
        if (value !== undefined) {
            result.set(key, value);
        }
    }
    return result;
};

export const dualKeyRecordToDualKeyMap = <T>(
    source: Record<string, Record<string, T | undefined> | undefined>
): DualKeyMap<string, string, T> => {
    const result = new DualKeyMap<string, string, T>();
    for (const first in source) {
        const innerRecord = source[first];
        if (innerRecord !== undefined) {
            for (const second in innerRecord) {
                const value = innerRecord[second];
                if (value !== undefined) {
                    result.set({ first, second }, value);
                }
            }
        }
    }
    return result;
};

export const recordForEach = <T>(
    source: Record<string, T | undefined>,
    action: (value: T, key: string) => void
): void => {
    for (const pair of recordToIterator(source)) {
        action(pair.value, pair.key);
    }
};

export const recordForEachAsync = async <T>(
    source: Record<string, T | undefined>,
    action: (value: T, key: string) => Promise<void>
): Promise<void> => {
    for (const pair of recordToIterator(source)) {
        await action(pair.value, pair.key);
    }
};

export const isRecordEmpty = <T>(source: Record<string, T | undefined>) => {
    for (const key in source) {
        const value = source[key];
        if (value !== undefined) {
            return false;
        }
    }
    return true;
};

export const dualKeyRecordForEach = <T>(
    source: Record<string, Record<string, T | undefined> | undefined>,
    action: (value: T, key: DualKey<string, string>) => void
): void => {
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
