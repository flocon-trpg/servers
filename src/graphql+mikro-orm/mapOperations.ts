import { RestoreResult, ProtectedTransformParameters } from './Types';
import * as DualKeyMapOperations from './dualKeyMapOperations';
import { Collection } from '@mikro-orm/core';
import { groupJoin } from '../@shared/Map';
import { both, left, right } from '../@shared/Types';
import { Result, ResultModule } from '../@shared/Result';
import { DualKeyMap } from '../@shared/DualKeyMap';

// ほぼstateMapOperations.tsのラッパー。一部はコピペして調整。

export const replace = 'replace';
export const update = 'update';

type ReplaceDown<TState> = {
    type: typeof replace;
    operation: { oldValue: TState | undefined };
}

type UpdateDown<TDownOperation> = {
    type: typeof update;
    operation: TDownOperation;
}

export type MapDownOperationElementUnion<TState, TDownOperation> = ReplaceDown<TState> | UpdateDown<TDownOperation>;

type ReplaceUp<TState> = {
    type: typeof replace;
    operation: { newValue: TState | undefined };
}

type UpdateUp<TUpOperation> = {
    type: typeof update;
    operation: TUpOperation;
}

export type MapUpOperationElementUnion<TState, TUpOperation> = ReplaceUp<TState> | UpdateUp<TUpOperation>;

type ReplaceFull<TState> = {
    type: typeof replace;
    operation: { oldValue: TState | undefined; newValue: TState | undefined };
}

type UpdateFull<TDownOperation> = {
    type: typeof update;
    operation: TDownOperation;
}

export type MapTwoWayOperationElementUnion<TState, TDownOperation> = ReplaceFull<TState> | UpdateFull<TDownOperation>;

export type MapDownOperation<TKey, TState, TDownOperation> = Map<TKey, MapDownOperationElementUnion<TState, TDownOperation>>;

export type ReadonlyMapDownOperation<TKey, TState, TDownOperation> = ReadonlyMap<TKey, MapDownOperationElementUnion<TState, TDownOperation>>;

export type MapUpOperation<TKey, TState, TUpOperation> = Map<TKey, MapUpOperationElementUnion<TState, TUpOperation>>;

export type ReadonlyMapUpOperation<TKey, TState, TUpOperation> = ReadonlyMap<TKey, MapUpOperationElementUnion<TState, TUpOperation>>;

export type MapTwoWayOperation<TKey, TState, TTwoWayOperation> = Map<TKey, MapTwoWayOperationElementUnion<TState, TTwoWayOperation>>;

export type ReadonlyMapTwoWayOperation<TKey, TState, TTwoWayOperation> = ReadonlyMap<TKey, MapTwoWayOperationElementUnion<TState, TTwoWayOperation>>;

type RestoreParameters<TKey, TState, TDownOperation, TTwoWayOperation> = {
    nextState: ReadonlyMap<TKey, TState>;
    downOperation: ReadonlyMapDownOperation<TKey, TState, TDownOperation>;
    innerRestore: (params: { downOperation: TDownOperation; nextState: TState }) => Result<RestoreResult<TState, TTwoWayOperation | undefined>>;
    innerDiff: (params: { prevState: TState; nextState: TState }) => TTwoWayOperation | undefined;
}

type ApplyBackParameters<TKey, TState, TDownOperation> = {
    nextState: ReadonlyMap<TKey, TState>;
    downOperation: ReadonlyMapDownOperation<TKey, TState, TDownOperation>;
    innerApplyBack: (params: { downOperation: TDownOperation; nextState: TState }) => Result<TState>;
}

type ComposeParameters<TKey, TState, TDownOperation> = {
    first: ReadonlyMapDownOperation<TKey, TState, TDownOperation>;
    second: ReadonlyMapDownOperation<TKey, TState, TDownOperation>;
    innerApplyBack: (params: { downOperation: TDownOperation; nextState: TState }) => Result<TState>;
    innerCompose: (params: { first: TDownOperation; second: TDownOperation }) => Result<TDownOperation | undefined>;
}

type ProtectedValuePolicy<TKey, TServerState> = {
    cancelRemove?: (params: { key: TKey; nextState: TServerState }) => boolean;
    cancelCreate?: (params: { key: TKey }) => boolean;
}

