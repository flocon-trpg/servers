import * as t from 'io-ts';
import { DualKey, DualKeyMap, dualKeyToString, groupJoin, toJSONString } from '../../../DualKeyMap';
import { CustomResult, ResultModule } from '../../../Result';
import { both, left, right } from '../../../Types';
import { dualKeyRecordFind, dualKeyRecordForEach, recordToDualKeyMap, recordToMap } from '../../../utils';
import { DualKeyRecord, recordDownOperationElementFactory, RecordDownOperationElement, RecordTwoWayOperationElement, recordUpOperationElementFactory, RecordUpOperationElement, replace, update } from './recordOperationElement';

export type DualKeyRecordDownOperation<TState, TOperation> = Record<string, Record<string, RecordDownOperationElement<TState, TOperation>>>;
export type DualKeyRecordUpOperation<TState, TOperation> = Record<string, Record<string, RecordUpOperationElement<TState, TOperation>>>;
export type DualKeyRecordTwoWayOperation<TState, TOperation> = Record<string, Record<string, RecordTwoWayOperationElement<TState, TOperation>>>;

export const dualKeyMapStateFactory = <TKey1 extends t.Mixed, TKey2 extends t.Mixed, TState extends t.Mixed>(key1: TKey1, key2: TKey2, state: TState) => t.record(key1, t.record(key2, state));

export const dualKeyMapDownOperationFactory = <TKey1 extends t.Mixed, TKey2 extends t.Mixed, TState extends t.Mixed, TOperation extends t.Mixed>(key1: TKey1, key2: TKey2, state: TState, operation: TOperation) => t.record(key1, t.record(key2, recordDownOperationElementFactory(state, operation)));

export const dualKeyMapUpOperationFactory = <TKey1 extends t.Mixed, TKey2 extends t.Mixed, TState extends t.Mixed, TOperation extends t.Mixed>(key1: TKey1, key2: TKey2, state: TState, operation: TOperation) => t.record(key1, t.record(key2, recordUpOperationElementFactory(state, operation)));

type RestoreResult<TState, TTwoWayOperation> = { prevState: TState; twoWayOperation: TTwoWayOperation | undefined }

export type ProtectedTransformParameters<TServerState, TFirstOperation, TSecondOperation> = {
    first?: TFirstOperation;
    second: TSecondOperation;
    prevState: TServerState;
    nextState: TServerState;
}

export type CancellationPolicy<TKey, TServerState> = {
    // trueを返すと、「TServerState全体がprivateであり編集不可能」とみなしてスキップする。ただし制限されるのはtransformのみであるため、読み取りなどは制限されない。
    // 「ユーザーがprivateだと思っていたらその後すぐ変更があってprivateになった」というケースがあるので、trueでもエラーは返さず処理が続行される。
    // 関数ではなくundefinedを渡した場合、常にfalseを返す関数が渡されたときと同等の処理が行われる。

    cancelRemove?: (params: { key: TKey; nextState: TServerState }) => boolean;

    // cancelUpdateなしでもinnerTransformのほうで同等のことはできるが、プロテクト忘れを防ぎやくするために設けている。
    cancelUpdate?: (params: { key: TKey; prevState: TServerState; nextState: TServerState }) => boolean;

    cancelCreate?: (params: { key: TKey }) => boolean;
}

// Make sure this:
// - apply(prevState, source) = nextState
export const toClientState = <TSourceState, TClientState>({
    serverState,
    isPrivate,
    toClientState,
}: {
    serverState: Record<string, Record<string, TSourceState>>;

    // 対象となるユーザーの視点で、全体がprivateとなるときはtrueを返す。一部がprivateである、もしくはprivateである部分がないときはfalseを返す。
    isPrivate: (state: TSourceState, key: DualKey<string, string>) => boolean;

    // 全体がprivateになるケースについて書く必要はない。
    toClientState: (params: { state: TSourceState; key: DualKey<string, string> }) => TClientState;
}) => {
    const result = new DualKeyMap<string, string, TClientState>();

    dualKeyRecordForEach(serverState, (value, key) => {
        if (isPrivate(value, key)) {
            return;
        }
        result.set(key, toClientState({ state: value, key }));
    });

    return result.toStringRecord(x => x, x => x);
};

