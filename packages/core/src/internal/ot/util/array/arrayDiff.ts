import {
    ReadonlyNonEmptyArray,
    both,
    groupJoinArray,
    isReadonlyNonEmptyArray,
    pairwiseIterable,
} from '@flocon-trpg/utils';
import { OperationBuilder, PositiveInt } from '@kizahasi/ot-core';

class NodeAndEdges<T> {
    constructor(
        readonly node: T,
        /** この node が始点となる edge の全てのうち、それらの終点を表します。 */
        readonly edgeTargetNodes: readonly NodeAndEdges<T>[],
    ) {}

    #longestPathsMemo: readonly { path: readonly T[] }[] | null = null;
    /** この node を始点とした、最長の path を返します。この node は含まれます。最長の path が複数ある場合はすべて返します。 */
    // 値はメモ化されるため、longestPath を実行した後に edgeTargetNodes を変更してはならない。
    longestPaths(): readonly { path: readonly T[] }[] {
        if (this.#longestPathsMemo != null) {
            return this.#longestPathsMemo;
        }

        let longestPaths: { path: readonly T[] }[] = [{ path: [this.node] }];
        let longestPathLength = 1;
        for (const edgeTargetNode of this.edgeTargetNodes) {
            for (const longestPath of edgeTargetNode.longestPaths()) {
                const path = [this.node, ...longestPath.path];
                if (path.length < longestPathLength) {
                    continue;
                }
                if (path.length === longestPathLength) {
                    longestPaths.push({ path });
                    continue;
                }
                longestPaths = [{ path }];
                longestPathLength = path.length;
            }
        }
        this.#longestPathsMemo = longestPaths;
        return this.#longestPathsMemo;
    }
}

/**
 * 与えられた配列について、次のすべての条件を満たした有向グラフを作成します。
 *
 * 条件1. 配列の要素はすべてグラフの node である。例: [1,4,2] の場合は 1,4,2 の3つが node。
 *
 * 条件2. edge の方向は、必ず配列内の位置で左から右の向き。例: [1,4,2] の場合は 1→4,4→2,1→2 のみが edge になりうる。4→1 や 1→1 などは決して edge にならない。
 *
 * 条件3. 2つの edge があり、それを a, b とする。前者の edge の両端の node を x_a, y_a、後者のそれを x_b, y_b とする。このとき、a = b ⇔ x_a = x_b かつ y_a = y_b が成り立つ。つまり、2つの node を結ぶ edge は最大でも1つまでしか存在しない。
 *
 * 条件4. edge は、(edge の始点) < (edge の終点) という順序関係を満たす。なお、(edge の始点) = (edge の終点) という順序関係を満たすことは許容されていない。 例: [1,4,2] の場合は、条件3もあわせて考慮すると、1→4,1→2 のみが edge になりうる。4→2 は決して edge にならない。
 *
 * 条件5. edge は可能な限り多くする。例: [1,4,2,3] の場合は、条件1～4 もあわせて考慮すると、node は 1,4,2,3 で、edge は 1→4, 1→2, 1→3, 2→3 である。
 *
 * なお、次の条件は理論的には必須ではありませんが、この関数を必要とする関数での処理の高速化のために設けています。
 *
 * 条件6. 2つの相異なる node 間を結ぶ path が複数ある場合、最も edge の数が多い path を構成する edge のみを残し、他の edge はすべて削除する。これは条件5より優先される。例: [1,4,2,3] の場合は、条件1～4 のみを考慮すると edge は 1→4, 1→2, 1→3, 2→3 であるが、このうち1→3は1→2→3よりedgeの数が少ないため取り除く。「ショートカットできる経路はすべて削除する」と考えてもよい。
 */
const createGraph = <T>(source: readonly T[], comparer: (x: T, y: T) => '<' | '>') => {
    const memoized: (NodeAndEdges<T> | null)[] = source.map(() => null);

    function getOrCreateNode(sourceIndex: number): NodeAndEdges<T> {
        const memoizedElement = memoized[sourceIndex];
        if (memoizedElement != null) {
            return memoizedElement;
        }
        const startingNode = source[sourceIndex]!;
        const edgeTargetNodes: NodeAndEdges<T>[] = [];
        for (let i = sourceIndex + 1; i < source.length; i++) {
            const edgeTargetNode = getOrCreateNode(i);

            const lastEdgeTargetNode = edgeTargetNodes[edgeTargetNodes.length - 1];

            // 上の条件6を満たすような edge の追加はせず continue する
            if (
                lastEdgeTargetNode != null &&
                comparer(lastEdgeTargetNode.node, edgeTargetNode.node) === '<'
            ) {
                continue;
            }

            if (comparer(startingNode, edgeTargetNode.node) === '<') {
                edgeTargetNodes.push(edgeTargetNode);
            }
        }

        const result = new NodeAndEdges(startingNode, edgeTargetNodes);
        memoized[sourceIndex] = result;
        return result;
    }

    source.forEach((_, index) => getOrCreateNode(index));

    return memoized.map(elem => {
        if (elem == null) {
            throw new Error('This should not happen');
        }

        return elem;
    });
};

