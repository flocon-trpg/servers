
import { groupJoin } from '../../../Map';
import { CustomResult, ResultModule } from '../../../Result';
import { both, left, right } from '../../../Types';
import { recordCompact, recordForEach, recordToMap } from '../../../utils';
import * as DualKeyRecordOperation from './dualKeyRecordOperation';
import { ParamRecordTransformerFactory } from './transformerFactory';
import * as ReplaceValueOperation from './replaceOperation';
import { isIdRecord } from './record';

type RestoreResult<TState, TTwoWayOperation> = { prevState: TState; twoWayOperation: TTwoWayOperation | undefined }
export type ProtectedTransformParameters<TServerState, TFirstOperation, TSecondOperation> = DualKeyRecordOperation.ProtectedTransformParameters<TServerState, TFirstOperation, TSecondOperation>

// isPrivateがあるとremoveが必要になるため、isPrivateを実装することは不可能。
export const toClientOperation = <TSourceState, TSourceOperation, TClientOperation>({
    diff,
    prevState,
    nextState,
    toClientOperation,
}: {
    diff: Record<string, TSourceOperation>;
    prevState: Record<string, TSourceState>;
    nextState: Record<string, TSourceState>;
    toClientOperation: (params: { diff: TSourceOperation; key: string; prevState: TSourceState; nextState: TSourceState }) => TClientOperation | null | undefined;
}) => {
    const result: Record<string, TClientOperation> = {};
    recordForEach(diff, (value, key) => {
        const prevStateElement = prevState[key];
        if (prevStateElement === undefined) {
            throw `tried to operate "${key}", but not found in prevState.`;
        }
        const nextStateElement = nextState[key];
        if (nextStateElement === undefined) {
            throw `tried to operate "${key}", but not found in nextState.`;
        }

        const operation = toClientOperation({ diff: value, key, prevState: prevStateElement, nextState: nextStateElement });
        if (operation != null) {
            result[key] = operation;
        }
    });
    return result;
};

export const restore = <TState, TDownOperation, TTwoWayOperation, TCustomError = string>({
    nextState,
    downOperation,
    innerRestore,
}: {
    nextState: Record<string, TState>;
    downOperation?: Record<string, TDownOperation>;
    innerRestore: (params: { downOperation: TDownOperation; nextState: TState; key: string }) => CustomResult<RestoreResult<TState, TTwoWayOperation> | undefined, string | TCustomError>;
}): CustomResult<RestoreResult<Record<string, TState>, Record<string, TTwoWayOperation>>, string | TCustomError> => {
    if (downOperation == null) {
        return ResultModule.ok({
            prevState: nextState,
            twoWayOperation: undefined,
        });
    }

    const prevState = { ...nextState };
    const twoWayOperation: Record<string, TTwoWayOperation> = {};

    for (const [key, value] of recordToMap(downOperation)) {
        const nextStateElement = nextState[key];
        if (nextStateElement === undefined) {
            return ResultModule.error(`tried to update "${key}", but nextState does not have such a key`);
        }
        const restored = innerRestore({ downOperation: value, nextState: nextStateElement, key });
        if (restored.isError) {
            return restored;
        }
        if (restored.value === undefined) {
            continue;
        }
        prevState[key] = restored.value.prevState;
        if (restored.value.twoWayOperation !== undefined) {
            twoWayOperation[key] = restored.value.twoWayOperation;
        }
        break;
    }

    return ResultModule.ok({ prevState, twoWayOperation });
};

export const apply = <TState, TUpOperation, TCustomError = string>({ prevState, operation, innerApply }: {
    prevState: Record<string, TState>;
    operation?: Record<string, TUpOperation>;
    innerApply: (params: { upOperation: TUpOperation; prevState: TState; key: string }) => CustomResult<TState, string | TCustomError>;
}): CustomResult<Record<string, TState>, string | TCustomError> => {
    if (operation == null) {
        return ResultModule.ok(prevState);
    }

    const nextState = { ...prevState };

    for (const [key, value] of recordToMap(operation)) {
        const prevStateElement = prevState[key];
        if (prevStateElement === undefined) {
            return ResultModule.error(`tried to update "${key}", but prevState does not have such a key`);
        }
        const newValue = innerApply({ upOperation: value, prevState: prevStateElement, key });
        if (newValue.isError) {
            return newValue;
        }
        nextState[key] = newValue.value;
        break;
    }

    return ResultModule.ok(nextState);
};

