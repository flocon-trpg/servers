import { Collection } from '@mikro-orm/core';
import { groupJoin } from '../@shared/Map';
import { Result, ResultModule } from '../@shared/Result';
import { both, left, right } from '../@shared/Types';
import { ProtectedTransformParameters, RestoreResult } from './Types';

export const createDownOperationFromMikroORM = async <TKey, TUpdate, TGlobalDownOperation>({
    toKey,
    update,
    getOperation,
}: {
    toKey: (source: TUpdate) => Result<TKey>;
    update: Collection<TUpdate>;
    getOperation: (source: TUpdate) => Promise<Result<TGlobalDownOperation>>;
}): Promise<Result<Map<TKey, TGlobalDownOperation>>> => {
    const result = new Map<TKey, TGlobalDownOperation>();
    for (const u of await update.loadItems()) {
        const key = toKey(u);
        if (key.isError) {
            return key;
        }
        const converted = await getOperation(u);
        if (converted.isError) {
            return converted;
        }
        result.set(key.value, converted.value);
    }
    return ResultModule.ok(result);
};

export const createUpOperationFromGraphQL = <TKey, TUpOperation, TUpOperationElement>({
    update,
    getOperation,
    createKey,
}: {
    update: ReadonlyArray<TUpOperation>;
    getOperation: (source: TUpOperation) => TUpOperationElement;
    createKey: (operation: TUpOperation) => Result<TKey>;
}): Result<Map<TKey, TUpOperationElement>> => {
    const result = new Map<TKey, TUpOperationElement>();
    for (const operation of update) {
        const key = createKey(operation);
        if (key.isError) {
            return key;
        }
        result.set(key.value, getOperation(operation));
    }
    return ResultModule.ok(result);
};

export const toGraphQL = <TKey, TSourceOperation, TUpdateOperation>({
    source,
    toUpdateOperation,
}: {
    source: ReadonlyMap<TKey, TSourceOperation>;
    toUpdateOperation: (params: { operation: TSourceOperation; key: TKey }) => TUpdateOperation;
}): TUpdateOperation[] => {
    const updates: TUpdateOperation[] = [];
    source.forEach((serverOperation, key) => {
        const newValueResult = toUpdateOperation({
            operation: serverOperation,
            key,
        });
        updates.push(newValueResult);
    });

    return updates;
};

// isPrivateがあるとremoveが必要になるため、isPrivateを実装することは不可能。
export const toGraphQLWithState = <TKey, TSourceState, TSourceOperation, TUpdateOperation>({
    source,
    prevState,
    nextState,
    toUpdateOperation,
    defaultState,
}: {
    source: ReadonlyMap<TKey, TSourceOperation>;
    prevState: ReadonlyMap<TKey, TSourceState>;
    nextState: ReadonlyMap<TKey, TSourceState>;
    toUpdateOperation: (params: { operation: TSourceOperation; key: TKey; prevState: TSourceState; nextState: TSourceState }) => TUpdateOperation | null | undefined;
    defaultState: TSourceState;
}): TUpdateOperation[] => {
    const updates: TUpdateOperation[] = [];
    source.forEach((serverOperation, key) => {
        let prevStateElement = prevState.get(key);
        if (prevStateElement === undefined) {
            prevStateElement = defaultState;
        }
        let nextStateElement = nextState.get(key);
        if (nextStateElement === undefined) {
            nextStateElement = defaultState;
        }
        const clientOperation = toUpdateOperation({
            operation: serverOperation,
            key,
            prevState: prevStateElement,
            nextState: nextStateElement,
        });
        if (clientOperation == null) {
            return;
        }
        updates.push(clientOperation);
    });

    return updates;
};

export const restore = <TKey, TState, TDownOperation, TTwoWayOperation>({
    nextState,
    downOperation,
    innerRestore,
}: {
    nextState: ReadonlyMap<TKey, TState>;
    downOperation: ReadonlyMap<TKey, TDownOperation>;
    innerRestore: (params: { downOperation: TDownOperation; nextState: TState; key: TKey }) => Result<RestoreResult<TState, TTwoWayOperation> | undefined>;
}): Result<RestoreResult<Map<TKey, TState>, Map<TKey, TTwoWayOperation>>> => {
    const prevState = new Map(nextState);
    const twoWayOperation = new Map<TKey, TTwoWayOperation>();

    for (const [key, value] of downOperation) {
        const nextCharacterState = nextState.get(key);
        if (nextCharacterState === undefined) {
            return ResultModule.error(`tried to update "${key}", but nextState does not have such a key`);
        }
        const restored = innerRestore({ downOperation: value, nextState: nextCharacterState, key });
        if (restored.isError) {
            return restored;
        }
        if (restored.value === undefined) {
            continue;
        }
        prevState.set(key, restored.value.prevState);
        if (restored.value.twoWayOperation !== undefined) {
            twoWayOperation.set(key, restored.value.twoWayOperation);
        }
        break;
    }

    return ResultModule.ok({ prevState, twoWayOperation });
};

