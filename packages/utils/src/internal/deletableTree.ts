import { Option } from '@kizahasi/option';
import { choose } from './iterable';
import { Tree } from './tree';

/** 仮想的にnodeをdeleteできる機能を持ったTreeを表します。内部でnodeにdeleteフラグを立てることでdeleteされたことを表すため、deleteしてもメモリの空き容量は増えません。 */
export class DeletableTree<TKey, TValue> {
    #source: Tree<TKey, Option<TValue>>;

    public constructor(rootValue: Option<TValue> = Option.none()) {
        this.#source = new Tree(rootValue);
    }

    public get absolutePath() {
        return this.#source.absolutePath;
    }

    public get value() {
        // 常に this.get([]) と等しい
        return this.#source.value;
    }

    /** 指定したkeyにあるnodeを基準とした新しいTreeオブジェクトを返します。nodeへの参照は共有されます。absolutePathは引き継がれます。 */
    public createSubTree(
        key: readonly TKey[],
        initValue: (absolutePath: readonly TKey[]) => TValue
    ) {
        const result = new DeletableTree<TKey, TValue>();
        const newTree = this.#source.createSubTree(key, absolutePath =>
            Option.some(initValue(absolutePath))
        );
        result.#source = newTree;
        return result;
    }

    /** 直接の子の要素を全て取得します。 */
    public getChildren() {
        const result = new Map<TKey, DeletableTree<TKey, TValue>>();
        for (const [childKey] of this.#source.getChildren()) {
            if (this.get([childKey]).isNone) {
                continue;
            }
            result.set(
                childKey,
                this.createSubTree([childKey], () => {
                    throw new Error('This should not happen');
                })
            );
        }
        return result;
    }

    public get(key: readonly TKey[]): Option<TValue> {
        const node = this.#source.get(key);
        if (node.isNone) {
            return Option.none();
        }
        if (node.value.isNone) {
            return Option.none();
        }
        return Option.some(node.value.value);
    }

    public ensure<TReplaced extends TValue>(
        key: readonly TKey[],
        replacer: (oldValue: Option<TValue>) => TReplaced,
        initValue: (absolutePath: readonly TKey[]) => TValue
    ): TReplaced {
        const result = this.#source.ensureAndReplace(
            key,
            oldValue => Option.some(replacer(oldValue)),
            () => Option.none()
        );

        const absolutePath: TKey[] = [];
        const ensure = () => {
            this.#source.ensureAndReplace(
                absolutePath,
                oldValue => {
                    if (oldValue.isNone) {
                        return Option.some(initValue(absolutePath));
                    }
                    return oldValue;
                },
                () => Option.none()
            );
        };

        ensure();
        for (const k of key) {
            absolutePath.push(k);
            ensure();
        }

        return result.value;
    }

    public delete(key: readonly TKey[]) {
        if (this.get(key).isNone) {
            return;
        }

        const subTree = this.#source.createSubTree(key, () => {
            throw new Error('This should not happen');
        });
        // keyのNodeとその子孫すべてをNoneに置き換えている。
        subTree.replaceAllValues(() => Option.none());
    }

    public traverse(): Iterable<{ absolutePath: readonly TKey[]; value: TValue }> {
        return choose(this.#source.traverse(), elem => {
            if (elem.value.isNone) {
                return Option.none();
            }
            return Option.some({ absolutePath: elem.absolutePath, value: elem.value.value });
        });
    }

    public get size(): number {
        return [...this.traverse()].length;
    }

    public map<TValue2>(
        mapping: (oldValue: { absolutePath: readonly TKey[]; value: TValue }) => TValue2
    ): DeletableTree<TKey, TValue2> {
        const newTree = this.#source.map(oldValue => {
            if (oldValue.value.isNone) {
                return oldValue.value;
            }
            return Option.some(
                mapping({ absolutePath: oldValue.absolutePath, value: oldValue.value.value })
            );
        });
        const result = new DeletableTree<TKey, TValue2>();
        result.#source = newTree;
        return result;
    }

    public clone() {
        return this.map(({ value }) => value);
    }
}
