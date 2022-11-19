/** ミュータブルな木構造を表します。nodeをdeleteする機能は現時点では未実装です。*/
export declare class Tree<TKey, TValue> {
    #private;
    constructor(rootNodeValue: TValue);
    private static createTree;
    get absolutePath(): readonly TKey[];
    get value(): TValue;
    /** 指定したkeyにあるnodeを基準とした新しいTreeオブジェクトを返します。nodeへの参照は共有されます。absolutePathは引き継がれます。 */
    createSubTree(key: readonly TKey[], initValue: (absolutePath: readonly TKey[]) => TValue): Tree<TKey, TValue>;
    createSubTreeIfExists(key: readonly TKey[]): Tree<TKey, TValue> | null;
    /** 直接の子の要素を全て取得します。 */
    getChildren(): Map<TKey, Tree<TKey, TValue>>;
    get(key: readonly TKey[]): import("@kizahasi/option").None | import("@kizahasi/option").Some<TValue>;
    ensure<TReplaced extends TValue>(key: readonly TKey[], replacer: (oldValue: TValue) => TReplaced, initValue: (absolutePath: readonly TKey[]) => TValue): TReplaced;
    traverse(): Iterable<{
        absolutePath: readonly TKey[];
        value: TValue;
    }>;
    replaceAllValues(replacer: (oldValue: {
        absolutePath: readonly TKey[];
        value: TValue;
    }) => TValue): void;
    get size(): number;
    map<TValue2>(mapping: (oldValue: {
        absolutePath: readonly TKey[];
        value: TValue;
    }) => TValue2): Tree<TKey, TValue2>;
}
//# sourceMappingURL=tree.d.ts.map