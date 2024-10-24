import { Option } from '@kizahasi/option';
/** 仮想的にnodeをdeleteできる機能を持ったTreeを表します。内部でnodeにdeleteフラグを立てることでdeleteされたことを表すため、deleteしてもメモリの空き容量は増えません。 */
export declare class DeletableTree<TKey, TValue> {
    #private;
    constructor(rootValue?: Option<TValue>);
    get absolutePath(): readonly TKey[];
    get value(): Option<TValue>;
    /** 指定したkeyにあるnodeを基準とした新しいTreeオブジェクトを返します。nodeへの参照は共有されます。absolutePathは引き継がれます。 */
    createSubTree(key: readonly TKey[], initValue: (absolutePath: readonly TKey[]) => TValue): DeletableTree<TKey, TValue>;
    createSubTreeIfExists(key: readonly TKey[]): DeletableTree<TKey, TValue> | null;
    /** 直接の子の要素を全て取得します。 */
    getChildren(): Map<TKey, DeletableTree<TKey, TValue>>;
    get(key: readonly TKey[]): Option<TValue>;
    ensure<TReplaced extends TValue>(key: readonly TKey[], replacer: (oldValue: Option<TValue>) => TReplaced, initValue: (absolutePath: readonly TKey[]) => TValue): TReplaced;
    delete(key: readonly TKey[]): void;
    traverse(): Iterable<{
        absolutePath: readonly TKey[];
        value: TValue;
    }>;
    get size(): number;
    map<TValue2>(mapping: (oldValue: {
        absolutePath: readonly TKey[];
        value: TValue;
    }) => TValue2): DeletableTree<TKey, TValue2>;
    clone(): DeletableTree<TKey, TValue>;
}
//# sourceMappingURL=deletableTree.d.ts.map