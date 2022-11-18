export declare type NonEmptyArray<T> = [T, ...T[]];
export declare type ReadonlyNonEmptyArray<T> = [T, ...T[]];
export declare const isReadonlyNonEmptyArray: <T>(source: readonly T[]) => source is ReadonlyNonEmptyArray<T>;
//# sourceMappingURL=nonEmptyArray.d.ts.map