export const toClientOperation = <TSourceState, TClientState, TSourceOperation, TClientOperation>({
    diff,
    isPrivate,
    prevState,
    nextState,
    toClientState,
    toClientOperation,
}: {
    diff: Record<string, Record<string, RecordTwoWayOperationElement<TSourceState, TSourceOperation>>>;

    // 対象となるユーザーの視点で、全体がprivateとなるときはtrueを返す。一部がprivateである、もしくはprivateである部分がないときはfalseを返す。
    isPrivate: (state: TSourceState, key: DualKey<string, string>) => boolean;

    prevState: Record<string, Record<string, TSourceState>>;
    nextState: Record<string, Record<string, TSourceState>>;

    // 全体がprivateになるケースについて書く必要はない。
    toClientState: (params: { prevState: TSourceState | undefined; nextState: TSourceState; key: DualKey<string, string> }) => TClientState;

    // 全体がprivateになるケースについて書く必要はない。
    toClientOperation: (params: { diff: TSourceOperation; key: DualKey<string, string>; prevState: TSourceState; nextState: TSourceState }) => TClientOperation | null | undefined;
}) => {
    const result = new DualKeyMap<string, string, RecordUpOperationElement<TClientState, TClientOperation>>();
    dualKeyRecordForEach(diff, (value, key) => {
        if (value.type === replace) {
            const { oldValue, newValue } = value.replace;
            if (oldValue === undefined || isPrivate(oldValue, key)) {
                if (newValue === undefined || isPrivate(newValue, key)) {
                    return;
                }
            }
            if (newValue === undefined || isPrivate(newValue, key)) {
                result.set(key, {
                    type: replace,
                    replace: { newValue: undefined },
                });
                return;
            }
            const clientState = toClientState({ prevState: oldValue, nextState: newValue, key });
            result.set(key, {
                type: replace,
                replace: { newValue: clientState },
            });
            return;
        }

        const prevStateElement = dualKeyRecordFind(prevState, key);
        if (prevStateElement === undefined) {
            throw `tried to operate "${key}", but not found in prevState.`;
        }
        const nextStateElement = dualKeyRecordFind(nextState, key);
        if (nextStateElement === undefined) {
            throw `tried to operate "${key}", but not found in nextState.`;
        }

        if (isPrivate(prevStateElement, key)) {
            if (isPrivate(nextStateElement, key)) {
                return;
            }
            result.set(key, {
                type: replace,
                replace: {
                    newValue: toClientState({ prevState: prevStateElement, nextState: nextStateElement, key }),
                }
            });
            return;
        }
        if (isPrivate(nextStateElement, key)) {
            result.set(key, {
                type: replace,
                replace: {
                    newValue: undefined,
                }
            });
            return;
        }
        const operation = toClientOperation({ diff: value.update, key, prevState: prevStateElement, nextState: nextStateElement });
        if (operation != null) {
            result.set(key, {
                type: update,
                update: operation,
            });
        }
    });
    return result.toStringRecord(x => x, x => x);
};

