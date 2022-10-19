import { Result } from '@kizahasi/result';
import * as t from 'io-ts';
import { StringKeyRecord, record } from './record';
import {
    RecordDownOperationElement,
    RecordTwoWayOperationElement,
    RecordUpOperationElement,
    recordDownOperationElementFactory,
    recordUpOperationElementFactory,
    replace,
    update,
} from './recordOperationElement';
import * as DualKeyRecordOperation from './util/dualKeyRecordOperation';

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

export type ProtectedTransformParameters<TServerState, TFirstOperation, TSecondOperation> =
    DualKeyRecordOperation.ProtectedTransformParameters<
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

const fakeKey = 'FAKE-KEY';

// Make sure this:
// - apply(prevState, source) = nextState
export const toClientState = <TSourceState, TClientState>({
    serverState,
    isPrivate,
    toClientState,
}: {
    serverState: StringKeyRecord<TSourceState> | undefined;

    // 対象となるユーザーの視点で、全体がprivateとなるときはtrueを返す。一部がprivateである、もしくはprivateである部分がないときはfalseを返す。
    isPrivate: (state: TSourceState, key: string) => boolean;

    // 全体がprivateになるケースについて書く必要はない。
    toClientState: (params: { state: TSourceState; key: string }) => TClientState;
}) => {
    return (
        DualKeyRecordOperation.toClientState({
            serverState: { [fakeKey]: serverState ?? {} },
            isPrivate: (state, key) => isPrivate(state, key.second),
            toClientState: ({ state, key }) => toClientState({ state, key: key.second }),
        })[fakeKey] ?? {}
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
    }) => Result<RestoreResult<TState, TTwoWayOperation | undefined>, string | TCustomError>;
    innerDiff: (params: {
        key: string;
        prevState: TState;
        nextState: TState;
    }) => TTwoWayOperation | undefined;
}): Result<
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
        nextState: { [fakeKey]: nextState },
        downOperation: { [fakeKey]: downOperation },
        innerRestore: ({ key, ...params }) => innerRestore({ ...params, key: key.second }),
        innerDiff: ({ key, ...params }) => innerDiff({ ...params, key: key.second }),
    });
    if (result.isError) {
        return result;
    }
    return Result.ok({
        prevState: result.value.prevState[fakeKey] ?? {},
        twoWayOperation:
            result.value.twoWayOperation === undefined
                ? undefined
                : result.value.twoWayOperation[fakeKey],
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
    }) => Result<TState, string | TCustomError>;
}): Result<StringKeyRecord<TState>, string | TCustomError> => {
    if (operation == null) {
        return Result.ok(prevState);
    }

    const result = DualKeyRecordOperation.apply({
        prevState: { [fakeKey]: prevState },
        operation: { [fakeKey]: operation },
        innerApply: ({ key, ...params }) => innerApply({ ...params, key: key.second }),
    });
    if (result.isError) {
        return result;
    }
    return Result.ok(result.value[fakeKey] ?? {});
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
    }) => Result<TState, string | TCustomError>;
}): Result<StringKeyRecord<TState>, string | TCustomError> => {
    if (operation == null) {
        return Result.ok(nextState);
    }

    const result = DualKeyRecordOperation.applyBack({
        nextState: { [fakeKey]: nextState },
        operation: { [fakeKey]: operation },
        innerApplyBack: ({ key, ...params }) => innerApplyBack({ ...params, key: key.second }),
    });
    if (result.isError) {
        return result;
    }
    return Result.ok(result.value[fakeKey] ?? {});
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
    }) => Result<TState, string | TCustomError>;
    innerCompose: (params: {
        key: string;
        first: TDownOperation;
        second: TDownOperation;
    }) => Result<TDownOperation | undefined, string | TCustomError>;
}): Result<RecordDownOperation<TState, TDownOperation> | undefined, string | TCustomError> => {
    if (first == null) {
        return Result.ok(second);
    }
    if (second == null) {
        return Result.ok(first);
    }

    const result = DualKeyRecordOperation.composeDownOperation({
        first: { [fakeKey]: first },
        second: { [fakeKey]: second },
        innerApplyBack: ({ key, ...params }) => innerApplyBack({ ...params, key: key.second }),
        innerCompose: ({ key, ...params }) => innerCompose({ ...params, key: key.second }),
    });
    if (result.isError) {
        return result;
    }
    return Result.ok(result.value === undefined ? undefined : result.value[fakeKey]);
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
    prevState: StringKeyRecord<TServerState> | undefined;
    nextState: StringKeyRecord<TServerState> | undefined;
    first?: RecordUpOperation<TServerState, TFirstOperation>;
    second?: RecordUpOperation<TClientState, TSecondOperation>;
    toServerState: (state: TClientState, key: string) => TServerState;
    innerTransform: (
        params: ProtectedTransformParameters<TServerState, TFirstOperation, TSecondOperation> & {
            key: string;
        }
    ) => Result<TFirstOperation | undefined, string | TCustomError>;
    cancellationPolicy: CancellationPolicy<string, TServerState>;
}): Result<
    RecordTwoWayOperation<TServerState, TFirstOperation> | undefined,
    string | TCustomError