export const applyBack = <TState, TDownOperation, TCustomError = string>({ nextState, downOperation, innerApplyBack }: {
    nextState: Record<string, TState>;
    downOperation?: Record<string, TDownOperation>;
    innerApplyBack: (params: { downOperation: TDownOperation; nextState: TState; key: string }) => CustomResult<TState, string | TCustomError>;
}): CustomResult<Record<string, TState>, string | TCustomError> => {
    if (downOperation == null) {
        return ResultModule.ok(nextState);
    }

    const prevState = { ...nextState };

    for (const [key, value] of recordToMap(downOperation)) {
        const nextStateElement = nextState[key];
        if (nextStateElement === undefined) {
            return ResultModule.error(`tried to update "${key}", but nextState does not have such a key`);
        }
        const oldValue = innerApplyBack({ downOperation: value, nextState: nextStateElement, key });
        if (oldValue.isError) {
            return oldValue;
        }
        prevState[key] = oldValue.value;
        break;
    }

    return ResultModule.ok(prevState);
};

export const composeDownOperation = <TDownOperation, TCustomError = string>({
    first,
    second,
    innerCompose
}: {
    first?: Record<string, TDownOperation>;
    second?: Record<string, TDownOperation>;
    innerCompose: (params: { key: string; first: TDownOperation; second: TDownOperation }) => CustomResult<TDownOperation | undefined, string | TCustomError>;
}): CustomResult<Record<string, TDownOperation> | undefined, string | TCustomError> => {
    if (first == null) {
        return ResultModule.ok(second);
    }
    if (second == null) {
        return ResultModule.ok(first);
    }

    const result: Record<string, TDownOperation> = {};

    for (const [key, groupJoined] of groupJoin(recordToMap(first), recordToMap(second))) {
        switch (groupJoined.type) {
            case left:
                result[key] = groupJoined.left;
                continue;
            case right:
                result[key] = groupJoined.right;
                continue;
            case both: {
                const update = innerCompose({ first: groupJoined.left, second: groupJoined.right, key });
                if (update.isError) {
                    return update;
                }
                if (update.value !== undefined) {
                    result[key] = update.value;
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
export const transform = <TServerState, TFirstOperation, TSecondOperation, TCustomError = string>({
    first,
    second,
    prevState,
    nextState,
    innerTransform,
}: {
    prevState: Record<string, TServerState>;
    nextState: Record<string, TServerState>;
    first?: Record<string, TFirstOperation>;
    second?: Record<string, TSecondOperation>;
    innerTransform: (params: ProtectedTransformParameters<TServerState | undefined, TFirstOperation, TSecondOperation> & { key: string }) => CustomResult<TFirstOperation | undefined, string | TCustomError>;
}): CustomResult<Record<string, TFirstOperation> | undefined, string | TCustomError> => {
    if (second === undefined) {
        return ResultModule.ok(undefined);
    }

    const result: Record<string, TFirstOperation> = {};

    for (const [key, operation] of recordToMap(second)) {
        const innerPrevState = prevState[key];
        const innerNextState = nextState[key];
        const innerFirst = first == null ? undefined : first[key];

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
            result[key] = transformedUpdate;
        }
    }
    return ResultModule.ok(result);
};

export const diff = <TState, TOperation>({
    prev,
    next,
    innerDiff,
}: {
    prev: Record<string, TState>;
    next: Record<string, TState>;
    innerDiff: (params: { prev: TState | undefined; next: TState | undefined; key: string }) => TOperation | undefined;
}): Record<string, TOperation> => {
    const result: Record<string, TOperation> = {};
    for (const [key, value] of groupJoin(recordToMap(prev), recordToMap(next))) {
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
        result[key] = diffResult;
        continue;
    }
    return result;
};

type ParamState<T> = {
    $version: 1;

    isValuePrivate: boolean;
    value: T;
}

type ParamDownOperation<T> = {
    $version: 1;

    isValuePrivate?: { oldValue: boolean };
    value?: { oldValue: T };
}

type ParamUpOperation<T> = {
    $version: 1;

    isValuePrivate?: { newValue: boolean };
    value?: { newValue: T };
}

type ParamTwoWayOperation<T> = {
    $version: 1;

    isValuePrivate?: { oldValue: boolean; newValue: boolean };
    value?: { oldValue: T; newValue: T };
}

export const createParamTransformerFactory = <T>(createdByMe: boolean): ParamRecordTransformerFactory<string, ParamState<T | undefined>, ParamState<T | undefined>, ParamDownOperation<T | undefined>, ParamUpOperation<T | undefined>, ParamTwoWayOperation<T | undefined>> => ({
    composeLoose: ({ first, second }) => {
        const valueProps: ParamDownOperation<T | undefined> = {
            $version: 1,
            isValuePrivate: ReplaceValueOperation.composeDownOperation(first.isValuePrivate, second.isValuePrivate),
            value: ReplaceValueOperation.composeDownOperation(first.value, second.value),
        };
        return ResultModule.ok(valueProps);
    },
    restore: ({ nextState, downOperation }) => {
        if (downOperation === undefined) {
            return ResultModule.ok({ prevState: nextState, nextState, twoWayOperation: undefined });
        }

        const prevState: ParamState<T | undefined> = { ...nextState };
        const twoWayOperation: ParamTwoWayOperation<T | undefined> = { $version: 1 };

        if (downOperation.isValuePrivate !== undefined) {
            prevState.isValuePrivate = downOperation.isValuePrivate.oldValue;
            twoWayOperation.isValuePrivate = { ...downOperation.isValuePrivate, newValue: nextState.isValuePrivate };
        }
        if (downOperation.value !== undefined) {
            prevState.value = downOperation.value.oldValue ?? undefined;
            twoWayOperation.value = { oldValue: downOperation.value.oldValue ?? undefined, newValue: nextState.value };
        }

        return ResultModule.ok({ prevState, nextState, twoWayOperation });
    },
    transform: ({ prevState, currentState, clientOperation, serverOperation }) => {
        const twoWayOperation: ParamTwoWayOperation<T | undefined> = { $version: 1 };

        if (createdByMe) {
            twoWayOperation.isValuePrivate = ReplaceValueOperation.transform({
                first: serverOperation?.isValuePrivate,
                second: clientOperation.isValuePrivate,
                prevState: prevState.isValuePrivate,
            });
        }
        if (createdByMe || !currentState.isValuePrivate) {
            twoWayOperation.value = ReplaceValueOperation.transform({
                first: serverOperation?.value,
                second: clientOperation.value,
                prevState: prevState.value,
            });
        }

        if (isIdRecord(twoWayOperation)) {
            return ResultModule.ok(undefined);
        }

        return ResultModule.ok({ ...twoWayOperation });
    },
    diff: ({ prevState, nextState }) => {
        const resultType: ParamTwoWayOperation<T | undefined> = { $version: 1 };
        if (prevState.isValuePrivate !== nextState.isValuePrivate) {
            resultType.isValuePrivate = { oldValue: prevState.isValuePrivate, newValue: nextState.isValuePrivate };
        }
        if (prevState.value !== nextState.value) {
            resultType.value = { oldValue: prevState.value, newValue: nextState.value };
        }
        if (isIdRecord(resultType)) {
            return undefined;
        }
        return { ...resultType };
    },
    applyBack: ({ downOperation, nextState }) => {
        const result = { ...nextState };

        if (downOperation.isValuePrivate !== undefined) {
            result.isValuePrivate = downOperation.isValuePrivate.oldValue;
        }
        if (downOperation.value !== undefined) {
            result.value = downOperation.value.oldValue ?? undefined;
        }

        return ResultModule.ok(result);
    },
    toServerState: ({ clientState }) => clientState,
    createDefaultState: () => ({ $version: 1, isValuePrivate: false, value: undefined }),
});

export class ParamRecordTransformer<TServerState, TClientState, TDownOperation, TUpOperation, TTwoWayOperation, TCustomError = string> {
    public constructor(private readonly factory: ParamRecordTransformerFactory<string, TServerState, TClientState, TDownOperation, TUpOperation, TTwoWayOperation, TCustomError>) { }

    public composeLoose(params: { first?: Record<string, TDownOperation>; second?: Record<string, TDownOperation> }): CustomResult<Record<string, TDownOperation> | undefined, string | TCustomError> {
        return composeDownOperation({
            ...params,
            innerCompose: params => this.factory.composeLoose(params),
        });
    }

    public restore({
        downOperation,
        nextState,
    }: {
        downOperation?: Record<string, TDownOperation>;
        nextState: Record<string, TServerState>;
    }): CustomResult<{ prevState: Record<string, TServerState>; twoWayOperation: Record<string, TTwoWayOperation> | undefined }, string | TCustomError> {
        return restore({
            nextState,
            downOperation,
            innerRestore: params => {
                const result = this.factory.restore(params);
                if (result.isError) {
                    return result;
                }
                if (result.value.twoWayOperation === undefined) {
                    return ResultModule.ok(undefined);
                }
                return ResultModule.ok({
                    prevState: result.value.prevState,
                    twoWayOperation: result.value.twoWayOperation,
                });
            },
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
        serverOperation?: Record<string, TTwoWayOperation>;
        clientOperation?: Record<string, TUpOperation>;
    }): CustomResult<Record<string, TTwoWayOperation> | undefined, string | TCustomError> {
        return transform({
            first: serverOperation,
            second: clientOperation,
            prevState: prevState,
            nextState: currentState,
            innerTransform: params => this.factory.transform({
                key: params.key,
                prevState: params.prevState ?? this.factory.createDefaultState({ key: params.key }),
                currentState: params.nextState ?? this.factory.createDefaultState({ key: params.key }),
                serverOperation: params.first,
                clientOperation: params.second,
            }),
        });
    }

    public restoreAndTransform({
        currentState,
        serverOperation,
        clientOperation,
    }: {
        currentState: Record<string, TServerState>;
        serverOperation?: Record<string, TDownOperation>;
        clientOperation?: Record<string, TUpOperation>;
    }): CustomResult<Record<string, TTwoWayOperation> | undefined, string | TCustomError> {
        const restoreResult = this.restore({
            nextState: currentState,
            downOperation: serverOperation,
        });
        if (restoreResult.isError) {
            return restoreResult;
        }

        return this.transform({
            serverOperation: restoreResult.value.twoWayOperation,
            clientOperation,
            prevState: restoreResult.value.prevState,
            currentState,
        });
    }

    public diff({
        prevState,
        nextState,
    }: {
        prevState: Record<string, TServerState>;
        nextState: Record<string, TServerState>;
    }) {
        return diff({
            prev: prevState,
            next: nextState,
            innerDiff: ({ prev, next, key }) => this.factory.diff({
                prevState: prev ?? this.factory.createDefaultState({ key }),
                nextState: next ?? this.factory.createDefaultState({ key }),
                key,
            }),
        });
    }

    public applyBack({
        downOperation,
        nextState,
    }: {
        downOperation?: Record<string, TDownOperation>;
        nextState: Record<string, TServerState>;
    }) {
        return applyBack({
            nextState,
            downOperation,
            innerApplyBack: params => this.factory.applyBack(params),
        });
    }

    public toServerState({
        clientState,
    }: {
        clientState: Record<string, TClientState>;
    }): Record<string, TServerState> {
        return recordCompact(clientState, (value, key) => {
            return this.factory.toServerState({ key, clientState: value });
        });
    }
}