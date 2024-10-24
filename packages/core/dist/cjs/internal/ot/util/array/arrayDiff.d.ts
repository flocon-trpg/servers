import { ReadonlyNonEmptyArray } from '@flocon-trpg/utils';
export declare const arrayDiff: <T, TKey>({ prev, next, getKey, }: {
    prev: readonly T[];
    next: readonly T[];
    /** 要素の等価比較に用いられるキーを生成するための関数。 */
    getKey: (x: T) => TKey;
}) => {
    value: import("@kizahasi/ot-core").Operation<ReadonlyNonEmptyArray<T>, ReadonlyNonEmptyArray<T>>;
    iterate: () => IterableIterator<import("@kizahasi/ot-core").OperationArrayElement<ReadonlyNonEmptyArray<T>, ReadonlyNonEmptyArray<T>>>;
    toUnits: () => IterableIterator<import("@kizahasi/ot-core").OperationUnit<ReadonlyNonEmptyArray<T>, ReadonlyNonEmptyArray<T>>>;
};
//# sourceMappingURL=arrayDiff.d.ts.map