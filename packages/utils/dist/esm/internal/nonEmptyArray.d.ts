export type NonEmptyArray<T> = [T, ...T[]];
export type ReadonlyNonEmptyArray<T> = [T, ...T[]];
export declare const isReadonlyNonEmptyArray: <T>(source: ReadonlyArray<T>) => source is ReadonlyNonEmptyArray<T>;
//# sourceMappingURL=nonEmptyArray.d.ts.map