// downOperationは、composeDownOperationLooseによって作成されたものでも構わない。その代わり、innerDiffはdownでなくtwoWayである必要がある。
export const restore = <TState, TDownOperation, TTwoWayOperation, TCustomError = string>({
    nextState,
    downOperation,
    innerRestore,
    innerDiff
}: {
    nextState: Record<string, Record<string, TState>>;
    downOperation?: Record<string, Record<string, RecordDownOperationElement<TState, TDownOperation>>>;
    innerRestore: (params: { key: DualKey<string, string>; downOperation: TDownOperation; nextState: TState }) => CustomResult<RestoreResult<TState, TTwoWayOperation | undefined>, string | TCustomError>;
    innerDiff: (params: { key: DualKey<string, string>; prevState: TState; nextState: TState }) => TTwoWayOperation | undefined;
}): CustomResult<RestoreResult<Record<string, Record<string, TState>>, DualKeyRecordTwoWayOperation<TState, TTwoWayOperation>>, string | TCustomError> => {
    if (downOperation == null) {
        return ResultModule.ok({
            prevState: nextState,
            twoWayOperation: undefined,
        });
    }

    const prevState = DualKeyMap.ofRecord(nextState);
    const twoWayOperation = new DualKeyMap<string, string, RecordTwoWayOperationElement<TState, TTwoWayOperation>>();

    for (const [key, value] of DualKeyMap.ofRecord(downOperation)) {
        switch (value.type) {
            case 'replace': {
                const oldValue = value.replace.oldValue;
                const newValue = dualKeyRecordFind(nextState, key);
                if (oldValue === undefined) {
                    prevState.delete(key);
                } else {
                    prevState.set(key, oldValue);
                }
                if (oldValue === undefined) {
                    if (newValue === undefined) {
                        break;
                    }
                    twoWayOperation.set(key, { type: 'replace', replace: { oldValue, newValue } });
                    break;
                }
                if (newValue === undefined) {
                    twoWayOperation.set(key, { type: 'replace', replace: { oldValue, newValue: undefined } });
                    break;
                }
                const diff = innerDiff({ key, prevState: oldValue, nextState: newValue });
                if (diff !== undefined) {
                    twoWayOperation.set(key, { type: 'update', update: diff });
                }
                break;
            }
            case 'update': {
                const nextStateElement = dualKeyRecordFind(nextState, key);
                if (nextStateElement === undefined) {
                    return ResultModule.error(`tried to update "${toJSONString(key)}", but nextState does not have such a key`);
                }
                const restored = innerRestore({ key, downOperation: value.update, nextState: nextStateElement });
                if (restored.isError) {
                    return restored;
                }
                prevState.set(key, restored.value.prevState);
                if (restored.value.twoWayOperation !== undefined) {
                    twoWayOperation.set(key, { type: 'update', update: restored.value.twoWayOperation });
                }
                break;
            }
        }
    }

    return ResultModule.ok({
        prevState: prevState.toStringRecord(x => x, x => x),
        twoWayOperation: twoWayOperation.toStringRecord(x => x, x => x)
    });
};

export const apply = <TState, TOperation, TCustomError = string>({
    prevState,
    operation,
    innerApply
}: {
    prevState: Record<string, Record<string, TState>>;
    operation?: Record<string, Record<string, RecordUpOperationElement<TState, TOperation>>>;
    innerApply: (params: { key: DualKey<string, string>; operation: TOperation; prevState: TState }) => CustomResult<TState, string | TCustomError>;
}): CustomResult<Record<string, Record<string, TState>>, string | TCustomError> => {
    if (operation == null) {
        return ResultModule.ok(prevState);
    }

    const nextState = DualKeyMap.ofRecord(prevState);

    for (const [key, value] of DualKeyMap.ofRecord(operation)) {
        switch (value.type) {
            case 'replace': {
                if (value.replace.newValue === undefined) {
                    nextState.delete(key);
                } else {
                    nextState.set(key, value.replace.newValue);
                }
                break;
            }
            case 'update': {
                const prevStateElement = dualKeyRecordFind(prevState, key);
                if (prevStateElement === undefined) {
                    return ResultModule.error(`tried to update "${toJSONString(key)}", but prevState does not have such a key`);
                }
                const newValue = innerApply({ key, operation: value.update, prevState: prevStateElement });
                if (newValue.isError) {
                    return newValue;
                }
                nextState.set(key, newValue.value);
                break;
            }
        }
    }

    return ResultModule.ok(nextState.toStringRecord(x => x, x => x));
};

export const applyBack = <TState, TDownOperation, TCustomError = string>({
    nextState,
    operation: operation,
    innerApplyBack
}: {
    nextState: Record<string, Record<string, TState>>;
    operation?: Record<string, Record<string, RecordDownOperationElement<TState, TDownOperation>>>;
    innerApplyBack: (params: { key: DualKey<string, string>; operation: TDownOperation; state: TState }) => CustomResult<TState, string | TCustomError>;
}): CustomResult<Record<string, Record<string, TState>>, string | TCustomError> => {
    if (operation == null) {
        return ResultModule.ok(nextState);
    }

    const prevState = DualKeyMap.ofRecord(nextState);

    for (const [key, value] of DualKeyMap.ofRecord(operation)) {
        switch (value.type) {
            case 'replace': {
                if (value.replace.oldValue === undefined) {
                    prevState.delete(key);
                } else {
                    prevState.set(key, value.replace.oldValue);
                }
                break;
            }
            case 'update': {
                const nextStateElement = dualKeyRecordFind(nextState, key);
                if (nextStateElement === undefined) {
                    return ResultModule.error(`tried to update "${toJSONString(key)}", but nextState does not have such a key`);
                }
                const oldValue = innerApplyBack({ key, operation: value.update, state: nextStateElement });
                if (oldValue.isError) {
                    return oldValue;
                }
                prevState.set(key, oldValue.value);
                break;
            }
        }
    }

    return ResultModule.ok(prevState.toStringRecord(x => x, x => x));
};

