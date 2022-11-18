/** 複数のkeyを使用できるMap */
export declare class MultiKeyMap<TKey, TValue> {
    #private;
    constructor();
    get absolutePath(): readonly TKey[];
    createSubMap(key: readonly TKey[]): MultiKeyMap<TKey, TValue>;
    /** 直接の子の要素を全て取得します。 */
    getChildren(): Map<TKey, MultiKeyMap<TKey, TValue>>;
    get(key: readonly TKey[]): TValue | undefined;
    replace<TReplaced extends TValue | undefined>(key: readonly TKey[], replacer: (oldValue: TValue | undefined) => TReplaced): TReplaced;
    ensure(key: readonly TKey[], onCreate: () => TValue): TValue;
    set(key: readonly TKey[], newValue: TValue): void;
    delete(key: readonly TKey[]): void;
    traverse(): Iterable<{
        absolutePath: readonly TKey[];
        value: TValue;
    }>;
    get size(): number;
    map<TValue2>(mapping: (oldValue: {
        value: TValue;
        absolutePath: readonly TKey[];
    }) => TValue2 | undefined): MultiKeyMap<TKey, TValue2>;
}
//# sourceMappingURL=multiKeyMap.d.ts.map