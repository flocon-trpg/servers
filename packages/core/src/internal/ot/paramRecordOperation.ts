import { both, groupJoinMap, left, mapToRecord, recordToMap, right } from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import { StringKeyRecord } from './record';
import * as RecordOperation from './recordOperation';
import { isValidKey } from './util/isValidKey';

type RestoreResult<TState, TTwoWayOperation> = {
    prevState: TState;
    twoWayOperation: TTwoWayOperation | undefined;
};
export type ProtectedTransformParameters<TServerState, TFirstOperation, TSecondOperation> =
    RecordOperation.ProtectedTransformParameters<TServerState, TFirstOperation, TSecondOperation>;

export const restore = <TState, TDownOperation, TTwoWayOperation, TCustomError = string>({
    nextState: unsafeNextState,
    downOperation: unsafeDownOperation,
    innerRestore,
}: {
    nextState: StringKeyRecord<TState>;
    downOperation?: StringKeyRecord<TDownOperation>;
    innerRestore: (params: {
        downOperation: TDownOperation;
        nextState: TState;
        key: string;
    }) => Result<RestoreResult<TState, TTwoWayOperation> | undefined, string | TCustomError>;
}): Result<
    RestoreResult<StringKeyRecord<TState>, StringKeyRecord<TTwoWayOperation>>,
    string | TCustomError
> => {
    const nextState = recordToMap(unsafeNextState);

    if (unsafeDownOperation == null) {
        return Result.ok({
            prevState: mapToRecord(nextState),
            twoWayOperation: undefined,
        });
    }

    const prevState = new Map(nextState);
    const twoWayOperation = new Map<string, TTwoWayOperation>();

    for (const [key, value] of recordToMap(unsafeDownOperation)) {
        const nextStateElement = nextState.get(key);
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
        prevState.set(key, restored.value.prevState);
        if (restored.value.twoWayOperation !== undefined) {
            twoWayOperation.set(key, restored.value.twoWayOperation);
        }
    }

    return Result.ok({
        prevState: mapToRecord(prevState),
        twoWayOperation: mapToRecord(twoWayOperation),
    });
};

export const apply = <TState, TUpOperation, TCustomError = string>({
    prevState: unsafePrevState,
    operation,
    innerApply,
    defaultState,
}: {
    prevState: StringKeyRecord<TState>;
    operation?: StringKeyRecord<TUpOperation>;
    innerApply: (params: {
        operation: TUpOperation;
        prevState: TState;
        key: string;
    }) => Result<TState, string | TCustomError>;
    defaultState: TState;
}): Result<StringKeyRecord<TState>, string | TCustomError> => {
    if (operation == null) {
        return Result.ok(unsafePrevState);
    }

    const prevState = recordToMap(unsafePrevState);
    const nextState = new Map(prevState);

    for (const [key, value] of recordToMap(operation)) {
        const prevStateElement = prevState.get(key) ?? defaultState;
        const newValue = innerApply({
            operation: value,
            prevState: prevStateElement,
            key,
        });
        if (newValue.isError) {
            return newValue;
        }
        nextState.set(key, newValue.value);
    }

    return Result.ok(mapToRecord(nextState));
};

export const applyBack = <TState, TDownOperation, TCustomError = string>({
    nextState: unsafeNextState,
    operation,
    innerApplyBack,
    defaultState,
}: {
    nextState: StringKeyRecord<TState>;
    operation?: StringKeyRecord<TDownOperation>;
    innerApplyBack: (params: {
        operation: TDownOperation;
        nextState: TState;
        key: string;
    }) => Result<TState, string | TCustomError>;
    defaultState: TState;
}): Result<StringKeyRecord<TState>, string | TCustomError> => {
    if (operation == null) {
        return Result.ok(unsafeNextState);
    }

    const nextState = recordToMap(unsafeNextState);
    const prevState = new Map(nextState);

    for (const [key, value] of recordToMap(operation)) {
        const nextStateElement = nextState.get(key) ?? defaultState;
        const oldValue = innerApplyBack({
            operation: value,
            nextState: nextStateElement,
            key,
        });
        if (oldValue.isError) {
            return oldValue;
        }
        prevState.set(key, oldValue.value);
    }

    return Result.ok(mapToRecord(prevState));
};