export const composeUpOperation = <TState, TUpOperation, TCustomError = string>({
    first,
    second,
    innerApply,
    innerCompose
}: {
    first?: DualKeyRecordUpOperation<TState, TUpOperation>;
    second?: DualKeyRecordUpOperation<TState, TUpOperation>;
    innerApply: (params: { key: DualKey<string, string>; operation: TUpOperation; state: TState }) => CustomResult<TState, string | TCustomError>;
    innerCompose: (params: { key: DualKey<string, string>; first: TUpOperation; second: TUpOperation }) => CustomResult<TUpOperation | undefined, string | TCustomError>;
}): CustomResult<DualKeyRecordUpOperation<TState, TUpOperation> | undefined, string | TCustomError> => {
    if (first == null) {
        return ResultModule.ok(second);
    }
    if (second == null) {
        return ResultModule.ok(first);
    }

    const result = new DualKeyMap<string, string, RecordUpOperationElement<TState, TUpOperation>>();

    for (const [key, groupJoined] of groupJoin(DualKeyMap.ofRecord(first), DualKeyMap.ofRecord(second))) {
        switch (groupJoined.type) {
            case left:
                switch (groupJoined.left.type) {
                    case 'replace':
                        result.set(key, { type: 'replace', replace: groupJoined.left.replace });
                        continue;
                    case 'update':
                        result.set(key, { type: 'update', update: groupJoined.left.update });
                        continue;
                }
                break;
            case right:
                switch (groupJoined.right.type) {
                    case 'replace':
                        result.set(key, { type: 'replace', replace: groupJoined.right.replace });
                        continue;
                    case 'update':
                        result.set(key, { type: 'update', update: groupJoined.right.update });
                        continue;
                }
                break;
            case both:
                switch (groupJoined.right.type) {
                    case 'replace':
                        switch (groupJoined.left.type) {
                            case 'replace': {
                                const right = groupJoined.right.replace.newValue;
                                result.set(key, { type: 'replace', replace: { newValue: right } });
                                continue;
                            }
                        }
                        result.set(key, { type: 'replace', replace: groupJoined.right.replace });
                        continue;
                    case 'update':
                        switch (groupJoined.left.type) {
                            case 'replace': {
                                if (groupJoined.left.replace.newValue === undefined) {
                                    return ResultModule.error(`second is update, but first.newValue is null. the key is "${key}".`);
                                }
                                const secondNewValue = innerApply({ key, operation: groupJoined.right.update, state: groupJoined.left.replace.newValue });
                                if (secondNewValue.isError) {
                                    return secondNewValue;
                                }
                                result.set(key, { type: 'replace', replace: { newValue: secondNewValue.value } });
                                continue;
                            }
                            case 'update': {
                                const update = innerCompose({ key, first: groupJoined.left.update, second: groupJoined.right.update });
                                if (update.isError) {
                                    return update;
                                }
                                if (update.value === undefined) {
                                    continue;
                                }
                                result.set(key, { type: 'update', update: update.value });
                                continue;
                            }
                        }
                }
                break;
        }
    }
    return ResultModule.ok(result.toStringRecord(x => x, x => x));
};