const getBetterFixedPoints = <T>({
    x,
    y,
    getIndex,
}: {
    x: readonly T[];
    y: readonly T[];
    getIndex: (x: T) => number;
}): 'xIsBetter' | 'yIsBetter' | 'same' => {
    if (x.length < y.length) {
        return 'yIsBetter';
    }
    if (x.length > y.length) {
        return 'xIsBetter';
    }

    const getGaps = (path: readonly T[]) =>
        [...pairwiseIterable(path)]
            .flatMap(pair => {
                if (pair.prev == null) {
                    return [];
                }
                return [getIndex(pair.current) - getIndex(pair.prev)];
            })
            .sort((i, j) => i - j);

    const gapsOfPrev = getGaps(x);
    const gapsOfNext = getGaps(y);

    for (const group of groupJoinArray(gapsOfPrev, gapsOfNext)) {
        if (group.type !== both) {
            throw new Error(`group.type should be "${both}", but actually "${group.type}".`);
        }

        if (group.left === group.right) {
            continue;
        }
        return group.left < group.right ? 'yIsBetter' : 'xIsBetter';
    }

    return 'same';
};

/** 配列が `prev` の状態から `next` の状態に変更されたとみなしたときに、動かすべきでない要素の一覧を返します。undefined である要素は無視されます。 */
const getBestFixedPoints = <T, TKey>({
    prev,
    next,
    getKey,
    comparer,
}: {
    prev: readonly T[];
    next: readonly T[];
    /** 要素の等価比較に用いられるキーを生成するための関数。 */
    getKey: (x: T) => TKey;
    comparer: (x: { value: T; index: number }, y: { value: T; index: number }) => '<' | '>';
}) => {
    const nextMap = new Map(next.map((value, index) => [getKey(value), { value, index }]));

    const graph = createGraph(
        prev.filter(value => nextMap.has(getKey(value))).map((value, index) => ({ value, index })),
        (x, y) => {
            const nextX = nextMap.get(getKey(x.value));
            const nextY = nextMap.get(getKey(y.value));

            // nextX = nextY = null のときでも '>' を返せば edge は生成されないので問題ない
            if (nextY === undefined) {
                return '>';
            }
            if (nextX === undefined) {
                return '<';
            }

            return comparer(nextX, nextY);
        },
    );

    let longestPath: readonly { index: number; value: T }[] = [];
    for (const g of graph) {
        for (const { path } of g.longestPaths()) {
            const compareResult = getBetterFixedPoints({
                x: longestPath,
                y: path,
                getIndex: x => x.index,
            });
            switch (compareResult) {
                case 'xIsBetter':
                    break;
                case 'yIsBetter':
                    longestPath = path;
                    break;
                case 'same':
                    // lonestPath にセットしてもしなくてもどちらでもいいが、現在はとりあえずインデックスが若いものを優先している
                    break;
            }
        }
    }

    return longestPath.map(({ value }) => value);
};

/**
 *
 * 配列を最初の要素から順番に見ていって、`predicate` が満たされなくなるまで配列から要素を取り除きます。
 *
 * @returns 取り除かれた要素。
 *
 */
const removeUntil = <T>(source: T[], predicate: (elem: T) => boolean) => {
    const result: T[] = [];
    while (source.length !== 0) {
        const first = source[0]!;
        if (!predicate(first)) {
            return result;
        }
        result.push(first);
        source.splice(0, 1);
    }
    return result;
};

export const arrayDiff = <T, TKey>({
    prev,
    next,
    getKey,
}: {
    prev: readonly T[];
    next: readonly T[];
    /** 要素の等価比較に用いられるキーを生成するための関数。 */
    getKey: (x: T) => TKey;
}) => {
    const clonedPrev = [...prev];
    const clonedNext = [...next];

    const fixedPoints = getBestFixedPoints({
        prev: clonedPrev,
        next: clonedNext,
        getKey,
        comparer: (x, y) => (x.index < y.index ? '<' : '>'),
    });

    const builder = new OperationBuilder<ReadonlyNonEmptyArray<T>, ReadonlyNonEmptyArray<T>>({
        getInsertLength: insert => new PositiveInt(insert.length),
        getDeleteLength: del => new PositiveInt(del.length),
        concatInsert: (x, y) => [...x, ...y],
        concatDelete: (x, y) => [...x, ...y],
    });

    for (const fixedPoint of fixedPoints) {
        const deleted = removeUntil(clonedPrev, x => getKey(x) !== getKey(fixedPoint));
        if (isReadonlyNonEmptyArray(deleted)) {
            builder.delete(deleted);
        }
        clonedPrev.splice(0, 1);

        const inserted = removeUntil(clonedNext, x => getKey(x) !== getKey(fixedPoint));
        if (isReadonlyNonEmptyArray(inserted)) {
            builder.insert(inserted);
        }
        clonedNext.splice(0, 1);

        builder.retain(PositiveInt.one);
    }

    if (isReadonlyNonEmptyArray(clonedPrev)) {
        builder.delete(clonedPrev);
    }
    if (isReadonlyNonEmptyArray(clonedNext)) {
        builder.insert(clonedNext);
    }

    return {
        value: builder.build(),
        iterate: () => builder.toIterable(),
        toUnits: () => builder.toUnits(),
    };
};
