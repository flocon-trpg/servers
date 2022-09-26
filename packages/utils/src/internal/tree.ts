import { Option } from '@kizahasi/option';
import { map } from './iterable';

type Node<TKey, TValue> = {
    absolutePath: readonly TKey[];
    value: TValue;
    children: Map<TKey, Node<TKey, TValue>>;
};

/** ミュータブルな木構造を表します。nodeをdeleteする機能は現時点では未実装です。*/
export class Tree<TKey, TValue> {
    #currentNode: Node<TKey, TValue>;

    public constructor(rootNodeValue: TValue) {
        this.#currentNode = {
            absolutePath: [],
            value: rootNodeValue,
            children: new Map(),
        };
    }

    private static createTree<TKey, TValue>(node: Node<TKey, TValue>) {
        const result = new Tree<TKey, TValue | undefined>(undefined) as Tree<TKey, TValue>;
        result.#currentNode = node;
        return result;
    }

    #ensureNode(key: readonly TKey[], initValue: (absolutePath: readonly TKey[]) => TValue) {
        let result = this.#currentNode;
        for (const dir of key) {
            let next = result.children.get(dir);
            if (next == null) {
                const absolutePath = [...result.absolutePath, dir];
                next = {
                    absolutePath,
                    value: initValue(absolutePath),
                    children: new Map(),
                };
                result.children.set(dir, next);
            }
            result = next;
        }
        return result;
    }

    #getNode(key: readonly TKey[]) {
        let result = this.#currentNode;
        for (const keyElement of key) {
            const next = result.children.get(keyElement);
            if (next == null) {
                return null;
            }
            result = next;
        }
        return result;
    }

    public get absolutePath() {
        return this.#currentNode.absolutePath;
    }

    public get value() {
        return this.#currentNode.value;
    }

    /** 指定したkeyにあるnodeを基準とした新しいTreeオブジェクトを返します。nodeへの参照は共有されます。absolutePathは引き継がれます。 */
    public createSubTree(
        key: readonly TKey[],
        initValue: (absolutePath: readonly TKey[]) => TValue
    ) {
        const node = this.#ensureNode(key, initValue);
        return Tree.createTree(node);
    }

    public createSubTreeIfExists(key: readonly TKey[]) {
        if (this.get(key).isNone) {
            return null;
        }
        return this.createSubTree(key, () => {
            throw new Error('This should not happen');
        });
    }

    /** 直接の子の要素を全て取得します。 */
    public getChildren() {
        const result = new Map<TKey, Tree<TKey, TValue>>();
        for (const [childKey, childNode] of this.#currentNode.children) {
            result.set(childKey, Tree.createTree(childNode));
        }
        return result;
    }

    public get(key: readonly TKey[]) {
        const node = this.#getNode(key);
        if (node == null) {
            return Option.none();
        }
        return Option.some(node.value);
    }

    public ensure<TReplaced extends TValue>(
        key: readonly TKey[],
        replacer: (oldValue: TValue) => TReplaced,
        initValue: (absolutePath: readonly TKey[]) => TValue
    ): TReplaced {
        const node = this.#ensureNode(key, initValue);
        const result = replacer(node.value);
        node.value = result;
        return result;
    }

    #traverseNodes() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        function* main(): IterableIterator<Node<TKey, TValue>> {
            yield self.#currentNode;
            for (const [, child] of self.getChildren()) {
                yield* child.#traverseNodes();
            }
        }
        return main();
    }

    public traverse(): Iterable<{ absolutePath: readonly TKey[]; value: TValue }> {
        return map(this.#traverseNodes(), elem => ({
            absolutePath: elem.absolutePath,
            value: elem.value,
        }));
    }

    public replaceAllValues(
        replacer: (oldValue: { absolutePath: readonly TKey[]; value: TValue }) => TValue
    ) {
        for (const elem of this.#traverseNodes()) {
            elem.value = replacer({ absolutePath: elem.absolutePath, value: elem.value });
        }
    }

    public get size(): number {
        return [...this.traverse()].length;
    }

    #mapNode<TValue2>(
        source: Node<TKey, TValue>,
        mapping: (source: TValue, absolutePath: readonly TKey[]) => TValue2
    ): Node<TKey, TValue2> {
        const childrenClone = new Map<TKey, Node<TKey, TValue2>>();
        for (const [sourceChildKey, sourceChild] of source.children) {
            childrenClone.set(sourceChildKey, this.#mapNode(sourceChild, mapping));
        }
        return {
            absolutePath: source.absolutePath,
            value: mapping(source.value, source.absolutePath),
            children: childrenClone,
        };
    }

    public map<TValue2>(
        mapping: (oldValue: { absolutePath: readonly TKey[]; value: TValue }) => TValue2
    ): Tree<TKey, TValue2> {
        const newNode = this.#mapNode(this.#currentNode, (oldValue, absolutePath) =>
            mapping({ value: oldValue, absolutePath })
        );
        return Tree.createTree(newNode);
    }
}