// stateが必要ないため処理を高速化&簡略化できるが、その代わり戻り値のreplaceにおいて oldValue === undefined && newValue === undefined もしくは oldValue !== undefined && newValue !== undefinedになるケースがある。
export const composeDownOperation = <TState, TDownOperation, TCustomError = string>({
    first,
    second,
    innerApplyBack,
    innerCompose
}: {
    first?: DualKeyRecordDownOperation<TState, TDownOperation>;
    second?: DualKeyRecordDownOperation<TState, TDownOperation>;
    innerApplyBack: (params: { key: DualKey<string, string>; operation: TDownOperation; state: TState }) => CustomResult<TState, string | TCustomError>;
    innerCompose: (params: { key: DualKey<string, string>; first: TDownOperation; second: TDownOperation }) => CustomResult<TDownOperation | undefined, string | TCustomError>;
}): CustomResult<DualKeyRecordDownOperation<TState, TDownOperation> | undefined, string | TCustomError> => {
    if (first == null) {
        return ResultModule.ok(second);
    }
    if (second == null) {
        return ResultModule.ok(first);
    }

    const result = new DualKeyMap<string, string, RecordDownOperationElement<TState, TDownOperation>>();

    for (const [key, groupJoined] of groupJoin(DualKeyMap.ofRecord(first), DualKeyMap.ofRecord(second))) {
        switch (groupJoined.type) {
            case left:
                switch (groupJoined.left.type) {
                    case 'replace':
                        result.set(key, { type: 'replace', replace: groupJoined.left.replace });
                        continue;
                    case 'update':
                        result.set(key, { type: 'update', update: groupJoined.left.update });
                        continue;
                }
                break;
            case right:
                switch (groupJoined.right.type) {
                    case 'replace':
                        result.set(key, { type: 'replace', replace: groupJoined.right.replace });
                        continue;
                    case 'update':
                        result.set(key, { type: 'update', update: groupJoined.right.update });
                        continue;
                }
                break;
            case both:
                switch (groupJoined.left.type) {
                    case 'replace':
                        switch (groupJoined.right.type) {
                            case 'replace': {
                                const left = groupJoined.left.replace.oldValue;
                                result.set(key, { type: 'replace', replace: { oldValue: left } });
                                continue;
                            }
                        }
                        result.set(key, { type: 'replace', replace: groupJoined.left.replace });
                        continue;
                    case 'update':
                        switch (groupJoined.right.type) {
                            case 'replace': {
                                if (groupJoined.right.replace.oldValue === undefined) {
                                    return ResultModule.error(`first is update, but second.oldValue is null. the key is "${key}".`);
                                }
                                const firstOldValue = innerApplyBack({ key, operation: groupJoined.left.update, state: groupJoined.right.replace.oldValue });
                                if (firstOldValue.isError) {
                                    return firstOldValue;
                                }
                                result.set(key, { type: 'replace', replace: { oldValue: firstOldValue.value } });
                                continue;
                            }
                            case 'update': {
                                const update = innerCompose({ key, first: groupJoined.left.update, second: groupJoined.right.update });
                                if (update.isError) {
                                    return update;
                                }
                                if (update.value === undefined) {
                                    continue;
                                }
                                result.set(key, { type: 'update', update: update.value });
                                continue;
                            }
                        }
                }
                break;
        }
    }
    return ResultModule.ok(result.toStringRecord(x => x, x => x));
};

