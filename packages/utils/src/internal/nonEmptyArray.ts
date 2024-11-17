export type NonEmptyArray<T> = [T, ...T[]];
export type ReadonlyNonEmptyArray<T> = [T, ...T[]];
export const isReadonlyNonEmptyArray = <T>(
    source: ReadonlyArray<T>,
): source is ReadonlyNonEmptyArray<T> => source.length > 0;
