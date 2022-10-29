import * as t from 'io-ts';

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

export const record = <TDomain extends t.Mixed, TCodomain extends t.Mixed>(
    domain: TDomain,
    codomain: TCodomain
) => t.record(domain, t.union([codomain, t.undefined]));

export type StringKeyRecord<T> = Record<string, T | undefined>;
