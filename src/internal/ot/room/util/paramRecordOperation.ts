import { CustomResult, Result } from '@kizahasi/result';
import {
    both,
    groupJoinMap,
    left,
    mapToRecord,
    recordForEach,
    recordToMap,
    right,
} from '@kizahasi/util';
import * as DualKeyRecordOperation from './dualKeyRecordOperation';

type RestoreResult<TState, TTwoWayOperation> = {
    prevState: TState;
    twoWayOperation: TTwoWayOperation | undefined;
};
export type ProtectedTransformParameters<
    TServerState,
    TFirstOperation,
    TSecondOperation
> = DualKeyRecordOperation.ProtectedTransformParameters<
    TServerState,
    TFirstOperation,
    TSecondOperation
>;

// isPrivateがあるとremoveが必要になるため、isPrivateを実装することは不可能。
export const toClientOperation = <TSourceState, TSourceOperation, TClientOperation>({
    diff,
    prevState,
    nextState,
    toClientOperation,
    defaultState,
}: {
    diff: Record<string, TSourceOperation>;
    prevState: Record<string, TSourceState>;
    nextState: Record<string, TSourceState>;
    toClientOperation: (params: {
        diff: TSourceOperation;
        key: string;
        prevState: TSourceState;
        nextState: TSourceState;
    }) => TClientOperation | null | undefined;
    defaultState: TSourceState;
}) => {
    const result: Record<string, TClientOperation> = {};
    recordForEach(diff, (value, key) => {
        const prevStateElement = prevState[key] ?? defaultState;
        const nextStateElement = nextState[key] ?? defaultState;

        const operation = toClientOperation({
            diff: value,
            key,
            prevState: prevStateElement,
            nextState: nextStateElement,
        });
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
    innerRestore: (params: {
        downOperation: TDownOperation;
        nextState: TState;
        key: string;
    }) => CustomResult<RestoreResult<TState, TTwoWayOperation> | undefined, string | TCustomError>;
}): CustomResult<
    RestoreResult<Record<string, TState>, Record<string, TTwoWayOperation>>,
    string | TCustomError
> => {
    if (downOperation == null) {
        return Result.ok({
            prevState: nextState,
            twoWayOperation: undefined,
        });
    }

    const prevState = { ...nextState };
    const twoWayOperation: Record<string, TTwoWayOperation> = {};

    for (const [key, value] of recordToMap(downOperation)) {
        const nextStateElement = nextState[key];
        if (nextStateElement === undefined) {
            return Result.error(`tried to update "${key}", but nextState does not have such a key`);
        }
        const restored = innerRestore({
            downOperation: value,
            nextState: nextStateElement,
            key,
        });
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

    return Result.ok({ prevState, twoWayOperation });
};

export const apply = <TState, TUpOperation, TCustomError = string>({
    prevState,
    operation,
    innerApply,
    defaultState,
}: {
    prevState: Record<string, TState>;
    operation?: Record<string, TUpOperation>;
    innerApply: (params: {
        operation: TUpOperation;
        prevState: TState;
        key: string;
    }) => CustomResult<TState, string | TCustomError>;
    defaultState: TState;
}): CustomResult<Record<string, TState>, string | TCustomError> => {
    if (operation == null) {
        return Result.ok(prevState);
    }

    const nextState = { ...prevState };

    for (const [key, value] of recordToMap(operation)) {
        const prevStateElement = prevState[key] ?? defaultState;
        const newValue = innerApply({
            operation: value,
            prevState: prevStateElement,
            key,
        });
        if (newValue.isError) {
            return newValue;
        }
        nextState[key] = newValue.value;
        break;
    }

    return Result.ok(nextState);
};

export const applyBack = <TState, TDownOperation, TCustomError = string>({
    nextState,
    operation,
    innerApplyBack,
    defaultState,
}: {
    nextState: Record<string, TState>;
    operation?: Record<string, TDownOperation>;
    innerApplyBack: (params: {
        operation: TDownOperation;
        nextState: TState;
        key: string;
    }) => CustomResult<TState, string | TCustomError>;
    defaultState: TState;
}): CustomResult<Record<string, TState>, string | TCustomError> => {
    if (operation == null) {
        return Result.ok(nextState);
    }

    const prevState = { ...nextState };

    for (const [key, value] of recordToMap(operation)) {
        const nextStateElement = nextState[key] ?? defaultState;
        const oldValue = innerApplyBack({
            operation: value,
            nextState: nextStateElement,
            key,
        });
        if (oldValue.isError) {
            return oldValue;
        }
        prevState[key] = oldValue.value;
        break;
    }

    return Result.ok(prevState);
};

export const compose = <TOperation, TCustomError = string>({
    first,
    second,
    innerCompose,
}: {
    first?: Record<string, TOperation>;
    second?: Record<string, TOperation>;
    innerCompose: (params: {
        key: string;
        first: TOperation;
        second: TOperation;
    }) => CustomResult<TOperation | undefined, string | TCustomError>;
}): CustomResult<Record<string, TOperation> | undefined, string | TCustomError> => {
    if (first == null) {
        return Result.ok(second);
    }
    if (second == null) {
        return Result.ok(first);
    }

    const result: Record<string, TOperation> = {};

    for (const [key, groupJoined] of groupJoinMap(recordToMap(first), recordToMap(second))) {
        switch (groupJoined.type) {
            case left:
                result[key] = groupJoined.left;
                continue;
            case right:
                result[key] = groupJoined.right;
                continue;
            case both: {
                const update = innerCompose({
                    first: groupJoined.left,
                    second: groupJoined.right,
                    key,
                });
                if (update.isError) {
                    return update;
                }
                if (update.value !== undefined) {
                    result[key] = update.value;
                }
                continue;
            }
        }
    }
    return Result.ok(result);
};

// Make sure these:
// - apply(prevState, first) = nextState
export const serverTransform = <
    TServerState,
    TFirstOperation,
    TSecondOperation,
    TCustomError = string
>({
    first,
    second,
    prevState,
    nextState,
    innerTransform,
    defaultState,
}: {
    prevState: Record<string, TServerState>;
    nextState: Record<string, TServerState>;
    first?: Record<string, TFirstOperation>;
    second?: Record<string, TSecondOperation>;
    innerTransform: (
        params: ProtectedTransformParameters<TServerState, TFirstOperation, TSecondOperation> & {
            key: string;
        }
    ) => CustomResult<TFirstOperation | undefined, string | TCustomError>;
    defaultState: TServerState;
}): CustomResult<Record<string, TFirstOperation> | undefined, string | TCustomError> => {
    if (second === undefined) {
        return Result.ok(undefined);
    }

    const result: Record<string, TFirstOperation> = {};

    for (const [key, operation] of recordToMap(second)) {
        const innerPrevState = prevState[key] ?? defaultState;
        const innerNextState = nextState[key] ?? defaultState;
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
    return Result.ok(result);
};

type InnerClientTransform<TOperation, TError = string> = (params: {
    first: TOperation;
    second: TOperation;
}) => CustomResult<
    { firstPrime: TOperation | undefined; secondPrime: TOperation | undefined },
    TError
>;

export const clientTransform = <TOperation, TError = string>({
    first,
    second,
    innerTransform,
}: {
    first?: Record<string, TOperation>;
    second?: Record<string, TOperation>;
    innerTransform: InnerClientTransform<TOperation, TError>;
}): CustomResult<
    {
        firstPrime: Record<string, TOperation> | undefined;
        secondPrime: Record<string, TOperation> | undefined;
    },
    TError
> => {
    if (first === undefined || second === undefined) {
        return Result.ok({
            firstPrime: first,
            secondPrime: second,
        });
    }

    const firstPrime = new Map<string, TOperation>();
    const secondPrime = new Map<string, TOperation>();
    let error = undefined as { error: TError } | undefined;

    groupJoinMap(recordToMap(first), recordToMap(second)).forEach((group, key) => {
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
                const xform = innerTransform({
                    first: group.left,
                    second: group.right,
                });
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
        return Result.error(error.error);
    }
    return Result.ok({
        firstPrime: firstPrime.size === 0 ? undefined : mapToRecord(firstPrime),
        secondPrime: secondPrime.size === 0 ? undefined : mapToRecord(secondPrime),
    });
};

export const diff = <TState, TOperation>({
    prevState,
    nextState,
    innerDiff,
}: {
    prevState: Record<string, TState>;
    nextState: Record<string, TState>;
    innerDiff: (params: {
        prevState: TState | undefined;
        nextState: TState | undefined;
        key: string;
    }) => TOperation | undefined;
}): Record<string, TOperation> => {
    const result: Record<string, TOperation> = {};
    for (const [key, value] of groupJoinMap(recordToMap(prevState), recordToMap(nextState))) {
        let prevState: TState | undefined = undefined;
        let nextState: TState | undefined = undefined;

        switch (value.type) {
            case left:
                prevState = value.left;
                break;
            case right: {
                nextState = value.right;
                break;
            }
            case both: {
                prevState = value.left;
                nextState = value.right;
                break;
            }
        }
        const diffResult = innerDiff({ prevState, nextState, key });
        if (diffResult === undefined) {
            continue;
        }
        result[key] = diffResult;
        continue;
    }
    return result;
};
