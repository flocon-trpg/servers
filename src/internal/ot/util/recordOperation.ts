import { CustomResult, Result } from '@kizahasi/result';
import * as t from 'io-ts';
import * as DualKeyRecordOperation from './dualKeyRecordOperation';
import { record, StringKeyRecord } from './record';
import {
    recordDownOperationElementFactory,
    RecordDownOperationElement,
    RecordTwoWayOperationElement,
    recordUpOperationElementFactory,
    RecordUpOperationElement,
} from './recordOperationElement';

export type RecordDownOperation<TState, TOperation> = StringKeyRecord<
    RecordDownOperationElement<TState, TOperation>
>;
export type RecordUpOperation<TState, TOperation> = StringKeyRecord<
    RecordUpOperationElement<TState, TOperation>
>;
export type RecordTwoWayOperation<TState, TOperation> = StringKeyRecord<
    RecordTwoWayOperationElement<TState, TOperation>
>;

export const stateFactory = <TKey extends t.Mixed, TState extends t.Mixed>(
    key: TKey,
    state: TState
) => record(key, state);

export const downOperationFactory = <
    TKey extends t.Mixed,
    TState extends t.Mixed,
    TOperation extends t.Mixed
>(
    key: TKey,
    state: TState,
    operation: TOperation
) => record(key, recordDownOperationElementFactory(state, operation));

export const upOperationFactory = <
    TKey extends t.Mixed,
    TState extends t.Mixed,
    TOperation extends t.Mixed
>(
    key: TKey,
    state: TState,
    operation: TOperation
) => record(key, recordUpOperationElementFactory(state, operation));

export type ProtectedTransformParameters<
    TServerState,
    TFirstOperation,
    TSecondOperation
> = DualKeyRecordOperation.ProtectedTransformParameters<
    TServerState,
    TFirstOperation,
    TSecondOperation
>;

export type CancellationPolicy<TKey, TServerState> = DualKeyRecordOperation.CancellationPolicy<
    TKey,
    TServerState
>;

type RestoreResult<TState, TTwoWayOperation> = {
    prevState: TState;
    twoWayOperation: TTwoWayOperation | undefined;
};

const dummyKey = '';

// Make sure this:
// - apply(prevState, source) = nextState
export const toClientState = <TSourceState, TClientState>({
    serverState,
    isPrivate,
    toClientState,
}: {
    serverState: StringKeyRecord<TSourceState>;

    // 対象となるユーザーの視点で、全体がprivateとなるときはtrueを返す。一部がprivateである、もしくはprivateである部分がないときはfalseを返す。
    isPrivate: (state: TSourceState, key: string) => boolean;

    // 全体がprivateになるケースについて書く必要はない。
    toClientState: (params: { state: TSourceState; key: string }) => TClientState;
}) => {
    return (
        DualKeyRecordOperation.toClientState({
            serverState: { [dummyKey]: serverState },
            isPrivate: (state, key) => isPrivate(state, key.second),
            toClientState: ({ state, key }) => toClientState({ state, key: key.second }),
        })[dummyKey] ?? {}
    );
};

// downOperationは、composeDownOperationLooseによって作成されたものでも構わない。その代わり、innerDiffはdownでなくtwoWayである必要がある。
export const restore = <TState, TDownOperation, TTwoWayOperation, TCustomError = string>({
    nextState,
    downOperation,
    innerRestore,
    innerDiff,
}: {
    nextState: StringKeyRecord<TState>;
    downOperation?: RecordDownOperation<TState, TDownOperation>;
    innerRestore: (params: {
        key: string;
        downOperation: TDownOperation;
        nextState: TState;
    }) => CustomResult<RestoreResult<TState, TTwoWayOperation | undefined>, string | TCustomError>;
    innerDiff: (params: {
        key: string;
        prevState: TState;
        nextState: TState;
    }) => TTwoWayOperation | undefined;
}): CustomResult<
    RestoreResult<StringKeyRecord<TState>, RecordTwoWayOperation<TState, TTwoWayOperation>>,
    string | TCustomError