// Make sure this:
// apply(prevState, first) = nextState
type TransformParameters<TKey, TServerState, TClientState, TFirstOperation, TSecondOperation> = {
    prevState: ReadonlyMap<TKey, TServerState>;
    nextState: ReadonlyMap<TKey, TServerState>;
    first?: ReadonlyMapTwoWayOperation<TKey, TServerState, TFirstOperation>;
    second: ReadonlyMapUpOperation<TKey, TClientState, TSecondOperation>;
    toServerState: (state: TClientState, key: TKey) => TServerState;
    innerTransform: (params: ProtectedTransformParameters<TServerState, TFirstOperation, TSecondOperation> & { key: TKey }) => Result<TFirstOperation | undefined>;
    protectedValuePolicy: ProtectedValuePolicy<TKey, TServerState>;
}

const dummyFirstKey = '';

const toDualKeyMap = <TKey, TValue>(source: ReadonlyMap<TKey, TValue>): DualKeyMap<string, TKey, TValue> => {
    const resultMap = new Map<string, ReadonlyMap<TKey, TValue>>();
    resultMap.set(dummyFirstKey, source);
    return new DualKeyMap(resultMap);
};

const get = <TKey, TValue>(source: DualKeyMap<string, TKey, TValue>): Map<TKey, TValue> => {
    if (source.isEmpty) {
        return new Map();
    }
    const result = source.getByFirst(dummyFirstKey);
    if (result == null) {
        // 通常、ここには来ない
        throw 'dummyCreatedBy key is missing';
    }
    return result;
};

export const createDownOperationFromMikroORM = async <TKey, TAdd, TRemove, TUpdate, TGlobalState, TGlobalDownOperation>({
    toKey,
    add,
    remove,
    update,
    getState,
    getOperation,
}: {
    toKey: (source: TAdd | TRemove | TUpdate) => Result<TKey>;
    add: Collection<TAdd>;
    remove: Collection<TRemove>;
    update: Collection<TUpdate>;
    getState: (source: TRemove) => Promise<Result<TGlobalState>>;
    getOperation: (source: TUpdate) => Promise<Result<TGlobalDownOperation | undefined>>;
}): Promise<Result<MapDownOperation<TKey, TGlobalState, TGlobalDownOperation>>> => {
    const result = new Map<TKey, MapDownOperationElementUnion<TGlobalState, TGlobalDownOperation>>();
    for (const a of await add.loadItems()) {
        const key = toKey(a);
        if (key.isError) {
            return key;
        }
        result.set(key.value, { type: 'replace', operation: { oldValue: undefined } });
    }
    for (const r of await remove.loadItems()) {
        const key = toKey(r);
        if (key.isError) {
            return key;
        }
        if (result.has(key.value)) {
            return ResultModule.error(`${key.value} exists on add`);
        }
        const converted = await getState(r);
        if (converted.isError) {
            return converted;
        }
        result.set(key.value, { type: 'replace', operation: { oldValue: converted.value } });
    }
    for (const u of await update.loadItems()) {
        const key = toKey(u);
        if (key.isError) {
            return key;
        }
        if (result.has(key.value)) {
            return ResultModule.error(`${key.value} exists on add or remove`);
        }
        const converted = await getOperation(u);
        if (converted.isError) {
            return converted;
        }
        if (converted.value === undefined) {
            continue;
        }
        result.set(key.value, { type: 'update', operation: converted.value });
    }
    return ResultModule.ok(result);
};

export const createUpOperationFromGraphQL = <TKey, TState, TStateElement, TUpOperation, TUpOperationElement>({
    replace,
    update,
    getState,
    getOperation,
    createKey,
}: {
    replace: ReadonlyArray<TState>;
    update: ReadonlyArray<TUpOperation>;
    getState: (source: TState) => TStateElement | undefined;
    getOperation: (source: TUpOperation) => Result<TUpOperationElement>;
    createKey: (operation: TState | TUpOperation) => Result<TKey>;
}): Result<MapUpOperation<TKey, TStateElement, TUpOperationElement>> => {
    const result = new Map<TKey, MapUpOperationElementUnion<TStateElement, TUpOperationElement>>();
    for (const operation of replace) {
        const key = createKey(operation);
        if (key.isError) {
            return key;
        }
        if (result.has(key.value)) {
            return ResultModule.error(`${key.value} is duplicate`);
        }
        result.set(key.value, { type: 'replace', operation: { newValue: getState(operation) } });
    }
    for (const operation of update) {
        const key = createKey(operation);
        if (key.isError) {
            return key;
        }
        if (result.has(key.value)) {
            return ResultModule.error(`${key.value} is duplicate`);
        }
        const getOperationResult = getOperation(operation);
        if (getOperationResult.isError) {
            return getOperationResult;
        }
        result.set(key.value, { type: 'update', operation: getOperationResult.value });
    }
    return ResultModule.ok(result);
};

