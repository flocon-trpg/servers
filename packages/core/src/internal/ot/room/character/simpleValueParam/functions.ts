import {
    Apply,
    ClientTransform,
    Compose,
    Diff,
    DownError,
    Restore,
    ServerTransform,
} from '../../../util/type';
import * as ReplaceValueOperation from '../../../util/replaceOperation';
import { isIdRecord } from '../../../util/record';
import * as ReplaceOperation from '../../../util/replaceOperation';
import { Result } from '@kizahasi/result';
import * as NullableTextOperation from '../../../util/nullableTextOperation';

type State<T> = {
    $v: 2;
    $r: 1;

    isValuePrivate: boolean;
    value: T;
    overriddenParameterName: string | undefined;
};

type DownOperation<T> = {
    $v: 2;
    $r: 1;

    isValuePrivate?: { oldValue: boolean };
    value?: { oldValue: T };
    overriddenParameterName?: NullableTextOperation.DownOperation;
};

type UpOperation<T> = {
    $v: 2;
    $r: 1;

    isValuePrivate?: { newValue: boolean };
    value?: { newValue: T };
    overriddenParameterName?: NullableTextOperation.UpOperation;
};

type TwoWayOperation<T> = {
    $v: 2;
    $r: 1;

    isValuePrivate?: { oldValue: boolean; newValue: boolean };
    value?: { oldValue: T; newValue: T };
    overriddenParameterName?: NullableTextOperation.TwoWayOperation;
};

export const toClientState =
    <T>(isAuthorized: boolean, defaultValue: T) =>
    (source: State<T>): State<T> => {
        return {
            ...source,
            value: source.isValuePrivate && !isAuthorized ? defaultValue : source.value,
        };
    };

export const toDownOperation = <T>(source: TwoWayOperation<T>): DownOperation<T> => {
    return {
        ...source,
        overriddenParameterName:
            source.overriddenParameterName == null
                ? undefined
                : NullableTextOperation.toDownOperation(source.overriddenParameterName),
    };
};

export const toUpOperation = <T>(source: TwoWayOperation<T>): UpOperation<T> => {
    return {
        ...source,
        overriddenParameterName:
            source.overriddenParameterName == null
                ? undefined
                : NullableTextOperation.toUpOperation(source.overriddenParameterName),
    };
};

export const apply =
    <T>(): Apply<State<T>, UpOperation<T> | TwoWayOperation<T>> =>
    ({ state, operation }) => {
        const result: State<T> = { ...state };
        if (operation.isValuePrivate != null) {
            result.isValuePrivate = operation.isValuePrivate.newValue;
        }
        if (operation.value != null) {
            result.value = operation.value.newValue;
        }
        if (operation.overriddenParameterName != null) {
            const appliedResult = NullableTextOperation.apply(
                state.overriddenParameterName,
                operation.overriddenParameterName
            );
            if (appliedResult.isError) {
                return appliedResult;
            }
            result.overriddenParameterName = appliedResult.value;
        }
        return Result.ok(result);
    };

export const applyBack =
    <T>(): Apply<State<T>, DownOperation<T>> =>
    ({ state, operation }) => {
        const result: State<T> = { ...state };
        if (operation.isValuePrivate != null) {
            result.isValuePrivate = operation.isValuePrivate.oldValue;
        }
        if (operation.value != null) {
            result.value = operation.value.oldValue;
        }
        if (operation.overriddenParameterName != null) {
            const appliedResult = NullableTextOperation.applyBack(
                state.overriddenParameterName,
                operation.overriddenParameterName
            );
            if (appliedResult.isError) {
                return appliedResult;
            }
            result.overriddenParameterName = appliedResult.value;
        }
        return Result.ok(result);
    };

export const composeDownOperation =
    <T>(): Compose<DownOperation<T>, DownError> =>
    ({ first, second }) => {
        const overriddenParameterName = NullableTextOperation.composeDownOperation(
            first.overriddenParameterName,
            second.overriddenParameterName
        );
        if (overriddenParameterName.isError) {
            return overriddenParameterName;
        }
        const valueProps: DownOperation<T> = {
            $v: 2,
            $r: 1,
            isValuePrivate: ReplaceValueOperation.composeDownOperation(
                first.isValuePrivate,
                second.isValuePrivate
            ),
            value: ReplaceValueOperation.composeDownOperation(first.value, second.value),
            overriddenParameterName: overriddenParameterName.value,
        };
        return Result.ok(valueProps);
    };

