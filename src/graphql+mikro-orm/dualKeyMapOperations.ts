import { both, left, right } from '../@shared/Types';
import { Collection } from '@mikro-orm/core';
import { Result, ResultModule } from '../@shared/Result';
import { RestoreResult, ProtectedTransformParameters } from './Types';
import { CustomDualKeyMap, KeyFactory, ReadonlyCustomDualKeyMap } from '../@shared/CustomDualKeyMap';
import { DualKey, DualKeyMap, dualKeyToString, groupJoin, ReadonlyDualKeyMap, toJSONString } from '../@shared/DualKeyMap';
import { CompositeKey } from '../@shared/StateMap';

export const replace = 'replace';
export const update = 'update';

export type GraphQLStateMapOperation<TState, TUpOperation> = {
    replace: { id: string; createdBy: string; newValue: TState | undefined }[];

    update: { id: string; createdBy: string; operation: TUpOperation }[];
}

type ReplaceDown<TState> = {
    type: typeof replace;
    operation: { oldValue: TState | undefined };
}

type UpdateDown<TDownOperation> = {
    type: typeof update;
    operation: TDownOperation;
}

export type DualKeyMapDownOperationElementUnion<TState, TDownOperation> = ReplaceDown<TState> | UpdateDown<TDownOperation>;

type ReplaceUp<TState> = {
    type: typeof replace;
    operation: { newValue: TState | undefined };
}

type UpdateUp<TUpOperation> = {
    type: typeof update;
    operation: TUpOperation;
}

export type DualKeyMapUpOperationElementUnion<TState, TUpOperation> = ReplaceUp<TState> | UpdateUp<TUpOperation>;

type ReplaceTwoWay<TState> = {
    type: typeof replace;
    operation: { oldValue: TState | undefined; newValue: TState | undefined };
}

type UpdateTwoWay<TDownOperation> = {
    type: typeof update;
    operation: TDownOperation;
}

export type DualKeyMapTwoWayOperationElementUnion<TState, TDownOperation> = ReplaceTwoWay<TState> | UpdateTwoWay<TDownOperation>;

export type DualKeyMapDownOperation<TKey1, TKey2, TState, TDownOperation> = DualKeyMap<TKey1, TKey2, DualKeyMapDownOperationElementUnion<TState, TDownOperation>>;
export type StateMapDownOperation<TState, TDownOperation> = CustomDualKeyMap<CompositeKey, string, string, DualKeyMapDownOperationElementUnion<TState, TDownOperation>>;

export type ReadonlyDualKeyMapDownOperation<TKey1, TKey2, TState, TDownOperation> = ReadonlyDualKeyMap<TKey1, TKey2, DualKeyMapDownOperationElementUnion<TState, TDownOperation>>;
export type ReadonlyStateMapDownOperation<TState, TDownOperation> = ReadonlyCustomDualKeyMap<CompositeKey, string, string, DualKeyMapDownOperationElementUnion<TState, TDownOperation>>;

export type DualKeyMapUpOperation<TKey1, TKey2, TState, TUpOperation> = DualKeyMap<TKey1, TKey2, DualKeyMapUpOperationElementUnion<TState, TUpOperation>>;
export type StateMapUpOperation<TState, TUpOperation> = CustomDualKeyMap<CompositeKey, string, string, DualKeyMapUpOperationElementUnion<TState, TUpOperation>>;

export type ReadonlyDualKeyMapUpOperation<TKey1, TKey2, TState, TUpOperation> = ReadonlyDualKeyMap<TKey1, TKey2, DualKeyMapUpOperationElementUnion<TState, TUpOperation>>;
export type ReadonlyStateMapUpOperation<TState, TUpOperation> = ReadonlyCustomDualKeyMap<CompositeKey, string, string, DualKeyMapUpOperationElementUnion<TState, TUpOperation>>;

