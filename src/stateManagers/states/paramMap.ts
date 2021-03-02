// numberParameterなどのようにremoveが存在しないoperationに用いることを当初は想定していたが、サーバーからの応答を受け取ったときにdiffをとる必要があり、その際にremoveが出る。もしNonRemoveOperationElementを採用していると、NonRemoveOperationElementとOperationElementの2パターン採用しなければならないため、代わりにOperationElementのみを採用している。そのため、このコードは現在使われていない。

import { DualKeyMap } from '../../@shared/DualKeyMap';
import { groupJoin } from '../../@shared/Map';
import { createStateMap, ReadonlyStateMap, StateMap } from '../../@shared/StateMap';
import { both, left, right } from '../../@shared/Types';
import { Apply, Diff, Transform } from '../StateManager';
import * as $Map from './map';

export const apply = <TKey, TState, TOperation>({
    state,
    operation,
    inner,
    create,
}: {
    state: ReadonlyMap<TKey, TState>;
    operation: ReadonlyMap<TKey, TOperation>;
    inner: Apply<TState, TOperation>;
    create: (operation: TOperation) => TState;
}): Map<TKey, TState> => {
    const result = new Map<TKey, TState>(state);
    for (const [key, group] of groupJoin(state, operation)) {
        switch (group.type) {
            case left:
                result.set(key, group.left);
                continue;
            case right:
                result.set(key, create(group.right));
                continue;
            case both:
                result.set(key, inner({ state: group.left, operation: group.right }));
                continue;
        }
    }
    return result;
};

export const compose = <TKey, TOperation>({
    first,
    second,
    innerCompose,
}: {
    first: ReadonlyMap<TKey, TOperation>;
    second: ReadonlyMap<TKey, TOperation>;
    innerCompose: (params: { first: TOperation; second: TOperation }) => TOperation;
}): Map<TKey, TOperation> => {
    const result = new Map<TKey, TOperation>();
    for (const [key, group] of groupJoin(first, second)) {
        switch (group.type) {
            case left:
                result.set(key, group.left);
                continue;
            case right:
                result.set(key, group.right);
                continue;
            case both:
                result.set(key, innerCompose({ first: group.left, second: group.right }));
                continue;
        }
    }
    return result;
};

export const transform = <TKey, TFirstOperation, TSecondOperation>({
    first,
    second,
    inner,
}: {
    first: ReadonlyMap<TKey, TFirstOperation>;
    second: ReadonlyMap<TKey, TSecondOperation>;
    inner: Transform<TFirstOperation, TSecondOperation>;
}): { firstPrime: Map<TKey, TFirstOperation>; secondPrime: Map<TKey, TSecondOperation> } => {
    const firstPrime = new Map<TKey, TFirstOperation>();
    const secondPrime = new Map<TKey, TSecondOperation>();

    groupJoin(first, second).forEach((group, key) => {
        switch (group.type) {
            case left: {
                firstPrime.set(key, group.left);
                return;
            }
            case right: {
                secondPrime.set(key, group.right);
                return;
            }
            case both: {
                const xform = inner({ first: group.left, second: group.right });
                if (xform.firstPrime !== undefined) {
                    firstPrime.set(key, xform.firstPrime);
                }
                if (xform.secondPrime !== undefined) {
                    secondPrime.set(key, xform.secondPrime);
                }
                return;
            }
        }
    });
    return { firstPrime, secondPrime };
};

// removeされた要素が存在してはならない。
export const diff = <TKey, TState, TOperation>({
    prev,
    next,
    inner,
}: {
    prev: ReadonlyMap<TKey, TState>;
    next: ReadonlyMap<TKey, TState>;
    inner: (params: { prev: TState; next: TState } | { prev: TState; next: undefined } | { prev: undefined; next: TState }) => TOperation | undefined;
}): Map<TKey, TOperation> => {
    const result = new Map<TKey, TOperation>();

    groupJoin(prev, next).forEach((group, key) => {
        switch (group.type) {
            case left: {
                const value = inner({ prev: group.left, next: undefined });
                if (value !== undefined) {
                    result.set(key, value);
                }
                return;
            }
            case right: {
                const value = inner({ prev: undefined, next: group.right });
                if (value !== undefined) {
                    result.set(key, value);
                }
                return;
            }
            case both: {
                const value = inner({ prev: group.left, next: group.right });
                if (value !== undefined) {
                    result.set(key, value);
                }
                return;
            }
        }
    });

    return result;
};

export const ofGraphQLOperation = <TKey, TGraphQLUpdate, TOperation>({
    source,
    toKey,
    getOperation,
}: {
    source: {
        update: TGraphQLUpdate[];
    };
    toKey: (source: TGraphQLUpdate) => TKey;
    getOperation: (source: TGraphQLUpdate) => TOperation;
}): Map<TKey, TOperation> => {
    const result = new Map<TKey, TOperation>();

    source.update.forEach(update => {
        const key = toKey(update);
        if (result.has(key)) {
            throw `A duplicate key, ${key} was found at TGraphQLUpdate[]. Probably there is a bug at the server app.`;
        }
        result.set(key, getOperation(update));
    });
    return result;
};