export const compose = <TOperation, TCustomError = string>({
    first,
    second,
    innerCompose,
}: {
    first?: StringKeyRecord<TOperation>;
    second?: StringKeyRecord<TOperation>;
    innerCompose: (params: {
        key: string;
        first: TOperation;
        second: TOperation;
    }) => Result<TOperation | undefined, string | TCustomError>;
}): Result<StringKeyRecord<TOperation> | undefined, string | TCustomError> => {
    if (first == null) {
        return Result.ok(second);
    }
    if (second == null) {
        return Result.ok(first);
    }

    const result = new Map<string, TOperation>();

    for (const [key, groupJoined] of groupJoinMap(recordToMap(first), recordToMap(second))) {
        switch (groupJoined.type) {
            case left:
                result.set(key, groupJoined.left);
                continue;
            case right:
                result.set(key, groupJoined.right);
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
                    result.set(key, update.value);
                }
                continue;
            }
        }
    }
    return Result.ok(mapToRecord(result));
};

/** Make sure `apply(stateBeforeFirst, first) = stateAfterFirst` */
export const serverTransform = <
    TServerState,
    TFirstOperation,
    TSecondOperation,
    TCustomError = string
>({
    first: unsafeFirst,
    second: unsafeSecond,
    stateBeforeFirst: unsafeStateBeforeFirst,
    stateAfterFirst: unsafeStateAfterFirst,
    innerTransform,
    defaultState,
}: {
    stateBeforeFirst: StringKeyRecord<TServerState>;
    stateAfterFirst: StringKeyRecord<TServerState>;
    first?: StringKeyRecord<TFirstOperation>;
    second?: StringKeyRecord<TSecondOperation>;
    innerTransform: (
        params: ProtectedTransformParameters<TServerState, TFirstOperation, TSecondOperation> & {
            key: string;
        }
    ) => Result<TFirstOperation | undefined, string | TCustomError>;
    defaultState: TServerState;
}): Result<StringKeyRecord<TFirstOperation> | undefined, string | TCustomError> => {
    if (unsafeSecond === undefined) {
        return Result.ok(undefined);
    }

    const result = new Map<string, TFirstOperation>();
    const prevState = recordToMap(unsafeStateBeforeFirst);
    const nextState = recordToMap(unsafeStateAfterFirst);
    const first = unsafeFirst == null ? undefined : recordToMap(unsafeFirst);

    for (const [key, operation] of recordToMap(unsafeSecond)) {
        if (!isValidKey(key)) {
            return Result.error(`${key} is not a valid key.`);
        }

        const innerPrevState = prevState.get(key) ?? defaultState;
        const innerNextState = nextState.get(key) ?? defaultState;
        const innerFirst = first == null ? undefined : first.get(key);

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
    return Result.ok(mapToRecord(result));
};

type InnerClientTransform<TOperation, TError = string> = (params: {
    first: TOperation;
    second: TOperation;
}) => Result<{ firstPrime: TOperation | undefined; secondPrime: TOperation | undefined }, TError>;

export const clientTransform = <TOperation, TError = string>({
    first,
    second,
    innerTransform,
}: {
    first?: StringKeyRecord<TOperation>;
    second?: StringKeyRecord<TOperation>;
    innerTransform: InnerClientTransform<TOperation, TError>;
}): Result<
    {
        firstPrime: StringKeyRecord<TOperation> | undefined;
        secondPrime: StringKeyRecord<TOperation> | undefined;
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
    prevState: StringKeyRecord<TState>;
    nextState: StringKeyRecord<TState>;
    innerDiff: (params: {
        prevState: TState | undefined;
        nextState: TState | undefined;
        key: string;
    }) => TOperation | undefined;
}): StringKeyRecord<TOperation> | undefined => {
    const result = new Map<string, TOperation>();
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
        result.set(key, diffResult);
        continue;
    }
    if (result.size === 0) {
        return undefined;
    }
    return mapToRecord(result);
};
