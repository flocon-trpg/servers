import {
    Apply,
    ClientTransform,
    Compose,
    Diff,
    Restore,
    ServerTransform,
    ToClientOperationParams,
} from '../../util/type';
import * as ReplaceValueOperation from '../../util/replaceOperation';
import { isIdRecord } from '../../util/record';
import * as ReplaceOperation from '../../util/replaceOperation';
import { Result } from '@kizahasi/result';

type State<T> = {
    $version: 1;

    isValuePrivate: boolean;
    value: T;
};

type DownOperation<T> = {
    $version: 1;

    isValuePrivate?: { oldValue: boolean };
    value?: { oldValue: T };
};

type UpOperation<T> = {
    $version: 1;

    isValuePrivate?: { newValue: boolean };
    value?: { newValue: T };
};

type TwoWayOperation<T> = {
    $version: 1;

    isValuePrivate?: { oldValue: boolean; newValue: boolean };
    value?: { oldValue: T; newValue: T };
};

export const toClientState = <T>(createdByMe: boolean, defaultValue: T) => (
    source: State<T>
): State<T> => {
    return {
        ...source,
        value:
            source.isValuePrivate && !createdByMe ? defaultValue : source.value,
    };
};

export const toClientOperation = <T>(
    createdByMe: boolean,
    defaultValue: T
) => ({
    prevState,
    nextState,
    diff,
}: ToClientOperationParams<State<T>, TwoWayOperation<T>>): UpOperation<T> => {
    return {
        ...diff,
        value: ReplaceOperation.toPrivateClientOperation({
            oldValue: {
                value: prevState.value,
                isValuePrivate: prevState.isValuePrivate,
            },
            newValue: {
                value: nextState.value,
                isValuePrivate: nextState.isValuePrivate,
            },
            defaultState: defaultValue,
            createdByMe,
        }),
    };
};

export const toDownOperation = <T>(
    source: TwoWayOperation<T>
): DownOperation<T> => {
    return source;
};

export const toUpOperation = <T>(
    source: TwoWayOperation<T>
): UpOperation<T> => {
    return source;
};

export const apply = <T>(): Apply<
    State<T>,
    UpOperation<T> | TwoWayOperation<T>
> => ({ state, operation }) => {
    const result: State<T> = { ...state };
    if (operation.isValuePrivate != null) {
        result.isValuePrivate = operation.isValuePrivate.newValue;
    }
    if (operation.value != null) {
        result.value = operation.value.newValue;
    }
    return Result.ok(result);
};

export const applyBack = <T>(): Apply<State<T>, DownOperation<T>> => ({
    state,
    operation,
}) => {
    const result: State<T> = { ...state };
    if (operation.isValuePrivate != null) {
        result.isValuePrivate = operation.isValuePrivate.oldValue;
    }
    if (operation.value != null) {
        result.value = operation.value.oldValue;
    }
    return Result.ok(result);
};

export const composeUpOperation = <T>(): Compose<UpOperation<T>> => ({
    first,
    second,
}) => {
    const valueProps: UpOperation<T> = {
        $version: 1,
        isValuePrivate: ReplaceValueOperation.composeUpOperation(
            first.isValuePrivate,
            second.isValuePrivate
        ),
        value: ReplaceValueOperation.composeUpOperation(
            first.value,
            second.value
        ),
    };
    return Result.ok(valueProps);
};

export const composeDownOperation = <T>(): Compose<DownOperation<T>> => ({
    first,
    second,
}) => {
    const valueProps: DownOperation<T> = {
        $version: 1,
        isValuePrivate: ReplaceValueOperation.composeDownOperation(
            first.isValuePrivate,
            second.isValuePrivate
        ),
        value: ReplaceValueOperation.composeDownOperation(
            first.value,
            second.value
        ),
    };
    return Result.ok(valueProps);
};

export const restore = <T>(): Restore<
    State<T>,
    DownOperation<T>,
    TwoWayOperation<T>
> => ({ nextState, downOperation }) => {
    if (downOperation === undefined) {
        return Result.ok({
            prevState: nextState,
            nextState,
            twoWayOperation: undefined,
        });
    }

    const prevState: State<T> = { ...nextState };
    const twoWayOperation: TwoWayOperation<T> = { $version: 1 };

    if (downOperation.isValuePrivate !== undefined) {
        prevState.isValuePrivate = downOperation.isValuePrivate.oldValue;
        twoWayOperation.isValuePrivate = {
            ...downOperation.isValuePrivate,
            newValue: nextState.isValuePrivate,
        };
    }
    if (downOperation.value !== undefined) {
        prevState.value = downOperation.value.oldValue;
        twoWayOperation.value = {
            oldValue: downOperation.value.oldValue,
            newValue: nextState.value,
        };
    }

    return Result.ok({ prevState, nextState, twoWayOperation });
};

export const diff = <T>(): Diff<State<T>, TwoWayOperation<T>> => ({
    prevState,
    nextState,
}) => {
    const resultType: TwoWayOperation<T> = { $version: 1 };
    if (prevState.isValuePrivate !== nextState.isValuePrivate) {
        resultType.isValuePrivate = {
            oldValue: prevState.isValuePrivate,
            newValue: nextState.isValuePrivate,
        };
    }
    if (prevState.value !== nextState.value) {
        resultType.value = {
            oldValue: prevState.value,
            newValue: nextState.value,
        };
    }
    if (isIdRecord(resultType)) {
        return undefined;
    }
    return { ...resultType };
};

export const serverTransform = <T>(
    createdByMe: boolean
): ServerTransform<State<T>, TwoWayOperation<T>, UpOperation<T>> => ({
    prevState,
    currentState,
    clientOperation,
    serverOperation,
}) => {
    const twoWayOperation: TwoWayOperation<T> = { $version: 1 };

    if (createdByMe) {
        twoWayOperation.isValuePrivate = ReplaceValueOperation.serverTransform({
            first: serverOperation?.isValuePrivate,
            second: clientOperation.isValuePrivate,
            prevState: prevState.isValuePrivate,
        });
    }
    if (createdByMe || !currentState.isValuePrivate) {
        twoWayOperation.value = ReplaceValueOperation.serverTransform({
            first: serverOperation?.value,
            second: clientOperation.value,
            prevState: prevState.value,
        });
    }

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok({ ...twoWayOperation });
};

export const clientTransform = <T>(): ClientTransform<UpOperation<T>> => ({
    first,
    second,
}) => {
    const isValuePrivate = ReplaceOperation.clientTransform({
        first: first.isValuePrivate,
        second: second.isValuePrivate,
    });

    const value = ReplaceOperation.clientTransform({
        first: first.value,
        second: second.value,
    });

    const firstPrime: UpOperation<T> = {
        $version: 1,
        isValuePrivate: isValuePrivate.firstPrime,
        value: value.firstPrime,
    };

    const secondPrime: UpOperation<T> = {
        $version: 1,
        isValuePrivate: isValuePrivate.secondPrime,
        value: value.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