type GraphQLOperation<TReplaceOperation, TUpdateOperation> = {
    replace: TReplaceOperation[];
    update: TUpdateOperation[];
}

export const toGraphQL = <TKey, TSourceState, TReplaceOperation, TSourceOperation, TUpdateOperation>({
    source,
    toReplaceOperation,
    toUpdateOperation,
}: {
    source: ReadonlyMapTwoWayOperation<TKey, TSourceState, TSourceOperation>;
    toReplaceOperation: (params: { prevState?: TSourceState; nextState?: TSourceState; key: TKey }) => TReplaceOperation | null | undefined;
    toUpdateOperation: (params: { operation: TSourceOperation; key: TKey }) => TUpdateOperation;
}): GraphQLOperation<TReplaceOperation, TUpdateOperation> => {
    return DualKeyMapOperations.toGraphQL({
        source: toDualKeyMap(source),
        toReplaceOperation: ({ prevState, nextState, key: dualKey }) => toReplaceOperation({ prevState, nextState, key: dualKey.second }),
        toUpdateOperation: ({ operation, key: dualKey }) => toUpdateOperation({ operation, key: dualKey.second }),
    });
};

export const toGraphQLWithState = <TKey, TSourceState, TReplaceOperation, TSourceOperation, TUpdateOperation>({
    source,
    isPrivate,
    prevState,
    nextState,
    toReplaceOperation,
    toUpdateOperation,
}: {
    source: ReadonlyMapTwoWayOperation<TKey, TSourceState, TSourceOperation>;
    isPrivate: (state: TSourceState, key: TKey) => boolean;
    prevState: ReadonlyMap<TKey, TSourceState>;
    nextState: ReadonlyMap<TKey, TSourceState>;
    toReplaceOperation: (params: { prevState?: TSourceState; nextState?: TSourceState; key: TKey }) => TReplaceOperation | null | undefined;
    toUpdateOperation: (params: { operation: TSourceOperation; key: TKey; prevState: TSourceState; nextState: TSourceState }) => TUpdateOperation | null | undefined;
}): GraphQLOperation<TReplaceOperation, TUpdateOperation> => {
    return DualKeyMapOperations.toGraphQLWithState({
        source: toDualKeyMap(source),
        isPrivate: (state, key) => isPrivate(state, key.second),
        prevState: toDualKeyMap(prevState),
        nextState: toDualKeyMap(nextState),
        toReplaceOperation: ({ prevState, nextState, key: dualKey }) => toReplaceOperation({ prevState, nextState, key: dualKey.second }),
        toUpdateOperation: ({ operation, key: dualKey, prevState, nextState }) => toUpdateOperation({ operation, key: dualKey.second, prevState, nextState }),
    });
};

export const restore = <TKey, TState, TDownOperation, TTwoWayOperation>({ nextState, downOperation, innerRestore, innerDiff }: RestoreParameters<TKey, TState, TDownOperation, TTwoWayOperation>): Result<RestoreResult<Map<TKey, TState>, MapTwoWayOperation<TKey, TState, TTwoWayOperation>>> => {
    const stateMapResult = DualKeyMapOperations.restore({ nextState: toDualKeyMap(nextState), downOperation: toDualKeyMap(downOperation), innerRestore, innerDiff });
    if (stateMapResult.isError) {
        return stateMapResult;
    }
    return ResultModule.ok({
        prevState: get(stateMapResult.value.prevState),
        twoWayOperation: get(stateMapResult.value.twoWayOperation),
    });
};

export const applyBack = <TKey, TState, TDownOperation>({ nextState, downOperation, innerApplyBack }: ApplyBackParameters<TKey, TState, TDownOperation>): Result<Map<TKey, TState>> => {
    const stateMapResult = DualKeyMapOperations.applyBack({ nextState: toDualKeyMap(nextState), downOperation: toDualKeyMap(downOperation), innerApplyBack });
    if (stateMapResult.isError) {
        return stateMapResult;
    }
    return ResultModule.ok(get(stateMapResult.value));
};

