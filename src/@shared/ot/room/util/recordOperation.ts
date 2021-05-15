import * as t from 'io-ts';
import * as DualKeyRecordOperation from './dualKeyRecordOperation';
import { CustomResult, ResultModule } from '../../../Result';
import { DualKeyRecord, recordDownOperationElementFactory, RecordDownOperationElement, RecordTwoWayOperationElement, recordUpOperationElementFactory, RecordUpOperationElement } from './recordOperationElement';
import { TransformerFactory } from './transformerFactory';

export type RecordDownOperation<TState, TOperation> = Record<string, RecordDownOperationElement<TState, TOperation>>;
export type RecordUpOperation<TState, TOperation> = Record<string, RecordUpOperationElement<TState, TOperation>>;
export type RecordTwoWayOperation<TState, TOperation> = Record<string, RecordTwoWayOperationElement<TState, TOperation>>;

export const stateFactory = <TKey extends t.Mixed, TState extends t.Mixed>(key: TKey, state: TState) => t.record(key, state);

export const downOperationFactory = <TKey extends t.Mixed, TState extends t.Mixed, TOperation extends t.Mixed>(key: TKey, state: TState, operation: TOperation) => t.record(key, recordDownOperationElementFactory(state, operation));

export const upOperationFactory = <TKey extends t.Mixed, TState extends t.Mixed, TOperation extends t.Mixed>(key: TKey, state: TState, operation: TOperation) => t.record(key, recordUpOperationElementFactory(state, operation));

export type ProtectedTransformParameters<TServerState, TFirstOperation, TSecondOperation> = DualKeyRecordOperation.ProtectedTransformParameters<TServerState, TFirstOperation, TSecondOperation>;

export type ProtectedValuePolicy<TKey, TServerState> = DualKeyRecordOperation.ProtectedValuePolicy<TKey, TServerState>;

type RestoreResult<TState, TTwoWayOperation> = { prevState: TState; twoWayOperation: TTwoWayOperation | undefined }

const dummyKey = '';

// Make sure this:
// - apply(prevState, source) = nextState
export const toClientState = <TSourceState, TClientState>({
    serverState,
    isPrivate,
    toClientState,
}: {
    serverState: Record<string, TSourceState>;

    // 対象となるユーザーの視点で、全体がprivateとなるときはtrueを返す。一部がprivateである、もしくはprivateである部分がないときはfalseを返す。
    isPrivate: (state: TSourceState, key: string) => boolean;

    // 全体がprivateになるケースについて書く必要はない。
    toClientState: (params: { state: TSourceState; key: string }) => TClientState;
}) => {
    return DualKeyRecordOperation.toClientState({
        serverState: { [dummyKey]: serverState },
        isPrivate: (state, key) => isPrivate(state, key.second),
        toClientState: ({ state, key }) => toClientState({ state, key: key.second }),
    })[dummyKey] ?? {};
};

export const toClientOperation = <TSourceState, TClientState, TSourceOperation, TClientOperation>({
    diff,
    isPrivate,
    prevState,
    nextState,
    toClientState,
    toClientOperation,
}: {
    diff: RecordTwoWayOperation<TSourceState, TSourceOperation>;

    // 対象となるユーザーの視点で、全体がprivateとなるときはtrueを返す。一部がprivateである、もしくはprivateである部分がないときはfalseを返す。
    isPrivate: (state: TSourceState, key: string) => boolean;

    prevState: Record<string, TSourceState>;
    nextState: Record<string, TSourceState>;

    // 全体がprivateになるケースについて書く必要はない。
    toClientState: (params: { prevState: TSourceState | undefined; nextState: TSourceState; key: string }) => TClientState;

    // 全体がprivateになるケースについて書く必要はない。
    toClientOperation: (params: { diff: TSourceOperation; key: string; prevState: TSourceState; nextState: TSourceState }) => TClientOperation | null | undefined;
}) => {
    return DualKeyRecordOperation.toClientOperation({
        diff: { [dummyKey]: diff },
        isPrivate: (state, key) => isPrivate(state, key.second),
        prevState: { [dummyKey]: prevState },
        nextState: { [dummyKey]: nextState },
        toClientState: ({ prevState, nextState, key }) => toClientState({ prevState, nextState, key: key.second }),
        toClientOperation: ({ diff, key, prevState, nextState }) => toClientOperation({ diff, key: key.second, prevState, nextState }),
    })[dummyKey] ?? {};
};

