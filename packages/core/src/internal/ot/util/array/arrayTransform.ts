import { DualKeyMap, ReadonlyNonEmptyArray } from '@flocon-trpg/utils';
import {
    Operation,
    OperationBuilder,
    PositiveInt,
    apply as applyCore,
    delete$,
    transform as transformCore,
} from '@kizahasi/ot-core';
import { Result } from '@kizahasi/result';
import { arrayDiff } from './arrayDiff';

type ArrayOperation<T> = Operation<ReadonlyNonEmptyArray<T>, ReadonlyNonEmptyArray<T>>;

const apply = <T>(state: readonly T[], operation: ArrayOperation<T>) => {
    const builder = new OperationBuilder<ReadonlyNonEmptyArray<T>, ReadonlyNonEmptyArray<T>>(
        {
            getInsertLength: insert => new PositiveInt(insert.length),
            getDeleteLength: del => new PositiveInt(del.length),
            concatInsert: (first, second) => [...first, ...second] as ReadonlyNonEmptyArray<T>,
            concatDelete: (first, second) => [...first, ...second] as ReadonlyNonEmptyArray<T>,
        },
        operation,
    );
    const applied = applyCore({
        state,
        action: [...builder.toIterable()],
        getStateLength: state => state.length,
        getInsertLength: insert => insert.length,
        getDeleteLength: del => new PositiveInt(del.length),
        insert: ({ state, start, replacement }) => {
            const result = [...state.slice(0, start), ...replacement, ...state.slice(start)];
            return { newState: result };
        },
        replace: ({ state, start, replacement, deleteCount }) => {
            const deleted = state.slice(start, deleteCount.value) as ReadonlyNonEmptyArray<T>;
            const result = [
                ...state.slice(0, start),
                ...(replacement.isNone ? [] : replacement.value),
                ...state.slice(start + deleteCount.value),
            ];
            return { newState: result, deleted: deleted };
        },
    });
    if (applied.isError) {
        return applied;
    }
    return Result.ok(applied.value.newState);
};

export const transform = <T, TKey>(
    state: readonly T[],
    stateAppliedFirst: readonly T[],
    stateAppliedSecond: readonly T[],
    getKey: (element: T) => TKey,
) => {
    const tagKey = '$tag';
    type Tagged<T> = { [tagKey]: 0 | 1 | 2; value: T };

    const $state = state.map(value => ({ value, [tagKey]: 0 }) as const);
    const $stateAppliedFirst = stateAppliedFirst.map(value => ({ value, [tagKey]: 1 }) as const);
    const $stateAppliedSecond = stateAppliedSecond.map(value => ({ value, [tagKey]: 2 }) as const);

    const $getKey = (x: Tagged<T>) => getKey(x.value);
    const first = arrayDiff<Tagged<T>, TKey>({
        prev: $state,
        next: $stateAppliedFirst,
        getKey: $getKey,
    });
    const firstUnits = [...first.toUnits()];
    const second = arrayDiff<Tagged<T>, TKey>({
        prev: $state,
        next: $stateAppliedSecond,
        getKey: $getKey,
    });
    const secondUnits = [...second.toUnits()];

    const transformed = transformCore({
        first: firstUnits,
        second: secondUnits,
        splitDelete: (target, index) => {
            const left: Tagged<T>[] = target.slice(0, index.value);
            const right: Tagged<T>[] = target.slice(index.value);
            return [
                left as ReadonlyNonEmptyArray<Tagged<T>>,
                right as ReadonlyNonEmptyArray<Tagged<T>>,
            ];
        },
        factory: {
            getInsertLength: insert => new PositiveInt(insert.length),
            getDeleteLength: del => new PositiveInt(del.length),
            concatInsert: (first, second) =>
                [...first, ...second] as ReadonlyNonEmptyArray<Tagged<T>>,
            concatDelete: (first, second) =>
                [...first, ...second] as ReadonlyNonEmptyArray<Tagged<T>>,
        },
    });

    if (transformed.isError) {
        return transformed;
    }

    // stateAppliedFirst に secondPrime を apply しているが、代わりに stateAppliedSecond に firstPrime を apply したものでも構わない。
    const nonDistictedLastState = apply($stateAppliedFirst, transformed.value.secondPrime);
    if (nonDistictedLastState.isError) {
        return nonDistictedLastState;
    }

    /*
    @kizahasi/ot-core の transform の仕様では要素の同一性は考慮されないため、もし nonDistictedLastState.value をそのまま返してしまうと次のような問題が生じる。
    - 例えば first が [insert 'x', retain 1, delete 'x', retain 1] で、second が [retain 1, delete 'x', retain 1, insert 'x'] のとき(つまり、同一の要素が同時に移動されたとき)、nonDistictedLastState.value に 'x' が2つ存在することになってしまう。そのため、二重に存在する要素は1つのみにしなければならない。
    - first が [delete 'x', retain 1] で、second が [delete 'x', retain 1, insert 'x'] のように、片方が移動で片方が削除の場合は最終的に削除されてほしいが、insert 'x' が残るため nonDistictedLastState.value に 'x' が含まれてしまう。
    そのため、これより下で、nonDistictedLastState.value からそのような要素を取り除く処理を行っている。
    */

    const deletedElemets = new DualKeyMap<TKey, 1 | 2, null>();
    for (const operation of firstUnits) {
        if (operation.type === delete$) {
            for (const d of operation.delete) {
                deletedElemets.set({ first: getKey(d.value), second: 1 }, null);
            }
        }
    }
    for (const operation of secondUnits) {
        if (operation.type === delete$) {
            for (const d of operation.delete) {
                deletedElemets.set({ first: getKey(d.value), second: 2 }, null);
            }
        }
    }

    const groupedLastState = new DualKeyMap<TKey, 1 | 2, null>();
    for (const { value, $tag } of nonDistictedLastState.value) {
        if ($tag === 0) {
            // 0 は使わないのでスキップ。
            continue;
        }
        groupedLastState.set({ first: getKey(value), second: $tag }, null);
    }

    const result = nonDistictedLastState.value.flatMap(({ value, $tag }) => {
        const key = getKey(value);
        const deletedSimultaneously = deletedElemets.getByFirst(key).size >= 2;
        if (!deletedSimultaneously) {
            return [value];
        }
        const tags = groupedLastState.getByFirst(key);
        switch (tags.size) {
            case 0:
                // 両方のOperationで削除となったケース。
                // この場合は削除とする。
                return [];
            case 1:
                // 片方のOperationでは移動だが、もう片方のOperationでは削除されたケース。
                // この場合は削除を優先する。
                return [];
            case 2:
                // 両方のOperationで移動となったケース。
                // この場合は常にfirstを優先することにしている(問題があれば変えるかも)。
                // ここで $tag === 0 になることはない(もし $tag === 0 であればこの要素を削除するOperationはないことになるが、その場合は deletedSimultaneously === false になるため)。
                return $tag === 1 ? [value] : [];
            default:
                // ここに来ることはない。
                return [];
        }
    });
    return Result.ok(result);
};
