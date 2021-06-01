import { DualKey, DualKeyMap } from './dualKeyMap';

export const chooseRecord = <TSource, TResult>(
    source: Record<string, TSource>,
    chooser: (element: TSource) => TResult | undefined
): Record<string, TResult> => {
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

export const chooseDualKeyRecord = <TSource, TResult>(
    source: Record<string, Record<string, TSource>>,
    chooser: (element: TSource) => TResult | undefined
): Record<string, Record<string, TResult>> => {
    return chooseRecord(source, inner =>
        inner === undefined
            ? undefined
            : chooseRecord(inner, value => chooser(value))
    );
};

export const mapRecord = <TSource, TResult>(
    source: Record<string, TSource>,
    mapping: (element: TSource) => TResult
): Record<string, TResult> => {
    const result: Record<string, TResult> = {};
    for (const key in source) {
        const element = source[key];
        if (element !== undefined) {
            const newElement = mapping(element);
            result[key] = newElement;
        }
    }
    return result;
};

export const mapDualKeyRecord = <TSource, TResult>(
    source: Record<string, Record<string, TSource>>,
    mapping: (element: TSource) => TResult
): Record<string, Record<string, TResult>> => {
    return chooseRecord(source, inner =>
        inner === undefined
            ? undefined
            : mapRecord(inner, value => mapping(value))
    );
};

export const recordToArray = <T>(
    source: Record<string, T>
): { key: string; value: T }[] => {
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

export const dualKeyRecordToDualKeyMap = <T>(
    source: Record<string, Record<string, T>>
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

/**
 * @deprecated Use dualKeyRecordToDualKeyMap instead.
 */
export const recordToDualKeyMap = dualKeyRecordToDualKeyMap;

export const mapToRecord = <TValue>(
    source: Map<string, TValue>
): Record<string, TValue> => {
    const result: Record<string, TValue> = {};
    source.forEach((value, key) => {
        result[key] = value;
    });
    return result;
};

export const recordForEach = <T>(
    source: Record<string, T | undefined>,
    action: (value: T, key: string) => void
): void => {
    for (const key in source) {
        const value = source[key];
        if (value === undefined) {
            continue;
        }
        action(value, key);
    }
};

export const recordForEachAsync = async <T>(
    source: Record<string, T | undefined>,
    action: (value: T, key: string) => Promise<void>
): Promise<void> => {
    for (const key in source) {
        const value = source[key];
        if (value === undefined) {
            continue;
        }
        await action(value, key);
    }
};

export const isRecordEmpty = <T>(source: Record<string, T>) => {
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

export const dualKeyRecordFind = <T>(
    source: Record<string, Record<string, T | undefined> | undefined>,
    key: DualKey<string, string>
) => {
    const inner = source[key.first];
    if (inner === undefined) {
        return undefined;
    }
    return inner[key.second];
};