// Make sure these:
// - apply(prevState, first) = nextState
export const serverTransform = <TServerState, TClientState, TFirstOperation, TSecondOperation, TCustomError = string>({
    first,
    second,
    prevState,
    nextState,
    innerTransform,
    toServerState,
    cancellationPolicy,
}: {
    prevState: DualKeyRecord<TServerState>;
    nextState: DualKeyRecord<TServerState>;
    first?: DualKeyRecordUpOperation<TServerState, TFirstOperation>;
    second?: DualKeyRecordUpOperation<TClientState, TSecondOperation>;
    toServerState: (state: TClientState, key: DualKey<string, string>) => TServerState;
    innerTransform: (params: ProtectedTransformParameters<TServerState, TFirstOperation, TSecondOperation> & { key: DualKey<string, string> }) => CustomResult<TFirstOperation | undefined, string | TCustomError>;
    cancellationPolicy: CancellationPolicy<DualKey<string, string>, TServerState>;
}): CustomResult<DualKeyRecordTwoWayOperation<TServerState, TFirstOperation> | undefined, string | TCustomError> => {
    // 現在のCharacterの全体Privateの仕組みだと、PrivateになっているCharacterをupdateもしくはremoveしようとしてもエラーは出ない（最新の状態でPrivateになっているかどうかはクライアント側はわからないので、代わりにエラーを返すのは問題がある）。だが、現在のこのtransformのコードだと、存在しないCharacterをupdateもしくはremoveしようとするとエラーを返す。このため、keyを Brute-force attackすることで、PrivateになっているCharacterが存在することを理論上は判別できてしまう。だが、中の値は見ることができないので、現状のままでも問題ないと考えている。

    if (second === undefined) {
        return ResultModule.ok(undefined);
    }

    const result = new DualKeyMap<string, string, RecordTwoWayOperationElement<TServerState, TFirstOperation>>();

    for (const [key, operation] of DualKeyMap.ofRecord(second)) {
        switch (operation.type) {
            case replace: {
                const innerPrevState = dualKeyRecordFind(prevState, key);
                const innerNextState = dualKeyRecordFind(nextState, key);

                /**** requested to remove ****/

                if (operation.replace.newValue === undefined) {
                    if (innerPrevState === undefined) {
                        return ResultModule.error(`"${dualKeyToString(key)}" was not found at requested revision. It is not allowed to try to remove non-existing element.`);
                    }
                    if (innerNextState === undefined) {
                        // removeを試みたが、既に誰かによってremoveされているので何もする必要がない。よって終了。
                        break;
                    }

                    if (cancellationPolicy.cancelRemove) {
                        if (cancellationPolicy.cancelRemove({ key, nextState: innerNextState })) {
                            break;
                        }
                    }

                    result.set(key, { type: replace, replace: { oldValue: innerNextState, newValue: undefined } });
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

                if (cancellationPolicy.cancelCreate) {
                    if (cancellationPolicy.cancelCreate({ key })) {
                        break;
                    }
                }

                result.set(key, { type: replace, replace: { oldValue: undefined, newValue: toServerState(operation.replace.newValue, key) } });
                break;
            }
            case update: {
                const innerPrevState = dualKeyRecordFind(prevState, key);
                const innerNextState = dualKeyRecordFind(nextState, key);
                const innerFirst = dualKeyRecordFind(first ?? {}, key);
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
                if (cancellationPolicy.cancelUpdate) {
                    if (cancellationPolicy.cancelUpdate({ key, prevState: innerPrevState, nextState: innerNextState })) {
                        break;
                    }
                }
                const transformed = innerTransform({
                    first: innerFirst?.update,
                    second: operation.update,
                    prevState: innerPrevState,
                    nextState: innerNextState,
                    key,
                });
                if (transformed.isError) {
                    return transformed;
                }
                const transformedUpdate = transformed.value;
                if (transformedUpdate !== undefined) {
                    result.set(key, { type: update, update: transformedUpdate });
                }
            }
        }
    }
    return ResultModule.ok(result.toStringRecord(x => x, x => x));
};

type InnerClientTransform<TFirstOperation, TSecondOperation, TError = string> = (params: {
    first: TFirstOperation;
    second: TSecondOperation;
}) => CustomResult<{ firstPrime: TFirstOperation | undefined; secondPrime: TSecondOperation | undefined }, TError>;

type Diff<TState, TOperation> = (params: {
    prevState: TState;
    nextState: TState;
}) => TOperation | undefined;

const transformElement = <TState, TFirstOperation, TSecondOperation, TError = string>({
    first,
    second,
    innerTransform,
    innerDiff
}: {
    first: RecordUpOperationElement<TState, TFirstOperation>;
    second: RecordUpOperationElement<TState, TSecondOperation>;
    innerTransform: InnerClientTransform<TFirstOperation, TSecondOperation, TError>;
    innerDiff: Diff<TState, TFirstOperation>;
}): CustomResult<{ firstPrime: RecordUpOperationElement<TState, TFirstOperation> | undefined; secondPrime: RecordUpOperationElement<TState, TSecondOperation> | undefined }, TError> => {
    switch (first.type) {
        case replace:
            switch (second.type) {
                case replace:
                    // 通常、片方がnon-undefinedならばもう片方もnon-undefined。
                    if (first.replace.newValue !== undefined && second.replace.newValue !== undefined) {
                        const diffResult = innerDiff({ nextState: first.replace.newValue, prevState: second.replace.newValue });
                        if (diffResult === undefined) {
                            return ResultModule.ok({
                                firstPrime: undefined,
                                secondPrime: undefined
                            });
                        }
                        return ResultModule.ok({
                            firstPrime: { type: update, update: diffResult },
                            secondPrime: undefined
                        });
                    }
                    // 通常、ここに来る場合は first.newValue === undefined && second.newValue === undefined
                    return ResultModule.ok({
                        firstPrime: undefined,
                        secondPrime: undefined
                    });
                case update:
                    return ResultModule.ok({
                        firstPrime: first,
                        secondPrime: undefined,
                    });
            }
            break;
        case update:
            switch (second.type) {
                case replace: {
                    if (second.replace.newValue !== undefined) {
                        throw 'Tried to add an element, but already exists another value.';
                    }

                    return ResultModule.ok({
                        firstPrime: undefined,
                        secondPrime: {
                            type: replace,
                            replace: {
                                newValue: undefined,
                            },
                        },
                    });
                }
                case update: {
                    const xform = innerTransform({ first: first.update, second: second.update });
                    if (xform.isError) {
                        return xform;
                    }
                    return ResultModule.ok({
                        firstPrime: xform.value.firstPrime == null ? undefined : {
                            type: update,
                            update: xform.value.firstPrime,
                        },
                        secondPrime: xform.value.secondPrime == null ? undefined : {
                            type: update,
                            update: xform.value.secondPrime,
                        },
                    });
                }
            }
            break;
    }
};

export const clientTransform = <TState, TOperation, TError = string>({
    first,
    second,
    innerTransform,
    innerDiff,
}: {
    first?: DualKeyRecordUpOperation<TState, TOperation>;
    second?: DualKeyRecordUpOperation<TState, TOperation>;
    innerTransform: InnerClientTransform<TOperation, TOperation, TError>;
    innerDiff: Diff<TState, TOperation>;
}): CustomResult<{ firstPrime: DualKeyRecordUpOperation<TState, TOperation> | undefined; secondPrime: DualKeyRecordUpOperation<TState, TOperation> | undefined }, TError> => {
    if (first == null || second == null) {
        return ResultModule.ok({
            firstPrime: first,
            secondPrime: second,
        });
    }

    const firstPrime = new DualKeyMap<string, string, RecordUpOperationElement<TState, TOperation>>();
    const secondPrime = new DualKeyMap<string, string, RecordUpOperationElement<TState, TOperation>>();
    let error = undefined as { error: TError } | undefined;

    groupJoin(recordToDualKeyMap(first), recordToDualKeyMap(second)).forEach((group, key) => {
        if (error != null) {
            return;
        }
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
                const xform = transformElement({ first: group.left, second: group.right, innerTransform, innerDiff });
                if (xform.isError) {
                    error = { error: xform.error };
                    return;
                }
                if (xform.value.firstPrime !== undefined) {
                    firstPrime.set(key, xform.value.firstPrime);
                }
                if (xform.value.secondPrime !== undefined) {
                    secondPrime.set(key, xform.value.secondPrime);
                }
                return;
            }
        }
    });
    if (error != null) {
        return ResultModule.error(error.error);
    }
    return ResultModule.ok({
        firstPrime: firstPrime.isEmpty ? undefined : firstPrime.toStringRecord(x => x, x => x),
        secondPrime: secondPrime.isEmpty ? undefined : secondPrime.toStringRecord(x => x, x => x),
    });
};

export const diff = <TState, TOperation>({
    prevState,
    nextState,
    innerDiff,
}: {
    prevState: Record<string, Record<string, TState>>;
    nextState: Record<string, Record<string, TState>>;
    innerDiff: (params: { key: DualKey<string, string>; prevState: TState; nextState: TState }) => TOperation | undefined;
}) => {
    const result = new DualKeyMap<string, string, RecordTwoWayOperationElement<TState, TOperation>>();
    for (const [key, value] of groupJoin(DualKeyMap.ofRecord(prevState), DualKeyMap.ofRecord(nextState))) {
        switch (value.type) {
            case left:
                result.set(key, { type: replace, replace: { oldValue: value.left, newValue: undefined } });
                continue;
            case right: {
                result.set(key, { type: replace, replace: { oldValue: undefined, newValue: value.right } });
                continue;
            }
            case both: {
                const diffResult = innerDiff({ key, prevState: value.left, nextState: value.right });
                if (diffResult === undefined) {
                    continue;
                }
                result.set(key, { type: update, update: diffResult });
                continue;
            }
        }
    }
    return result.toStringRecord(x => x, x => x);
};