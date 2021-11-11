import * as TextOperation from '../../../../util/textOperation';
import {
    Apply,
    ClientTransform,
    Compose,
    Diff,
    DownError,
    Restore,
    ServerTransform,
    ToClientOperationParams,
} from '../../../../util/type';
import { isIdRecord } from '../../../../util/record';
import { Result } from '@kizahasi/result';
import { DownOperation, State, TwoWayOperation, UpOperation } from './types';

export const toClientState = (source: State): State => {
    return source;
};

export const toClientOperation = ({
    diff,
}: ToClientOperationParams<State, TwoWayOperation>): UpOperation => {
    return {
        ...diff,
        name: diff.name == null ? undefined : TextOperation.toUpOperation(diff.name),
        value: diff.value == null ? undefined : TextOperation.toUpOperation(diff.value),
    };
};

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        name: source.name == null ? undefined : TextOperation.toDownOperation(source.name),
        value: source.value == null ? undefined : TextOperation.toDownOperation(source.value),
    };
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return {
        ...source,
        name: source.name == null ? undefined : TextOperation.toUpOperation(source.name),
        value: source.value == null ? undefined : TextOperation.toUpOperation(source.value),
    };
};

export const apply: Apply<State, UpOperation | TwoWayOperation> = ({ state, operation }) => {
    const result: State = { ...state };

    if (operation.name != null) {
        const valueResult = TextOperation.apply(state.name, operation.name);
        if (valueResult.isError) {
            return valueResult;
        }
        result.name = valueResult.value;
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

export const applyBack: Apply<State, DownOperation> = ({ state, operation }) => {
    const result = { ...state };

    if (operation.name !== undefined) {
        const prevValue = TextOperation.applyBack(state.name, operation.name);
        if (prevValue.isError) {
            return prevValue;
        }
        result.name = prevValue.value;
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

export const composeDownOperation: Compose<DownOperation, DownError> = ({ first, second }) => {
    const name = TextOperation.composeDownOperation(first.name, second.name);
    if (name.isError) {
        return name;
    }
    const value = TextOperation.composeDownOperation(first.value, second.value);
    if (value.isError) {
        return value;
    }
    const valueProps: DownOperation = {
        $v: 1,
        $r: 1,
        name: name.value,
        value: value.value,
    };
    return Result.ok(valueProps);
};

export const restore: Restore<State, DownOperation, TwoWayOperation> = ({
    nextState,
    downOperation,
}) => {
    if (downOperation == null) {
        return Result.ok({
            prevState: nextState,
            nextState,
            twoWayOperation: undefined,
        });
    }

    const prevState: State = { ...nextState };
    const twoWayOperation: TwoWayOperation = { $v: 1, $r: 1 };

    if (downOperation.name != null) {
        const restored = TextOperation.restore({
            nextState: nextState.name,
            downOperation: downOperation.name,
        });
        if (restored.isError) {
            return restored;
        }
        prevState.name = restored.value.prevState;
        twoWayOperation.name = restored.value.twoWayOperation;
    }

    if (downOperation.value != null) {
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

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const resultType: TwoWayOperation = { $v: 1, $r: 1 };

    if (prevState.name !== nextState.name) {
        resultType.name = TextOperation.diff({
            prev: prevState.name,
            next: nextState.name,
        });
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
    return resultType;
};

export const serverTransform: ServerTransform<State, TwoWayOperation, UpOperation> = ({
    prevState,
    currentState,
    clientOperation,
    serverOperation,
}) => {
    const twoWayOperation: TwoWayOperation = {
        $v: 1,
        $r: 1,
    };

    const name = TextOperation.serverTransform({
        first: serverOperation?.name,
        second: clientOperation.name,
        prevState: prevState.name,
    });
    if (name.isError) {
        return name;
    }
    twoWayOperation.name = name.value.secondPrime;

    const value = TextOperation.serverTransform({
        first: serverOperation?.value,
        second: clientOperation.value,
        prevState: prevState.value,
    });
    if (value.isError) {
        return value;
    }
    twoWayOperation.value = value.value.secondPrime;

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok(twoWayOperation);
};

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
    const name = TextOperation.clientTransform({
        first: first.name,
        second: second.name,
    });
    if (name.isError) {
        return name;
    }

    const value = TextOperation.clientTransform({
        first: first.value,
        second: second.value,
    });
    if (value.isError) {
        return value;
    }

    const firstPrime: UpOperation = {
        $v: 1,
        $r: 1,
        name: name.value.firstPrime,
        value: value.value.firstPrime,
    };

    const secondPrime: UpOperation = {
        $v: 1,
        $r: 1,
        name: name.value.secondPrime,
        value: value.value.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
