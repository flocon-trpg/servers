import * as t from 'io-ts';
import * as TextOperation from '../../util/textOperation';
import * as ReplaceOperation from '../../util/replaceOperation';
import {
    Apply,
    ClientTransform,
    Compose,
    Diff,
    Restore,
    ServerTransform,
    ToClientOperationParams,
} from '../../util/type';
import { operation } from '../../util/operation';
import { isIdRecord } from '../../util/record';
import { Result } from '@kizahasi/result';

export const state = t.type({
    $version: t.literal(1),

    isValuePrivate: t.boolean,
    value: t.string,
});

export type State = t.TypeOf<typeof state>;

export const downOperation = operation(1, {
    isValuePrivate: t.type({ oldValue: t.boolean }),
    value: TextOperation.downOperation,
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = operation(1, {
    isValuePrivate: t.type({ newValue: t.boolean }),
    value: TextOperation.upOperation,
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $version: 1;

    isValuePrivate?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    value?: TextOperation.TwoWayOperation;
};

export const toClientState = (createdByMe: boolean) => (
    source: State
): State => {
    return {
        ...source,
        value: source.isValuePrivate && !createdByMe ? '' : source.value,
    };
};

export const toClientOperation = (createdByMe: boolean) => ({
    prevState,
    nextState,
    diff,
}: ToClientOperationParams<State, TwoWayOperation>): UpOperation => {
    return {
        ...diff,
        value: TextOperation.toPrivateClientOperation({
            oldValue: {
                value: prevState.value,
                isValuePrivate: prevState.isValuePrivate,
            },
            newValue: {
                value: nextState.value,
                isValuePrivate: nextState.isValuePrivate,
            },
            diff: diff.value,
            createdByMe,
        }),
    };
};

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        value:
            source.value == null
                ? undefined
                : TextOperation.toDownOperation(source.value),
    };
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return {
        ...source,
        value:
            source.value == null
                ? undefined
                : TextOperation.toUpOperation(source.value),
    };
};

export const apply: Apply<State, UpOperation | TwoWayOperation> = ({
    state,
    operation,
}) => {
    const result: State = { ...state };
    if (operation.isValuePrivate != null) {
        result.isValuePrivate = operation.isValuePrivate.newValue;
    }
    if (operation.value != null) {
        const valueResult = TextOperation.apply(state.value, operation.value);
        if (valueResult.isError) {
            return valueResult;
        }
        result.value = valueResult.value;
    }
    return Result.ok(result);
};

export const applyBack: Apply<State, DownOperation> = ({
    state,
    operation,
}) => {
    const result = { ...state };

    if (operation.isValuePrivate !== undefined) {
        result.isValuePrivate = operation.isValuePrivate.oldValue;
    }
    if (operation.value !== undefined) {
        const prevValue = TextOperation.applyBack(state.value, operation.value);
        if (prevValue.isError) {
            return prevValue;
        }
        result.value = prevValue.value;
    }

    return Result.ok(result);
};

export const composeUpOperation: Compose<UpOperation> = ({ first, second }) => {
    const value = TextOperation.composeUpOperation(first.value, second.value);
    if (value.isError) {
        return value;
    }
    const valueProps: UpOperation = {
        $version: 1,
        isValuePrivate: ReplaceOperation.composeUpOperation(
            first.isValuePrivate,
            second.isValuePrivate
        ),
        value: value.value,
    };
    return Result.ok(valueProps);
};

export const composeDownOperation: Compose<DownOperation> = ({
    first,
    second,
}) => {
    const value = TextOperation.composeDownOperation(first.value, second.value);
    if (value.isError) {
        return value;
    }
    const valueProps: DownOperation = {
        $version: 1,
        isValuePrivate: ReplaceOperation.composeDownOperation(
            first.isValuePrivate,
            second.isValuePrivate
        ),
        value: value.value,
    };
    return Result.ok(valueProps);
};

export const restore: Restore<State, DownOperation, TwoWayOperation> = ({
    nextState,
    downOperation,
}) => {
    if (downOperation === undefined) {
        return Result.ok({
            prevState: nextState,
            nextState,
            twoWayOperation: undefined,
        });
    }

    const prevState: State = { ...nextState };
    const twoWayOperation: TwoWayOperation = { $version: 1 };

    if (downOperation.isValuePrivate !== undefined) {
        prevState.isValuePrivate = downOperation.isValuePrivate.oldValue;
        twoWayOperation.isValuePrivate = {
            ...downOperation.isValuePrivate,
            newValue: nextState.isValuePrivate,
        };
    }
    if (downOperation.value !== undefined) {
        const restored = TextOperation.restore({
            nextState: nextState.value,
            downOperation: downOperation.value,
        });
        if (restored.isError) {
            return restored;
        }
        prevState.value = restored.value.prevState;
        twoWayOperation.value = restored.value.twoWayOperation;
    }

    return Result.ok({ prevState, nextState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({
    prevState,
    nextState,
}) => {
    const resultType: TwoWayOperation = { $version: 1 };
    if (prevState.isValuePrivate !== nextState.isValuePrivate) {
        resultType.isValuePrivate = {
            oldValue: prevState.isValuePrivate,
            newValue: nextState.isValuePrivate,
        };
    }
    if (prevState.value !== nextState.value) {
        resultType.value = TextOperation.diff({
            prev: prevState.value,
            next: nextState.value,
        });
    }
    if (isIdRecord(resultType)) {
        return undefined;
    }
    return { ...resultType };
};

export const serverTransform = (
    createdByMe: boolean
): ServerTransform<State, TwoWayOperation, UpOperation> => ({
    prevState,
    currentState,
    clientOperation,
    serverOperation,
}) => {
    const twoWayOperation: TwoWayOperation = { $version: 1 };

    if (createdByMe) {
        twoWayOperation.isValuePrivate = ReplaceOperation.serverTransform({
            first: serverOperation?.isValuePrivate,
            second: clientOperation.isValuePrivate,
            prevState: prevState.isValuePrivate,
        });
    }
    if (createdByMe || !currentState.isValuePrivate) {
        const transformed = TextOperation.serverTransform({
            first: serverOperation?.value,
            second: clientOperation.value,
            prevState: prevState.value,
        });
        if (transformed.isError) {
            return transformed;
        }
        twoWayOperation.value = transformed.value.secondPrime;
    }

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok(twoWayOperation);
};

export const clientTransform: ClientTransform<UpOperation> = ({
    first,
    second,
}) => {
    const isValuePrivate = ReplaceOperation.clientTransform({
        first: first.isValuePrivate,
        second: second.isValuePrivate,
    });

    const value = TextOperation.clientTransform({
        first: first.value,
        second: second.value,
    });

    if (value.isError) {
        return value;
    }

    const firstPrime: UpOperation = {
        $version: 1,
        isValuePrivate: isValuePrivate.firstPrime,
        value: value.value.firstPrime,
    };

    const secondPrime: UpOperation = {
        $version: 1,
        isValuePrivate: isValuePrivate.secondPrime,
        value: value.value.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
