import * as NullableTextOperation from '../../../util/nullableTextOperation';
import * as ReplaceOperation from '../../../util/replaceOperation';
import {
    Apply,
    ClientTransform,
    Compose,
    Diff,
    DownError,
    Restore,
    ServerTransform,
} from '../../../util/type';
import { isIdRecord } from '../../../util/record';
import { Result } from '@kizahasi/result';
import { DownOperation, State, TwoWayOperation, UpOperation } from './types';

export const toClientState =
    (isAuthorized: boolean) =>
    (source: State): State => {
        return {
            ...source,
            value: source.isValuePrivate && !isAuthorized ? '' : source.value,
        };
    };

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        value:
            source.value == null ? undefined : NullableTextOperation.toDownOperation(source.value),
        overriddenParameterName:
            source.overriddenParameterName == null
                ? undefined
                : NullableTextOperation.toDownOperation(source.overriddenParameterName),
    };
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return {
        ...source,
        value: source.value == null ? undefined : NullableTextOperation.toUpOperation(source.value),
        overriddenParameterName:
            source.overriddenParameterName == null
                ? undefined
                : NullableTextOperation.toUpOperation(source.overriddenParameterName),
    };
};

export const apply: Apply<State, UpOperation | TwoWayOperation> = ({ state, operation }) => {
    const result: State = { ...state };
    if (operation.isValuePrivate != null) {
        result.isValuePrivate = operation.isValuePrivate.newValue;
    }
    if (operation.value != null) {
        const valueResult = NullableTextOperation.apply(state.value, operation.value);
        if (valueResult.isError) {
            return valueResult;
        }
        result.value = valueResult.value;
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

export const applyBack: Apply<State, DownOperation> = ({ state, operation }) => {
    const result = { ...state };

    if (operation.isValuePrivate !== undefined) {
        result.isValuePrivate = operation.isValuePrivate.oldValue;
    }
    if (operation.value !== undefined) {
        const prevValue = NullableTextOperation.applyBack(state.value, operation.value);
        if (prevValue.isError) {
            return prevValue;
        }
        result.value = prevValue.value;
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

export const composeDownOperation: Compose<DownOperation, DownError> = ({ first, second }) => {
    const value = NullableTextOperation.composeDownOperation(first.value, second.value);
    if (value.isError) {
        return value;
    }
    const overriddenParameterName = NullableTextOperation.composeDownOperation(
        first.overriddenParameterName,
        second.overriddenParameterName
    );
    if (overriddenParameterName.isError) {
        return overriddenParameterName;
    }
    const valueProps: DownOperation = {
        $v: 2,
        $r: 1,
        isValuePrivate: ReplaceOperation.composeDownOperation(
            first.isValuePrivate,
            second.isValuePrivate
        ),
        value: value.value,
        overriddenParameterName: overriddenParameterName.value,
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
    const twoWayOperation: TwoWayOperation = { $v: 2, $r: 1 };

    if (downOperation.isValuePrivate !== undefined) {
        prevState.isValuePrivate = downOperation.isValuePrivate.oldValue;
        twoWayOperation.isValuePrivate = {
            ...downOperation.isValuePrivate,
            newValue: nextState.isValuePrivate,
        };
    }
    if (downOperation.value !== undefined) {
        const restored = NullableTextOperation.restore({
            nextState: nextState.value,
            downOperation: downOperation.value,
        });
        if (restored.isError) {
            return restored;
        }
        prevState.value = restored.value.prevState;
        twoWayOperation.value = restored.value.twoWayOperation;
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

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const resultType: TwoWayOperation = { $v: 2, $r: 1 };
    if (prevState.isValuePrivate !== nextState.isValuePrivate) {
        resultType.isValuePrivate = {
            oldValue: prevState.isValuePrivate,
            newValue: nextState.isValuePrivate,
        };
    }
    if (prevState.value !== nextState.value) {
        resultType.value = NullableTextOperation.diff({
            prev: prevState.value,
            next: nextState.value,
        });
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
    (isAuthorized: boolean): ServerTransform<State, TwoWayOperation, UpOperation> =>
    ({ prevState, currentState, clientOperation, serverOperation }) => {
        const twoWayOperation: TwoWayOperation = { $v: 2, $r: 1 };

        if (isAuthorized) {
            twoWayOperation.isValuePrivate = ReplaceOperation.serverTransform({
                first: serverOperation?.isValuePrivate,
                second: clientOperation.isValuePrivate,
                prevState: prevState.isValuePrivate,
            });
        }
        if (isAuthorized || !currentState.isValuePrivate) {
            const transformed = NullableTextOperation.serverTransform({
                first: serverOperation?.value,
                second: clientOperation.value,
                prevState: prevState.value,
            });
            if (transformed.isError) {
                return transformed;
            }
            twoWayOperation.value = transformed.value;
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

        return Result.ok(twoWayOperation);
    };

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
    const isValuePrivate = ReplaceOperation.clientTransform({
        first: first.isValuePrivate,
        second: second.isValuePrivate,
    });

    const value = NullableTextOperation.clientTransform({
        first: first.value,
        second: second.value,
    });
    if (value.isError) {
        return value;
    }

    const overriddenParameterName = NullableTextOperation.clientTransform({
        first: first?.overriddenParameterName,
        second: second.overriddenParameterName,
    });
    if (overriddenParameterName.isError) {
        return overriddenParameterName;
    }

    const firstPrime: UpOperation = {
        $v: 2,
        $r: 1,
        overriddenParameterName: overriddenParameterName.value.firstPrime,
        isValuePrivate: isValuePrivate.firstPrime,
        value: value.value.firstPrime,
    };

    const secondPrime: UpOperation = {
        $v: 2,
        $r: 1,
        overriddenParameterName: overriddenParameterName.value.secondPrime,
        isValuePrivate: isValuePrivate.secondPrime,
        value: value.value.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