export type DualKeyMapTwoWayOperation<TKey1, TKey2, TState, TTwoWayOperation> = DualKeyMap<TKey1, TKey2, DualKeyMapTwoWayOperationElementUnion<TState, TTwoWayOperation>>;
export type StateMapTwoWayOperation<TState, TTwoWayOperation> = CustomDualKeyMap<CompositeKey, string, string, DualKeyMapTwoWayOperationElementUnion<TState, TTwoWayOperation>>;

export type ReadonlyDualKeyMapTwoWayOperation<TKey1, TKey2, TState, TTwoWayOperation> = ReadonlyDualKeyMap<TKey1, TKey2, DualKeyMapTwoWayOperationElementUnion<TState, TTwoWayOperation>>;
export type ReadonlyStateMapTwoWayOperation<TState, TTwoWayOperation> = ReadonlyCustomDualKeyMap<CompositeKey, string, string, DualKeyMapTwoWayOperationElementUnion<TState, TTwoWayOperation>>;

type RestoreParameters<TKey1, TKey2, TState, TDownOperation, TTwoWayOperation> = {
    nextState: ReadonlyDualKeyMap<TKey1, TKey2, TState>;
    downOperation: ReadonlyDualKeyMapDownOperation<TKey1, TKey2, TState, TDownOperation>;
    innerRestore: (params: { key: DualKey<TKey1, TKey2>; downOperation: TDownOperation; nextState: TState }) => Result<RestoreResult<TState, TTwoWayOperation | undefined>>;
    innerDiff: (params: { key: DualKey<TKey1, TKey2>; prevState: TState; nextState: TState }) => TTwoWayOperation | undefined;
}

type ApplyBackParameters<TKey1, TKey2, TState, TDownOperation> = {
    nextState: ReadonlyDualKeyMap<TKey1, TKey2, TState>;
    downOperation: ReadonlyDualKeyMapDownOperation<TKey1, TKey2, TState, TDownOperation>;
    innerApplyBack: (params: { key: DualKey<TKey1, TKey2>; downOperation: TDownOperation; nextState: TState }) => Result<TState>;
}

type ComposeParameters<TKey1, TKey2, TState, TDownOperation> = {
    first: ReadonlyDualKeyMapDownOperation<TKey1, TKey2, TState, TDownOperation>;
    second: ReadonlyDualKeyMapDownOperation<TKey1, TKey2, TState, TDownOperation>;
    innerApplyBack: (params: { key: DualKey<TKey1, TKey2>; downOperation: TDownOperation; nextState: TState }) => Result<TState>;
    innerCompose: (params: { key: DualKey<TKey1, TKey2>; first: TDownOperation; second: TDownOperation }) => Result<TDownOperation | undefined>;
}

export type ProtectedValuePolicy<TKey, TServerState> = {
    // trueを返すと、「TServerState全体がprivateであり編集不可能」とみなしてスキップする。ただし制限されるのはtransformのみであるため、読み取りなどは制限されない。
    // 「ユーザーがprivateだと思っていたらその後すぐ変更があってprivateになった」というケースがあるので、trueでもエラーは返さず処理が続行される。
    // 関数ではなくundefinedを渡した場合、常にfalseを返す関数が渡されたときと同等の処理が行われる。
    // cancelUpdateは実装していない。理由は、innerTransformのほうで対応できるため。
    cancelRemove?: (params: { key: TKey; nextState: TServerState }) => boolean;

    cancelCreate?: (params: { key: TKey }) => boolean;
}

// Make sure this:
// apply(prevState, first) = nextState
type TransformParameters<TKey1, TKey2, TServerState, TClientState, TFirstOperation, TSecondOperation> = {
    prevState: ReadonlyDualKeyMap<TKey1, TKey2, TServerState>;
    nextState: ReadonlyDualKeyMap<TKey1, TKey2, TServerState>;
    first?: ReadonlyDualKeyMapTwoWayOperation<TKey1, TKey2, TServerState, TFirstOperation>;
    second: ReadonlyDualKeyMapUpOperation<TKey1, TKey2, TClientState, TSecondOperation>;
    // CO: comment out
    // acceptsRemove?: (params: { prevState: TServerState, nextState: TServerState }) => boolean
    toServerState: (state: TClientState, key: DualKey<TKey1, TKey2>) => TServerState;
    innerTransform: (params: ProtectedTransformParameters<TServerState, TFirstOperation, TSecondOperation> & { key: DualKey<TKey1, TKey2> }) => Result<TFirstOperation | undefined>;
    protectedValuePolicy: ProtectedValuePolicy<DualKey<TKey1, TKey2>, TServerState>;
}