> => {
    if (downOperation == null) {
        return Result.ok({
            prevState: nextState,
            twoWayOperation: undefined,
        });
    }

    const result = DualKeyRecordOperation.restore({
        nextState: { [dummyKey]: nextState },
        downOperation: { [dummyKey]: downOperation },
        innerRestore: ({ key, ...params }) => innerRestore({ ...params, key: key.second }),
        innerDiff: ({ key, ...params }) => innerDiff({ ...params, key: key.second }),
    });
    if (result.isError) {
        return result;
    }
    return Result.ok({
        prevState: result.value.prevState[dummyKey] ?? {},
        twoWayOperation:
            result.value.twoWayOperation === undefined
                ? undefined
                : result.value.twoWayOperation[dummyKey],
    });
};

export const apply = <TState, TOperation, TCustomError = string>({
    prevState,
    operation,
    innerApply,
}: {
    prevState: StringKeyRecord<TState>;
    operation?: RecordUpOperation<TState, TOperation>;
    innerApply: (params: {
        key: string;
        operation: TOperation;
        prevState: TState;
    }) => CustomResult<TState, string | TCustomError>;
}): CustomResult<StringKeyRecord<TState>, string | TCustomError> => {
    if (operation == null) {
        return Result.ok(prevState);
    }

    const result = DualKeyRecordOperation.apply({
        prevState: { [dummyKey]: prevState },
        operation: { [dummyKey]: operation },
        innerApply: ({ key, ...params }) => innerApply({ ...params, key: key.second }),
    });
    if (result.isError) {
        return result;
    }
    return Result.ok(result.value[dummyKey] ?? {});
};

export const applyBack = <TState, TDownOperation, TCustomError = string>({
    nextState,
    operation,
    innerApplyBack,
}: {
    nextState: StringKeyRecord<TState>;
    operation?: StringKeyRecord<RecordDownOperationElement<TState, TDownOperation>>;
    innerApplyBack: (params: {
        key: string;
        operation: TDownOperation;
        state: TState;
    }) => CustomResult<TState, string | TCustomError>;
}): CustomResult<StringKeyRecord<TState>, string | TCustomError> => {
    if (operation == null) {
        return Result.ok(nextState);
    }

    const result = DualKeyRecordOperation.applyBack({
        nextState: { [dummyKey]: nextState },
        operation: { [dummyKey]: operation },
        innerApplyBack: ({ key, ...params }) => innerApplyBack({ ...params, key: key.second }),
    });
    if (result.isError) {
        return result;
    }
    return Result.ok(result.value[dummyKey] ?? {});
};

// stateが必要ないため処理を高速化&簡略化できるが、その代わり戻り値のreplaceにおいて oldValue === undefined && newValue === undefined もしくは oldValue !== undefined && newValue !== undefinedになるケースがある。
export const composeDownOperation = <TState, TDownOperation, TCustomError = string>({
    first,
    second,
    innerApplyBack,
    innerCompose,
}: {
    first?: RecordDownOperation<TState, TDownOperation>;
    second?: RecordDownOperation<TState, TDownOperation>;
    innerApplyBack: (params: {
        key: string;
        operation: TDownOperation;
        state: TState;
    }) => CustomResult<TState, string | TCustomError>;
    innerCompose: (params: {
        key: string;
        first: TDownOperation;
        second: TDownOperation;
    }) => CustomResult<TDownOperation | undefined, string | TCustomError>;
}): CustomResult<
    RecordDownOperation<TState, TDownOperation> | undefined,
    string | TCustomError
> => {
    if (first == null) {
        return Result.ok(second);
    }
    if (second == null) {
        return Result.ok(first);
    }

    const result = DualKeyRecordOperation.composeDownOperation({
        first: { [dummyKey]: first },
        second: { [dummyKey]: second },
        innerApplyBack: ({ key, ...params }) => innerApplyBack({ ...params, key: key.second }),
        innerCompose: ({ key, ...params }) => innerCompose({ ...params, key: key.second }),
    });
    if (result.isError) {
        return result;
    }
    return Result.ok(result.value === undefined ? undefined : result.value[dummyKey]);
};

// Make sure these:
// - apply(prevState, first) = nextState
export const serverTransform = <
    TServerState,
    TClientState,
    TFirstOperation,
    TSecondOperation,
    TCustomError = string