// downOperationは、composeDownOperationLooseによって作成されたものでも構わない。その代わり、innerDiffはdownでなくtwoWayである必要がある。
export const restore = <TState, TDownOperation, TTwoWayOperation, TCustomError = string>({
    nextState,
    downOperation,
    innerRestore,
    innerDiff
}: {
    nextState: Record<string, TState>;
    downOperation: RecordDownOperation<TState, TDownOperation>;
    innerRestore: (params: { key: string; downOperation: TDownOperation; nextState: TState }) => CustomResult<RestoreResult<TState, TTwoWayOperation | undefined>, string | TCustomError>;
    innerDiff: (params: { key: string; prevState: TState; nextState: TState }) => TTwoWayOperation | undefined;
}): CustomResult<RestoreResult<Record<string, TState>, RecordTwoWayOperation<TState, TTwoWayOperation>>, string | TCustomError> => {
    const result = DualKeyRecordOperation.restore({
        nextState: { [dummyKey]: nextState },
        downOperation: { [dummyKey]: downOperation },
        innerRestore: ({ key, ...params }) => innerRestore({ ...params, key: key.second }),
        innerDiff: ({ key, ...params }) => innerDiff({ ...params, key: key.second }),
    });
    if (result.isError) {
        return result;
    }
    return ResultModule.ok({
        prevState: result.value.prevState[dummyKey] ?? {},
        twoWayOperation: result.value.twoWayOperation === undefined ? undefined : result.value.twoWayOperation[dummyKey],
    });
};

export const apply = <TState, TOperation, TCustomError = string>({
    prevState,
    operation,
    innerApply
}: {
    prevState: Record<string, TState>;
    operation?: RecordUpOperation<TState, TOperation>;
    innerApply: (params: { key: string; operation: TOperation; prevState: TState }) => CustomResult<TState, string | TCustomError>;
}): CustomResult<Record<string, TState>, string | TCustomError> => {
    if (operation == null) {
        return ResultModule.ok(prevState);
    }

    const result = DualKeyRecordOperation.apply({
        prevState: { [dummyKey]: prevState },
        operation: { [dummyKey]: operation },
        innerApply: ({ key, ...params }) => innerApply({ ...params, key: key.second }),
    });
    if (result.isError) {
        return result;
    }
    return ResultModule.ok(result.value[dummyKey] ?? {});
};

export const applyBack = <TState, TDownOperation, TCustomError = string>({
    nextState,
    downOperation,
    innerApplyBack
}: {
    nextState: Record<string, TState>;
    downOperation?: Record<string, RecordDownOperationElement<TState, TDownOperation>>;
    innerApplyBack: (params: { key: string; downOperation: TDownOperation; nextState: TState }) => CustomResult<TState, string | TCustomError>;
}): CustomResult<Record<string, TState>, string | TCustomError> => {
    if (downOperation == null) {
        return ResultModule.ok(nextState);
    }

    const result = DualKeyRecordOperation.applyBack({
        nextState: { [dummyKey]: nextState },
        downOperation: { [dummyKey]: downOperation },
        innerApplyBack: ({ key, ...params }) => innerApplyBack({ ...params, key: key.second }),
    });
    if (result.isError) {
        return result;
    }
    return ResultModule.ok(result.value[dummyKey] ?? {});
};

// stateが必要ないため処理を高速化&簡略化できるが、その代わり戻り値のreplaceにおいて oldValue === undefined && newValue === undefined もしくは oldValue !== undefined && newValue !== undefinedになるケースがある。
export const composeDownOperationLoose = <TState, TDownOperation, TCustomError = string>({
    first,
    second,
    innerApplyBack,
    innerCompose
}: {
    first: RecordDownOperation<TState, TDownOperation>;
    second: RecordDownOperation<TState, TDownOperation>;
    innerApplyBack: (params: { key: string; downOperation: TDownOperation; nextState: TState }) => CustomResult<TState, string | TCustomError>;
    innerCompose: (params: { key: string; first: TDownOperation; second: TDownOperation }) => CustomResult<TDownOperation | undefined, string | TCustomError>;
}): CustomResult<RecordDownOperation<TState, TDownOperation> | undefined, string | TCustomError> => {
    const result = DualKeyRecordOperation.composeDownOperationLoose({
        first: { [dummyKey]: first },
        second: { [dummyKey]: second },
        innerApplyBack: ({ key, ...params }) => innerApplyBack({ ...params, key: key.second }),
        innerCompose: ({ key, ...params }) => innerCompose({ ...params, key: key.second }),
    });
    if (result.isError) {
        return result;
    }
    return ResultModule.ok(result.value === undefined ? undefined : result.value[dummyKey]);
};

