export type ReadonlyNonEmptyArray<T> = readonly [T, ...T[]];

export const isNonEmptyArray = <T>(source: ReadonlyArray<T>): source is ReadonlyNonEmptyArray<T> =>
    source.length > 0;