>({
    first,
    second,
    prevState,
    nextState,
    innerTransform,
    toServerState,
    cancellationPolicy,
}: {
    prevState: StringKeyRecord<TServerState>;
    nextState: StringKeyRecord<TServerState>;
    first?: RecordUpOperation<TServerState, TFirstOperation>;
    second?: RecordUpOperation<TClientState, TSecondOperation>;
    toServerState: (state: TClientState, key: string) => TServerState;
    innerTransform: (
        params: ProtectedTransformParameters<TServerState, TFirstOperation, TSecondOperation> & {
            key: string;
        }
    ) => CustomResult<TFirstOperation | undefined, string | TCustomError>;
    cancellationPolicy: CancellationPolicy<string, TServerState>;
}): CustomResult<
    RecordTwoWayOperation<TServerState, TFirstOperation> | undefined,
    string | TCustomError
> => {
    const cancelCreate = cancellationPolicy.cancelCreate;
    const cancelUpdate = cancellationPolicy.cancelUpdate;
    const cancelRemove = cancellationPolicy.cancelRemove;

    const result = DualKeyRecordOperation.serverTransform({
        first: first === undefined ? undefined : { [dummyKey]: first },
        second: second === undefined ? undefined : { [dummyKey]: second },
        prevState: { [dummyKey]: prevState },
        nextState: { [dummyKey]: nextState },
        innerTransform: ({ key, ...params }) => innerTransform({ ...params, key: key.second }),
        toServerState: (state, key) => toServerState(state, key.second),
        cancellationPolicy: {
            cancelCreate:
                cancelCreate === undefined
                    ? undefined
                    : ({ key, ...params }) => cancelCreate({ ...params, key: key.second }),
            cancelUpdate:
                cancelUpdate === undefined
                    ? undefined
                    : ({ key, ...params }) => cancelUpdate({ ...params, key: key.second }),
            cancelRemove:
                cancelRemove === undefined
                    ? undefined
                    : ({ key, ...params }) => cancelRemove({ ...params, key: key.second }),
        },
    });

    if (result.isError) {
        return result;
    }

    return Result.ok(result.value === undefined ? undefined : result.value[dummyKey]);
};

type InnerClientTransform<TFirstOperation, TSecondOperation, TError = string> = (params: {
    first: TFirstOperation;
    second: TSecondOperation;
}) => CustomResult<
    {
        firstPrime: TFirstOperation | undefined;
        secondPrime: TSecondOperation | undefined;
    },
    TError
>;

export const clientTransform = <TState, TOperation, TError = string>({
    first,
    second,
    innerTransform,
    innerDiff,
}: {
    first?: RecordUpOperation<TState, TOperation>;
    second?: RecordUpOperation<TState, TOperation>;
    innerTransform: InnerClientTransform<TOperation, TOperation, TError>;
    innerDiff: (params: { prevState: TState; nextState: TState }) => TOperation | undefined;
}): CustomResult<
    {
        firstPrime: RecordUpOperation<TState, TOperation> | undefined;
        secondPrime: RecordUpOperation<TState, TOperation> | undefined;
    },
    TError
> => {
    const result = DualKeyRecordOperation.clientTransform({
        first: first == null ? undefined : { [dummyKey]: first },
        second: second == null ? undefined : { [dummyKey]: second },
        innerTransform: params => innerTransform(params),
        innerDiff: params => innerDiff(params),
    });
    if (result.isError) {
        return result;
    }
    return Result.ok({
        firstPrime: result.value.firstPrime == null ? undefined : result.value.firstPrime[dummyKey],
        secondPrime:
            result.value.secondPrime == null ? undefined : result.value.secondPrime[dummyKey],
    });
};

export const diff = <TState, TOperation>({
    prevState,
    nextState,
    innerDiff,
}: {
    prevState: StringKeyRecord<TState>;
    nextState: StringKeyRecord<TState>;
    innerDiff: (params: {
        key: string;
        prevState: TState;
        nextState: TState;
    }) => TOperation | undefined;
}) => {
    const dualKeyResult = DualKeyRecordOperation.diff({
        prevState: { [dummyKey]: prevState },
        nextState: { [dummyKey]: nextState },
        innerDiff: ({ key, ...params }) => innerDiff({ ...params, key: key.second }),
    });
    if (dualKeyResult == null) {
        return undefined;
    }
    return dualKeyResult[dummyKey];
};