export const applyBack = <TKey, TState, TDownOperation>({ nextState, downOperation, innerApplyBack }: {
    nextState: ReadonlyMap<TKey, TState>;
    downOperation: ReadonlyMap<TKey, TDownOperation>;
    innerApplyBack: (params: { downOperation: TDownOperation; nextState: TState; key: TKey }) => Result<TState>;
}): Result<Map<TKey, TState>> => {
    const prevState = new Map(nextState);

    for (const [key, value] of downOperation) {
        const nextCharacterState = nextState.get(key);
        if (nextCharacterState === undefined) {
            return ResultModule.error(`tried to update "${key}", but nextState does not have such a key`);
        }
        const oldValue = innerApplyBack({ downOperation: value, nextState: nextCharacterState, key });
        if (oldValue.isError) {
            return oldValue;
        }
        prevState.set(key, oldValue.value);
        break;
    }

    return ResultModule.ok(prevState);
};

export const composeDownOperation = <TKey, TDownOperation>({
    first,
    second,
    innerCompose
}: {
    first: ReadonlyMap<TKey, TDownOperation>;
    second: ReadonlyMap<TKey, TDownOperation>;
    innerCompose: (params: { key: TKey; first: TDownOperation; second: TDownOperation }) => Result<TDownOperation | undefined>;
}): Result<Map<TKey, TDownOperation>> => {
    const result = new Map<TKey, TDownOperation>();

    for (const [key, groupJoined] of groupJoin(first, second)) {
        switch (groupJoined.type) {
            case left:
                result.set(key, groupJoined.left);
                continue;
            case right:
                result.set(key, groupJoined.right);
                continue;
            case both: {
                const update = innerCompose({ first: groupJoined.left, second: groupJoined.right, key });
                if (update.isError) {
                    return update;
                }
                if (update.value !== undefined) {
                    result.set(key, update.value);
                }
                continue;
            }
                break;
        }
    }
    return ResultModule.ok(result);
};

// Make sure these:
// - apply(prevState, first) = nextState
export const transform = <TKey, TServerState, TFirstOperation, TSecondOperation>({
    first,
    second,
    prevState,
    nextState,
    innerTransform,
}: {
    prevState: ReadonlyMap<TKey, TServerState>;
    nextState: ReadonlyMap<TKey, TServerState>;
    first?: ReadonlyMap<TKey, TFirstOperation>;
    second: ReadonlyMap<TKey, TSecondOperation>;
    innerTransform: (params: ProtectedTransformParameters<TServerState | undefined, TFirstOperation, TSecondOperation> & { key: TKey }) => Result<TFirstOperation | undefined>;
}): Result<Map<TKey, TFirstOperation>> => {
    const result = new Map<TKey, TFirstOperation>();

    for (const [key, operation] of second) {
        const innerPrevState = prevState.get(key);
        const innerNextState = nextState.get(key);
        const innerFirst = first?.get(key);

        const transformed = innerTransform({
            first: innerFirst,
            second: operation,
            prevState: innerPrevState,
            nextState: innerNextState,
            key,
        });
        if (transformed.isError) {
            return transformed;
        }
        const transformedUpdate = transformed.value;
        if (transformedUpdate !== undefined) {
            result.set(key, transformedUpdate);
        }
    }
    return ResultModule.ok(result);
};

export const apply = async <TKey, TEntityState, TOperation>(params: {
    toKey: (state: TEntityState) => TKey;
    state: Collection<TEntityState>;
    operation: ReadonlyMap<TKey, TOperation>;
    update: (params: { state: TEntityState; operation: TOperation; key: TKey }) => Promise<void>;
    create: (params: { operation: TOperation; key: TKey }) => Promise<TEntityState | undefined>;
}): Promise<void> => {
    const stateAsMap = new Map<TKey, TEntityState>();
    (await params.state.loadItems()).forEach(s => {
        stateAsMap.set(params.toKey(s), s);
    });
    for (const [key, value] of groupJoin(stateAsMap, params.operation)) {
        switch (value.type) {
            case left:
                continue;
            case right: {
                const created = await params.create({ key, operation: value.right });
                if (created !== undefined) {
                    params.state.add(created);
                }
                continue;
            }
            case both: {
                await params.update({ key, state: value.left, operation: value.right });
                continue;
            }
        }
    }
};

export const diff = <TKey, TState, TOperation>({
    prev,
    next,
    innerDiff,
}: {
    prev: ReadonlyMap<TKey, TState>;
    next: ReadonlyMap<TKey, TState>;
    innerDiff: (params: { prev: TState | undefined; next: TState | undefined; key: TKey }) => TOperation | undefined;
}): Map<TKey, TOperation> => {
    const result = new Map<TKey, TOperation>();
    for (const [key, value] of groupJoin(prev, next)) {
        let prev: TState | undefined = undefined;
        let next: TState | undefined = undefined;

        switch (value.type) {
            case left:
                prev = value.left;
                break;
            case right: {
                next = value.right;
                break;
            }
            case both: {
                prev = value.left;
                next = value.right;
                break;
            }
        }
        const diffResult = innerDiff({ prev, next, key });
        if (diffResult === undefined) {
            continue;
        }
        result.set(key, diffResult);
        continue;
    }
    return result;
};