// Make sure these:
// - apply(prevState, first) = nextState
export const transform = <TServerState, TClientState, TFirstOperation, TSecondOperation, TCustomError = string>({
    first,
    second,
    prevState,
    nextState,
    innerTransform,
    toServerState,
    protectedValuePolicy
}: {
    prevState: Record<string, TServerState>;
    nextState: Record<string, TServerState>;
    first?: RecordUpOperation<TServerState, TFirstOperation>;
    second?: RecordUpOperation<TClientState, TSecondOperation>;
    toServerState: (state: TClientState, key: string) => TServerState;
    innerTransform: (params: ProtectedTransformParameters<TServerState, TFirstOperation, TSecondOperation> & { key: string }) => CustomResult<TFirstOperation | undefined, string | TCustomError>;
    protectedValuePolicy: ProtectedValuePolicy<string, TServerState>;
}): CustomResult<RecordTwoWayOperation<TServerState, TFirstOperation> | undefined, string | TCustomError> => {
    if (second === undefined) {
        return ResultModule.ok(undefined);
    }

    const cancelCreate = protectedValuePolicy.cancelCreate;
    const cancelUpdate = protectedValuePolicy.cancelUpdate;
    const cancelRemove = protectedValuePolicy.cancelRemove;

    const result = DualKeyRecordOperation.transform({
        first: first === undefined ? undefined : { [dummyKey]: first },
        second: { [dummyKey]: second },
        prevState: { [dummyKey]: prevState },
        nextState: { [dummyKey]: nextState },
        innerTransform: ({ key, ...params }) => innerTransform({ ...params, key: key.second }),
        toServerState: (state, key) => toServerState(state, key.second),
        protectedValuePolicy: {
            cancelCreate: cancelCreate === undefined ? undefined : (({ key, ...params }) => cancelCreate({ ...params, key: key.second })),
            cancelUpdate: cancelUpdate === undefined ? undefined : (({ key, ...params }) => cancelUpdate({ ...params, key: key.second })),
            cancelRemove: cancelRemove === undefined ? undefined : (({ key, ...params }) => cancelRemove({ ...params, key: key.second })),
        },
    });

    if (result.isError) {
        return result;
    }

    return ResultModule.ok((result.value === undefined ? undefined : result.value[dummyKey]) ?? {});
};

export const diff = <TState, TOperation>({
    prev,
    next,
    innerDiff,
}: {
    prev: Record<string, TState>;
    next: Record<string, TState>;
    innerDiff: (params: { key: string; prev: TState; next: TState }) => TOperation | undefined;
}) => {
    return DualKeyRecordOperation.diff({
        prev: { [dummyKey]: prev },
        next: { [dummyKey]: next },
        innerDiff: ({ key, ...params }) => innerDiff({ ...params, key: key.second }),
    });
};

const dummyFirstKey = '';

const toDualKeyRecord = <T>(source: Record<string, T>): DualKeyRecord<T> => {
    return { [dummyFirstKey]: source };
};

const toRecord = <T>(source: DualKeyRecord<T>): Record<string, T> => {
    return source[dummyFirstKey] ?? {};
};

export class RecordTransformer<TServerState, TClientState, TDownOperation, TUpOperation, TTwoWayOperation, TCustomError = string> {
    private readonly core: DualKeyRecordOperation.DualKeyRecordTransformer<TServerState, TClientState, TDownOperation, TUpOperation, TTwoWayOperation, TCustomError>;

    public constructor(factory: TransformerFactory<string, TServerState, TClientState, TDownOperation, TUpOperation, TTwoWayOperation, TCustomError>) {
        const cancelRemove = factory.protectedValuePolicy.cancelRemove;
        this.core = new DualKeyRecordOperation.DualKeyRecordTransformer({
            composeLoose: params => factory.composeLoose({
                key: params.key.second,
                first: params.first,
                second: params.second,
            }),
            restore: params => factory.restore({
                key: params.key.second,
                nextState: params.nextState,
                downOperation: params.downOperation,
            }),
            transform: params => factory.transform({
                key: params.key.second,
                prevState: params.prevState,
                currentState: params.currentState,
                serverOperation: params.serverOperation,
                clientOperation: params.clientOperation,
            }),
            diff: params => factory.diff({
                key: params.key.second,
                prevState: params.prevState,
                nextState: params.nextState,
            }),
            applyBack: params => factory.applyBack({
                key: params.key.second,
                downOperation: params.downOperation,
                nextState: params.nextState,
            }),
            toServerState: params => factory.toServerState({
                key: params.key.second,
                clientState: params.clientState,
            }),
            protectedValuePolicy: cancelRemove === undefined ? {} : {
                cancelRemove: params => cancelRemove({ key: params.key.second, nextState: params.nextState })
            },
        });
    }