export const restore =
    <T>(): Restore<State<T>, DownOperation<T>, TwoWayOperation<T>> =>
    ({ nextState, downOperation }) => {
        if (downOperation === undefined) {
            return Result.ok({
                prevState: nextState,
                nextState,
                twoWayOperation: undefined,
            });
        }

        const prevState: State<T> = { ...nextState };
        const twoWayOperation: TwoWayOperation<T> = { $v: 2, $r: 1 };

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
        {
            const restoredResult = NullableTextOperation.restore({
                nextState: nextState.overriddenParameterName,
                downOperation: downOperation.overriddenParameterName,
            });
            if (restoredResult.isError) {
                return restoredResult;
            }
            prevState.overriddenParameterName = restoredResult.value.prevState;
            twoWayOperation.overriddenParameterName = restoredResult.value.twoWayOperation;
        }

        return Result.ok({ prevState, nextState, twoWayOperation });
    };

export const diff =
    <T>(): Diff<State<T>, TwoWayOperation<T>> =>
    ({ prevState, nextState }) => {
        const resultType: TwoWayOperation<T> = { $v: 2, $r: 1 };
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
        if (prevState.overriddenParameterName !== nextState.overriddenParameterName) {
            resultType.overriddenParameterName = NullableTextOperation.diff({
                prev: prevState.overriddenParameterName,
                next: nextState.overriddenParameterName,
            });
        }
        if (isIdRecord(resultType)) {
            return undefined;
        }
        return resultType;
    };

export const serverTransform =
    <T>(isAuthorized: boolean): ServerTransform<State<T>, TwoWayOperation<T>, UpOperation<T>> =>
    ({ prevState, currentState, clientOperation, serverOperation }) => {
        const twoWayOperation: TwoWayOperation<T> = { $v: 2, $r: 1 };

        if (isAuthorized) {
            twoWayOperation.isValuePrivate = ReplaceValueOperation.serverTransform({
                first: serverOperation?.isValuePrivate,
                second: clientOperation.isValuePrivate,
                prevState: prevState.isValuePrivate,
            });
        }
        if (isAuthorized || !currentState.isValuePrivate) {
            twoWayOperation.value = ReplaceValueOperation.serverTransform({
                first: serverOperation?.value,
                second: clientOperation.value,
                prevState: prevState.value,
            });
        }
        {
            const xformResult = NullableTextOperation.serverTransform({
                first: serverOperation?.overriddenParameterName,
                second: clientOperation.overriddenParameterName,
                prevState: prevState.overriddenParameterName,
            });
            if (xformResult.isError) {
                return xformResult;
            }
            twoWayOperation.overriddenParameterName = xformResult.value;
        }

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok({ ...twoWayOperation });
    };

export const clientTransform =
    <T>(): ClientTransform<UpOperation<T>> =>
    ({ first, second }) => {
        const isValuePrivate = ReplaceOperation.clientTransform({
            first: first.isValuePrivate,
            second: second.isValuePrivate,
        });

        const value = ReplaceOperation.clientTransform({
            first: first.value,
            second: second.value,
        });

        const overriddenParameterName = NullableTextOperation.clientTransform({
            first: first?.overriddenParameterName,
            second: second.overriddenParameterName,
        });
        if (overriddenParameterName.isError) {
            return overriddenParameterName;
        }

        const firstPrime: UpOperation<T> = {
            $v: 2,
            $r: 1,
            isValuePrivate: isValuePrivate.firstPrime,
            value: value.firstPrime,
            overriddenParameterName: overriddenParameterName.value?.firstPrime,
        };

        const secondPrime: UpOperation<T> = {
            $v: 2,
            $r: 1,
            isValuePrivate: isValuePrivate.secondPrime,
            value: value.secondPrime,
            overriddenParameterName: overriddenParameterName.value?.secondPrime,
        };

        return Result.ok({
            firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
            secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
        });
    };