export const composeDownOperation = <TKey, TState, TDownOperation>({ first, second, innerApplyBack, innerCompose }: ComposeParameters<TKey, TState, TDownOperation>): Result<MapDownOperation<TKey, TState, TDownOperation>> => {
    const stateMapResult = DualKeyMapOperations.composeDownOperationLoose({
        first: toDualKeyMap(first),
        second: toDualKeyMap(second),
        innerApplyBack,
        innerCompose,
    });
    if (stateMapResult.isError) {
        return stateMapResult;
    }
    return ResultModule.ok(get(stateMapResult.value));
};

export const transform = <TKey, TServerState, TClientState, TFirstOperation, TSecondOperation>({
    first,
    second,
    prevState,
    nextState,
    innerTransform,
    toServerState,
    protectedValuePolicy
}: TransformParameters<TKey, TServerState, TClientState, TFirstOperation, TSecondOperation>): Result<MapTwoWayOperation<TKey, TServerState, TFirstOperation>> => {
    const cancelRemove = protectedValuePolicy.cancelRemove;
    const cancelCreate = protectedValuePolicy.cancelCreate;
    const stateMapResult = DualKeyMapOperations.transform({
        first: first === undefined ? undefined : toDualKeyMap(first),
        second: toDualKeyMap(second),
        prevState: toDualKeyMap(prevState),
        nextState: toDualKeyMap(nextState),
        innerTransform: params => innerTransform({ ...params, key: params.key.second }),
        toServerState: (state, key) => toServerState(state, key.second),
        protectedValuePolicy: {
            cancelRemove: cancelRemove === undefined ? undefined : params => cancelRemove({ key: params.key.second, nextState: params.nextState }),
            cancelCreate: cancelCreate === undefined ? undefined : params => cancelCreate({ key: params.key.second }),
        },
    });
    if (stateMapResult.isError) {
        return stateMapResult;
    }
    return ResultModule.ok(get(stateMapResult.value));
};

export const apply = async <TKey, TEntityState, TReplaceOperationState, TOperation>(params: {
    toKey: (state: TEntityState) => TKey;
    state: Collection<TEntityState>;
    operation: ReadonlyMapUpOperation<TKey, TReplaceOperationState, TOperation>;
    update: (params: { state: TEntityState; operation: TOperation; key: TKey }) => Promise<void>;
    create: (params: { state: TReplaceOperationState; key: TKey }) => Promise<TEntityState | undefined>;
    delete: (params: { key: TKey }) => Promise<boolean>;
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
                if (value.right.type === update) {
                    throw 'state == null && operation.type === update';
                }
                if (value.right.operation.newValue === undefined) {
                    throw 'state == null && operation.newValue === undefined';
                }
                const created = await params.create({ key, state: value.right.operation.newValue });
                if (created !== undefined) {
                    params.state.add(created);
                }
                continue;
            }
            case both: {
                if (value.right.type === update) {
                    await params.update({ key, state: value.left, operation: value.right.operation });
                    continue;
                }
                if (value.right.operation.newValue !== undefined) {
                    throw 'state != null && operation.newValue !== undefined';
                }
                const deleted = await params.delete({ key });
                if (deleted) {
                    params.state.remove(value.left);
                }
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
    innerDiff: (params: { prev: TState; next: TState }) => TOperation | undefined;
}): MapTwoWayOperation<TKey, TState, TOperation> => {
    const result = new Map<TKey, MapTwoWayOperationElementUnion<TState, TOperation>>();
    for (const [key, value] of groupJoin(prev, next)) {
        switch (value.type) {
            case left:
                result.set(key, { type: replace, operation: { oldValue: value.left, newValue: undefined } });
                continue;
            case right: {
                result.set(key, { type: replace, operation: { oldValue: undefined, newValue: value.right } });
                continue;
            }
            case both: {
                const diffResult = innerDiff({ prev: value.left, next: value.right });
                if (diffResult === undefined) {
                    continue;
                }
                result.set(key, { type: update, operation: diffResult });
                continue;
            }
        }
    }
    return result;
};