export type EntityKey = {
    createdBy: string;
    id: string;
}

export const createDownOperationFromMikroORM = async <TKey1, TKey2, TAdd, TRemove, TUpdate, TGlobalState, TGlobalDownOperation>({
    toDualKey,
    add,
    remove,
    update,
    getState,
    getOperation,
}: {
    toDualKey: (source: TAdd | TRemove | TUpdate) => Result<DualKey<TKey1, TKey2>>;
    add: Collection<TAdd>;
    remove: Collection<TRemove>;
    update: Collection<TUpdate>;
    getState: (source: TRemove) => Promise<Result<TGlobalState>>;
    getOperation: (source: TUpdate) => Promise<Result<TGlobalDownOperation | undefined>>;
}): Promise<Result<DualKeyMapDownOperation<TKey1, TKey2, TGlobalState, TGlobalDownOperation>>> => {
    const result = new DualKeyMap<TKey1, TKey2, DualKeyMapDownOperationElementUnion<TGlobalState, TGlobalDownOperation>>();
    for (const a of await add.loadItems()) {
        const key = toDualKey(a);
        if (key.isError) {
            return key;
        }
        result.set(key.value, { type: 'replace', operation: { oldValue: undefined } });
    }
    for (const r of await remove.loadItems()) {
        const key = toDualKey(r);
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
        const key = toDualKey(u);
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

export const createUpOperationFromGraphQL = <TKey1, TKey2, TState, TStateElement, TUpOperation, TUpOperationElement>({
    replace,
    update,
    getState,
    getOperation,
    createDualKey,
}: {
    replace: ReadonlyArray<TState>;
    update: ReadonlyArray<TUpOperation>;
    getState: (source: TState) => TStateElement | undefined;
    getOperation: (source: TUpOperation) => Result<TUpOperationElement>;
    createDualKey: (operation: TState | TUpOperation) => Result<DualKey<TKey1, TKey2>>;
}): Result<DualKeyMapUpOperation<TKey1, TKey2, TStateElement, TUpOperationElement>> => {
    const result = new DualKeyMap<TKey1, TKey2, DualKeyMapUpOperationElementUnion<TStateElement, TUpOperationElement>>();
    for (const operation of replace) {
        const key = createDualKey(operation);
        if (key.isError) {
            return key;
        }
        if (result.has(key.value)) {
            return ResultModule.error(`${key.value} is duplicate`);
        }
        result.set(key.value, { type: 'replace', operation: { newValue: getState(operation) } });
    }
    for (const operation of update) {
        const key = createDualKey(operation);
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

export const toGraphQL = <TKey1, TKey2, TSourceState, TReplaceOperation, TSourceOperation, TUpdateOperation>({
    source,
    toReplaceOperation,
    toUpdateOperation,
}: {
    source: ReadonlyDualKeyMapTwoWayOperation<TKey1, TKey2, TSourceState, TSourceOperation>;
    toReplaceOperation: (params: { prevState?: TSourceState; nextState?: TSourceState; key: DualKey<TKey1, TKey2> }) => TReplaceOperation | null | undefined;
    toUpdateOperation: (params: { operation: TSourceOperation; key: DualKey<TKey1, TKey2> }) => TUpdateOperation;
}): GraphQLOperation<TReplaceOperation, TUpdateOperation> => {
    const replaces: TReplaceOperation[] = [];
    source.forEach((serverOperation, key) => {
        if (serverOperation.type !== replace) {
            return;
        }
        const { oldValue, newValue } = serverOperation.operation;
        const toPush = toReplaceOperation({ prevState: oldValue, nextState: newValue, key });
        if (toPush == null) {
            return;
        }
        replaces.push(toPush);
    });

    const updates: TUpdateOperation[] = [];
    source.forEach((serverOperation, key) => {
        if (serverOperation.type !== update) {
            return;
        }
        const newValueResult = toUpdateOperation({
            operation: serverOperation.operation,
            key,
        });
        updates.push(newValueResult);
    });

    return { replace: replaces, update: updates };
};

// Make sure this:
// - apply(prevState, source) = nextState
export const toGraphQLWithState = <TKey1, TKey2, TSourceState, TReplaceOperation, TSourceOperation, TUpdateOperation>({
    source,
    isPrivate,
    prevState,
    nextState,
    toReplaceOperation,
    toUpdateOperation,
}: {
    source: ReadonlyDualKeyMapTwoWayOperation<TKey1, TKey2, TSourceState, TSourceOperation>;
    // 対象となるユーザーの視点で、全体がprivateとなるときはtrueを返す。一部がprivate、もしくはprivateである部分がないときはfalseを返す。
    isPrivate: (state: TSourceState, key: DualKey<TKey1, TKey2>) => boolean;
    prevState: ReadonlyDualKeyMap<TKey1, TKey2, TSourceState>;
    nextState: ReadonlyDualKeyMap<TKey1, TKey2, TSourceState>;
    // toReplaceOperationとtoUpdateOperationでは、全体がprivateになるケースについて書く必要はない。
    toReplaceOperation: (params: { prevState?: TSourceState; nextState?: TSourceState; key: DualKey<TKey1, TKey2> }) => TReplaceOperation | null | undefined;
    toUpdateOperation: (params: { operation: TSourceOperation; key: DualKey<TKey1, TKey2>; prevState: TSourceState; nextState: TSourceState }) => TUpdateOperation | null | undefined;
}): GraphQLOperation<TReplaceOperation, TUpdateOperation> => {
    const replaces: TReplaceOperation[] = [];
    source.forEach((serverOperation, key) => {
        if (serverOperation.type !== replace) {
            return;
        }
        const { oldValue, newValue } = serverOperation.operation;
        if (oldValue === undefined || isPrivate(oldValue, key)) {
            if (newValue === undefined || isPrivate(newValue, key)) {
                return;
            }
            const toPush = toReplaceOperation({ nextState: newValue, key });
            if (toPush == null) {
                return;
            }
            replaces.push(toPush);
            return;
        }
        if (newValue === undefined || isPrivate(newValue, key)) {
            const toPush = toReplaceOperation({ prevState: oldValue, key });
            if (toPush == null) {
                return;
            }
            replaces.push(toPush);
            return;
        }
        const toPush = toReplaceOperation({ prevState: oldValue, nextState: newValue, key });
        if (toPush == null) {
            return;
        }
        replaces.push(toPush);
    });

    const updates: TUpdateOperation[] = [];
    source.forEach((serverOperation, key) => {
        if (serverOperation.type !== update) {
            return;
        }
        const prevStateElement = prevState.get(key);
        if (prevStateElement === undefined) {
            throw `tried to operate "${key}", but not found in prevState.`;
        }
        const nextStateElement = nextState.get(key);
        if (nextStateElement === undefined) {
            throw `tried to operate "${key}", but not found in nextState.`;
        }
        if (isPrivate(prevStateElement, key)) {
            if (isPrivate(nextStateElement, key)) {
                return;
            }
            const toPush = toReplaceOperation({ nextState: nextStateElement, key });
            if (toPush == null) {
                return;
            }
            replaces.push(toPush);
            return;
        }
        if (isPrivate(nextStateElement, key)) {
            const toPush = toReplaceOperation({ prevState: prevStateElement, key });
            if (toPush == null) {
                return;
            }
            replaces.push(toPush);
            return;
        }
        const clientOperation = toUpdateOperation({
            operation: serverOperation.operation,
            key,
            prevState: prevStateElement,
            nextState: nextStateElement,
        });
        if (clientOperation == null) {
            return;
        }
        updates.push(clientOperation);
    });

    return { replace: replaces, update: updates };
};

// downOperationは、composeDownOperationLooseによって作成されたものでも構わない。その代わり、innerDiffはdownでなくtwoWayである必要がある。
export const restore = <TKey1, TKey2, TState, TDownOperation, TTwoWayOperation>({ nextState, downOperation, innerRestore, innerDiff }: RestoreParameters<TKey1, TKey2, TState, TDownOperation, TTwoWayOperation>): Result<RestoreResult<DualKeyMap<TKey1, TKey2, TState>, DualKeyMapTwoWayOperation<TKey1, TKey2, TState, TTwoWayOperation>>> => {
    const prevState = nextState.clone();
    const twoWayOperation = new DualKeyMap<TKey1, TKey2, DualKeyMapTwoWayOperationElementUnion<TState, TTwoWayOperation>>();

    for (const [key, value] of downOperation) {
        switch (value.type) {
            case 'replace': {
                const oldValue = value.operation.oldValue;
                const newValue = nextState.get(key);
                if (oldValue === undefined) {
                    prevState.delete(key);
                } else {
                    prevState.set(key, oldValue);
                }
                if (oldValue === undefined) {
                    if (newValue === undefined) {
                        break;
                    }
                    twoWayOperation.set(key, { type: 'replace', operation: { oldValue, newValue } });
                    break;
                }
                if (newValue === undefined) {
                    twoWayOperation.set(key, { type: 'replace', operation: { oldValue, newValue } });
                    break;
                }
                const diff = innerDiff({ key, prevState: oldValue, nextState: newValue });
                if (diff !== undefined) {
                    twoWayOperation.set(key, { type: 'update', operation: diff });
                }
                break;
            }
            case 'update': {
                const nextCharacterState = nextState.get(key);
                if (nextCharacterState === undefined) {
                    return ResultModule.error(`tried to update "${toJSONString(key)}", but nextState does not have such a key`);
                }
                const restored = innerRestore({ key, downOperation: value.operation, nextState: nextCharacterState });
                if (restored.isError) {
                    return restored;
                }
                prevState.set(key, restored.value.prevState);
                if (restored.value.twoWayOperation !== undefined) {
                    twoWayOperation.set(key, { type: 'update', operation: restored.value.twoWayOperation });
                }
                break;
            }
        }
    }

    return ResultModule.ok({ prevState, twoWayOperation });
};

export const applyBack = <TKey1, TKey2, TState, TDownOperation>({ nextState, downOperation, innerApplyBack }: ApplyBackParameters<TKey1, TKey2, TState, TDownOperation>): Result<DualKeyMap<TKey1, TKey2, TState>> => {
    const prevState = nextState.clone();

    for (const [key, value] of downOperation) {
        switch (value.type) {
            case 'replace': {
                if (value.operation.oldValue === undefined) {
                    prevState.delete(key);
                } else {
                    prevState.set(key, value.operation.oldValue);
                }
                break;
            }
            case 'update': {
                const nextCharacterState = nextState.get(key);
                if (nextCharacterState === undefined) {
                    return ResultModule.error(`tried to update "${toJSONString(key)}", but nextState does not have such a key`);
                }
                const oldValue = innerApplyBack({ key, downOperation: value.operation, nextState: nextCharacterState });
                if (oldValue.isError) {
                    return oldValue;
                }
                prevState.set(key, oldValue.value);
                break;
            }
        }
    }

    return ResultModule.ok(prevState);
};

// stateが必要ないため処理を高速化&簡略化できるが、その代わり戻り値のreplaceにおいて oldValue === undefined && newValue === undefined もしくは oldValue !== undefined && newValue !== undefinedになるケースがある。
export const composeDownOperationLoose = <TKey1, TKey2, TState, TDownOperation>({ first, second, innerApplyBack, innerCompose }: ComposeParameters<TKey1, TKey2, TState, TDownOperation>): Result<DualKeyMapDownOperation<TKey1, TKey2, TState, TDownOperation>> => {
    const result = new DualKeyMap<TKey1, TKey2, DualKeyMapDownOperationElementUnion<TState, TDownOperation>>();

    for (const [key, groupJoined] of groupJoin(first, second)) {
        switch (groupJoined.type) {
            case left:
                switch (groupJoined.left.type) {
                    case 'replace':
                        result.set(key, { type: 'replace', operation: groupJoined.left.operation });
                        continue;
                    case 'update':
                        result.set(key, { type: 'update', operation: groupJoined.left.operation });
                        continue;
                }
                break;
            case right:
                switch (groupJoined.right.type) {
                    case 'replace':
                        result.set(key, { type: 'replace', operation: groupJoined.right.operation });
                        continue;
                    case 'update':
                        result.set(key, { type: 'update', operation: groupJoined.right.operation });
                        continue;
                }
                break;
            case both:
                switch (groupJoined.left.type) {
                    case 'replace':
                        switch (groupJoined.right.type) {
                            case 'replace': {
                                const left = groupJoined.left.operation.oldValue;
                                result.set(key, { type: 'replace', operation: { oldValue: left } });
                                continue;
                            }
                        }
                        result.set(key, { type: 'replace', operation: groupJoined.left.operation });
                        continue;
                    case 'update':
                        switch (groupJoined.right.type) {
                            case 'replace': {
                                if (groupJoined.right.operation.oldValue === undefined) {
                                    return ResultModule.error(`first is update, but second.oldValue is undefined. the key is "${key}".`);
                                }
                                const firstOldValue = innerApplyBack({ key, downOperation: groupJoined.left.operation, nextState: groupJoined.right.operation.oldValue });
                                if (firstOldValue.isError) {
                                    return firstOldValue;
                                }
                                result.set(key, { type: 'replace', operation: { oldValue: firstOldValue.value } });
                                continue;
                            }
                            case 'update': {
                                const update = innerCompose({ key, first: groupJoined.left.operation, second: groupJoined.right.operation });
                                if (update.isError) {
                                    return update;
                                }
                                if (update.value === undefined) {
                                    continue;
                                }
                                result.set(key, { type: 'update', operation: update.value });
                                continue;
                            }
                        }
                }
                break;
        }
    }
    return ResultModule.ok(result);
};

// Make sure these:
// - apply(prevState, first) = nextState
export const transform = <TKey1, TKey2, TServerState, TClientState, TFirstOperation, TSecondOperation>({
    first,
    second,
    prevState,
    nextState,
    innerTransform,
    toServerState,
    protectedValuePolicy
}: TransformParameters<TKey1, TKey2, TServerState, TClientState, TFirstOperation, TSecondOperation>): Result<DualKeyMapTwoWayOperation<TKey1, TKey2, TServerState, TFirstOperation>> => {
    // 現在のCharacterの全体Privateの仕組みだと、PrivateになっているCharacterをupdateもしくはremoveしようとしてもエラーは出ない（最新の状態でPrivateになっているかどうかはクライアント側はわからないので、代わりにエラーを返すのは問題がある）。だが、現在のこのtransformのコードだと、存在しないCharacterをupdateもしくはremoveしようとするとエラーを返す。このため、keyを Brute-force attackすることで、PrivateになっているCharacterが存在することを理論上は判別できてしまう。だが、中の値は見ることができないので、現状のままでも問題ないと考えている。

    const result = new DualKeyMap<TKey1, TKey2, DualKeyMapTwoWayOperationElementUnion<TServerState, TFirstOperation>>();

    for (const [key, operation] of second) {
        switch (operation.type) {
            case replace: {
                const innerPrevState = prevState.get(key);
                const innerNextState = nextState.get(key);

                /**** requested to remove ****/

                if (operation.operation.newValue === undefined) {
                    if (innerPrevState === undefined) {
                        return ResultModule.error(`"${dualKeyToString(key)}" was not found at requested revision. It is not allowed to try to remove non-existing element.`);
                    }
                    if (innerNextState === undefined) {
                        // removeを試みたが、既に誰かによってremoveされているので何もする必要がない。よって終了。
                        break;
                    }

                    if (protectedValuePolicy.cancelRemove) {
                        if (protectedValuePolicy.cancelRemove({ key, nextState: innerNextState })) {
                            break;
                        }
                    }

                    result.set(key, { type: replace, operation: { oldValue: innerNextState, newValue: undefined } });
                    break;
                }

                /**** requested to add ****/

                if (innerPrevState !== undefined) {
                    return ResultModule.error(`"${key}" was found at requested revision. When adding a state, old value must be empty.`);
                }

                if (innerNextState !== undefined) {
                    // addを試みたが、既に誰かによってaddされているので何もする必要がない。よって終了。
                    break;
                }

                if (protectedValuePolicy.cancelCreate) {
                    if (protectedValuePolicy.cancelCreate({ key })) {
                        break;
                    }
                }

                result.set(key, { type: replace, operation: { oldValue: undefined, newValue: toServerState(operation.operation.newValue, key) } });
                break;
            }
            case update: {
                const innerPrevState = prevState.get(key);
                const innerNextState = nextState.get(key);
                const innerFirst = first?.get(key);
                if (innerPrevState === undefined) {
                    return ResultModule.error(`tried to update "${toJSONString(key)}", but not found.`);
                }
                if (innerNextState === undefined) {
                    // updateを試みたが、既に誰かによってremoveされているのでupdateは行われない。よって終了。
                    break;
                }
                // Type guard。事前条件が満たされていれば、innerPrevState !== undefinedかつinnerNextState !== undefinedならばこれは必ずfalseになるので、下のbreakには来ない。
                if (innerFirst !== undefined && innerFirst.type === replace) {
                    break;
                }

                const transformed = innerTransform({
                    first: innerFirst?.operation,
                    second: operation.operation,
                    prevState: innerPrevState,
                    nextState: innerNextState,
                    key,
                });
                if (transformed.isError) {
                    return transformed;
                }
                const transformedUpdate = transformed.value;
                if (transformedUpdate !== undefined) {
                    result.set(key, { type: update, operation: transformedUpdate });
                }
            }
        }
    }
    return ResultModule.ok(result);
};

export const apply = async <TKey1, TKey2, TEntityState, TReplaceOperationState, TOperation>(params: {
    toDualKey: (entity: TEntityState) => DualKey<TKey1, TKey2>;
    state: Collection<TEntityState>;
    operation: ReadonlyDualKeyMapUpOperation<TKey1, TKey2, TReplaceOperationState, TOperation>;
    update: (params: { state: TEntityState; operation: TOperation; key: DualKey<TKey1, TKey2> }) => Promise<void>;
    create: (params: { state: TReplaceOperationState; key: DualKey<TKey1, TKey2> }) => Promise<TEntityState | undefined>;
    delete: (params: { key: DualKey<TKey1, TKey2> }) => Promise<boolean>;
}): Promise<void> => {
    const stateAsStateMap = new DualKeyMap<TKey1, TKey2, TEntityState>();
    (await params.state.loadItems()).forEach(s => {
        stateAsStateMap.set(params.toDualKey(s), s);
    });
    for (const [key, value] of groupJoin(stateAsStateMap, params.operation)) {
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

export const diff = <TKey1, TKey2, TState, TOperation>({
    prev,
    next,
    innerDiff,
}: {
    prev: ReadonlyDualKeyMap<TKey1, TKey2, TState>;
    next: ReadonlyDualKeyMap<TKey1, TKey2, TState>;
    innerDiff: (params: { key: DualKey<TKey1, TKey2>; prev: TState; next: TState }) => TOperation | undefined;
}): DualKeyMapTwoWayOperation<TKey1, TKey2, TState, TOperation> => {
    const result = new DualKeyMap<TKey1, TKey2, DualKeyMapTwoWayOperationElementUnion<TState, TOperation>>();
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
                const diffResult = innerDiff({ key, prev: value.left, next: value.right });
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
