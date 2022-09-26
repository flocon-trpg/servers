import { Option, Some } from '@kizahasi/option';
import { choose } from './iterable';
import { Tree } from './tree';

/** 複数のkeyを使用できるMap */
// valueがNoneであり、なおかつchildrenを再帰的にたどってもSomeであるvalueがないようなNodeは不必要である。だが、現時点ではそれをgarbage collectする機能はない。
export class MultiKeyMap<TKey, TValue> {
    #source: Tree<TKey, Option<TValue>>;

    public constructor() {
        this.#source = new Tree(Option.none());
    }

    public get absolutePath() {
        return this.#source.absolutePath;
    }

    public createSubMap(key: readonly TKey[]) {
        const result = new MultiKeyMap<TKey, TValue>();
        result.#source = this.#source.createSubTree(key, () => Option.none());
        return result;
    }

    /** 直接の子の要素を全て取得します。 */
    public getChildren() {
        const result = new Map<TKey, MultiKeyMap<TKey, TValue>>();
        for (const [childKey, childValue] of this.#source.getChildren()) {
            const newValue = new MultiKeyMap<TKey, TValue>();
            newValue.#source = childValue;
            result.set(childKey, newValue);
        }
        return result;
    }

    public get(key: readonly TKey[]) {
        const resultAsOption = this.#source.get(key);
        if (resultAsOption === undefined) {
            return undefined;
        }
        if (resultAsOption.isNone) {
            return undefined;
        }
        return resultAsOption.value.value;
    }

    public replace<TReplaced extends TValue | undefined>(
        key: readonly TKey[],
        replacer: (oldValue: TValue | undefined) => TReplaced
    ): TReplaced {
        const result = this.#source.ensure(
            key,
            oldValue => {
                const newValue = replacer(oldValue.value);
                if (newValue === undefined) {
                    return Option.none();
                }
                return Option.some(newValue) as Some<TValue>;
            },
            () => Option.none()
        );
        return (result.isNone ? undefined : result.value) as TReplaced;
    }

    public ensure(key: readonly TKey[], onCreate: () => TValue) {
        return this.replace(key, oldValue => (oldValue === undefined ? onCreate() : oldValue));
    }

    public set(key: readonly TKey[], newValue: TValue) {
        this.replace(key, () => newValue);
    }

    public delete(key: readonly TKey[]) {
        this.replace(key, () => undefined);
    }

    public traverse(): Iterable<{ absolutePath: readonly TKey[]; value: TValue }> {
        return choose(this.#source.traverse(), element => {
            if (element.value.isNone) {
                return Option.none();
            }
            return Option.some({
                absolutePath: element.absolutePath,
                value: element.value.value,
            });
        });
    }

    public get size(): number {
        return [...this.traverse()].length;
    }

    public map<TValue2>(
        mapping: (oldValue: { value: TValue; absolutePath: readonly TKey[] }) => TValue2 | undefined
    ): MultiKeyMap<TKey, TValue2> {
        const newSource = this.#source.map(oldValue => {
            if (oldValue.value.isNone) {
                return oldValue.value;
            }
            const newValue = mapping({
                absolutePath: oldValue.absolutePath,
                value: oldValue.value.value,
            });
            if (newValue === undefined) {
                return Option.none();
            }
            return Option.some(newValue);
        });
        const result = new MultiKeyMap<TKey, TValue2>();
        result.#source = newSource;
        return result;
    }
}