    public composeLoose({
        first,
        second,
    }: {
        first?: RecordDownOperation<TServerState, TDownOperation>;
        second?: RecordDownOperation<TServerState, TDownOperation>;
    }): CustomResult<RecordDownOperation<TServerState, TDownOperation> | undefined, string | TCustomError> {
        const dualKeyMap = this.core.composeLoose({
            first: first == null ? undefined : toDualKeyRecord(first),
            second: second == null ? undefined : toDualKeyRecord(second),
        });
        if (dualKeyMap.isError) {
            return dualKeyMap;
        }
        return ResultModule.ok(dualKeyMap.value === undefined ? undefined : toRecord(dualKeyMap.value));
    }

    public restore({
        downOperation,
        nextState,
    }: {
        downOperation?: RecordDownOperation<TServerState, TDownOperation>;
        nextState: Record<string, TServerState>;
    }) {
        const dualKeyMap = this.core.restore({
            downOperation: downOperation == null ? undefined : toDualKeyRecord(downOperation),
            nextState: toDualKeyRecord(nextState),
        });
        if (dualKeyMap.isError) {
            return dualKeyMap;
        }
        return ResultModule.ok({
            prevState: toRecord(dualKeyMap.value.prevState),
            twoWayOperation: dualKeyMap.value.twoWayOperation === undefined ? undefined : toRecord(dualKeyMap.value.twoWayOperation),
        });
    }

    public transform({
        prevState,
        currentState,
        serverOperation,
        clientOperation,
    }: {
        prevState: Record<string, TServerState>;
        currentState: Record<string, TServerState>;
        serverOperation?: RecordTwoWayOperation<TServerState, TTwoWayOperation>;
        clientOperation?: RecordUpOperation<TClientState, TUpOperation>;
    }): CustomResult<RecordTwoWayOperation<TServerState, TTwoWayOperation> | undefined, string | TCustomError> {
        const dualKeyMap = this.core.transform({
            prevState: toDualKeyRecord(prevState),
            currentState: toDualKeyRecord(currentState),
            serverOperation: serverOperation == null ? undefined : toDualKeyRecord(serverOperation),
            clientOperation: clientOperation == null ? undefined : toDualKeyRecord(clientOperation),
        });
        if (dualKeyMap.isError) {
            return dualKeyMap;
        }
        return ResultModule.ok(dualKeyMap.value === undefined ? undefined : toRecord(dualKeyMap.value));
    }

    public restoreAndTransform({
        currentState,
        serverOperation,
        clientOperation,
    }: {
        currentState: Record<string, TServerState>;
        serverOperation: RecordDownOperation<TServerState, TDownOperation>;
        clientOperation: RecordUpOperation<TClientState, TUpOperation>;
    }): CustomResult<RecordTwoWayOperation<TServerState, TTwoWayOperation> | undefined, string | TCustomError> {
        const dualKeyMap = this.core.restoreAndTransform({
            currentState: toDualKeyRecord(currentState),
            serverOperation: toDualKeyRecord(serverOperation),
            clientOperation: toDualKeyRecord(clientOperation),
        });
        if (dualKeyMap.isError) {
            return dualKeyMap;
        }
        return ResultModule.ok(dualKeyMap.value === undefined ? undefined : toRecord(dualKeyMap.value));
    }

    public diff({
        prevState,
        nextState,
    }: {
        prevState: Record<string, TServerState>;
        nextState: Record<string, TServerState>;
    }) {
        const dualKeyMap = this.core.diff({
            prevState: toDualKeyRecord(prevState),
            nextState: toDualKeyRecord(nextState),
        });
        return toRecord(dualKeyMap);
    }

    public applyBack({
        downOperation,
        nextState,
    }: {
        downOperation?: RecordDownOperation<TServerState, TDownOperation>;
        nextState: Record<string, TServerState>;
    }) {
        if (downOperation == null) {
            return ResultModule.ok(nextState);
        }
        const dualKeyMap = this.core.applyBack({
            downOperation: toDualKeyRecord(downOperation),
            nextState: toDualKeyRecord(nextState),
        });
        if (dualKeyMap.isError) {
            return dualKeyMap;
        }
        return ResultModule.ok(toRecord(dualKeyMap.value));
    }

    public toServerState({
        clientState,
    }: {
        clientState: Record<string, TClientState>;
    }): Record<string, TServerState> {
        const dualKeyMap = this.core.toServerState({
            clientState: toDualKeyRecord(clientState),
        });
        return toRecord(dualKeyMap);
    }
}