> => {
    const cancelCreate = cancellationPolicy.cancelCreate;
    const cancelUpdate = cancellationPolicy.cancelUpdate;
    const cancelRemove = cancellationPolicy.cancelRemove;

    const result = DualKeyRecordOperation.serverTransform({
        first: first === undefined ? undefined : { [fakeKey]: first },
        second: second === undefined ? undefined : { [fakeKey]: second },
        prevState: { [fakeKey]: prevState ?? {} },
        nextState: { [fakeKey]: nextState ?? {} },
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

    return Result.ok(result.value === undefined ? undefined : result.value[fakeKey]);
};

type InnerClientTransform<TFirstOperation, TSecondOperation, TError = string> = (params: {
    first: TFirstOperation;
    second: TSecondOperation;
}) => Result<
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
}): Result<
    {
        firstPrime: RecordUpOperation<TState, TOperation> | undefined;
        secondPrime: RecordUpOperation<TState, TOperation> | undefined;
    },
    TError
> => {
    const result = DualKeyRecordOperation.clientTransform({
        first: first == null ? undefined : { [fakeKey]: first },
        second: second == null ? undefined : { [fakeKey]: second },
        innerTransform: params => innerTransform(params),
        innerDiff: params => innerDiff(params),
    });
    if (result.isError) {
        return result;
    }
    return Result.ok({
        firstPrime: result.value.firstPrime == null ? undefined : result.value.firstPrime[fakeKey],
        secondPrime:
            result.value.secondPrime == null ? undefined : result.value.secondPrime[fakeKey],
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
        prevState: { [fakeKey]: prevState },
        nextState: { [fakeKey]: nextState },
        innerDiff: ({ key, ...params }) => innerDiff({ ...params, key: key.second }),
    });
    if (dualKeyResult == null) {
        return undefined;
    }
    return dualKeyResult[fakeKey];
};

const dummyKey = 'dummyKey';

export const mapRecordUpOperation = <TState1, TState2, TOperation1, TOperation2>({
    source,
    mapState,
    mapOperation,
}: {
    source: Record<string, RecordUpOperationElement<TState1, TOperation1> | undefined>;
    mapState: (state: TState1) => TState2;
    mapOperation: (state: TOperation1) => TOperation2;
}): Record<string, RecordUpOperationElement<TState2, TOperation2>> => {
    const result = DualKeyRecordOperation.mapDualKeyRecordUpOperation({
        source: { [dummyKey]: source },
        mapState,
        mapOperation,
    })[dummyKey];
    if (result == null) {
        throw new Error('this should not happen');
    }
    return result;
};

export const mapRecordDownOperation = <TState1, TState2, TOperation1, TOperation2>({
    source,
    mapState,
    mapOperation,
}: {
    source: Record<string, RecordDownOperationElement<TState1, TOperation1> | undefined>;
    mapState: (state: TState1) => TState2;
    mapOperation: (state: TOperation1) => TOperation2;
}): Record<string, RecordDownOperationElement<TState2, TOperation2>> => {
    const result = DualKeyRecordOperation.mapDualKeyRecordDownOperation({
        source: { [dummyKey]: source },
        mapState,
        mapOperation,
    })[dummyKey];
    if (result == null) {
        throw new Error('this should not happen');
    }
    return result;
};

export const mapRecordOperation = <TReplace1, TReplace2, TUpdate1, TUpdate2>({
    source,
    mapReplace,
    mapUpdate,
}: {
    source: Record<
        string,
        | { type: typeof replace; replace: TReplace1 }
        | { type: typeof update; update: TUpdate1 }
        | undefined
    >;
    mapReplace: (state: TReplace1) => TReplace2;
    mapUpdate: (operation: TUpdate1) => TUpdate2;
}): Record<
    string,
    { type: typeof replace; replace: TReplace2 } | { type: typeof update; update: TUpdate2 }
> => {
    const result = DualKeyRecordOperation.mapDualKeyRecordOperation({
        source: { [dummyKey]: source },
        mapReplace,
        mapUpdate,
    })[dummyKey];
    if (result == null) {
        throw new Error('this should not happen');
    }
    return result;
};
