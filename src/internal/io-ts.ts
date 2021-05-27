import * as t from 'io-ts';

export const maybe = <T extends t.Mixed>(source: T) =>
    t.union([source, t.null, t.undefined]);
export type Maybe<T> = T | null | undefined;
