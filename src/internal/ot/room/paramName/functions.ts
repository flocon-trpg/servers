import { Result } from '@kizahasi/result';
import { isIdRecord } from '../../util/record';
import * as TextOperation from '../../util/textOperation';
import { Apply, ClientTransform, Compose, Diff, Restore, ServerTransform } from '../../util/type';
import { DownOperation, State, TwoWayOperation, UpOperation } from './types';

export const toClientState = (source: State): State => source;

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        name: source.name == null ? undefined : TextOperation.toDownOperation(source.name),
    };
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return {
        ...source,
        name: source.name == null ? undefined : TextOperation.toUpOperation(source.name),
    };
};

export const apply: Apply<State, UpOperation | TwoWayOperation> = ({ state, operation }) => {
    const result: State = { ...state };
    if (operation.name != null) {
        const applied = TextOperation.apply(state.name, operation.name);
        if (applied.isError) {
            return applied;
        }
        result.name = applied.value;
    }
    return Result.ok(result);
};

export const applyBack: Apply<State, DownOperation> = ({ state, operation }) => {
    const result = { ...state };

    if (operation.name != null) {
        const applied = TextOperation.applyBack(state.name, operation.name);
        if (applied.isError) {
            return applied;
        }
        result.name = applied.value;
    }

    return Result.ok(result);
};

export const composeDownOperation: Compose<DownOperation> = ({ first, second }) => {
    const name = TextOperation.composeDownOperation(first.name, second.name);
    if (name.isError) {
        return name;
    }
    const valueProps: DownOperation = {
        $v: 1,
        name: name.value,
    };
    return Result.ok(valueProps);
};

export const restore: Restore<State, DownOperation, TwoWayOperation> = ({
    nextState,
    downOperation,
}) => {
    if (downOperation === undefined) {
        return Result.ok({ prevState: nextState, twoWayOperation: undefined });
    }

    const prevState: State = { ...nextState };
    const twoWayOperation: TwoWayOperation = { $v: 1 };

    if (downOperation.name !== undefined) {
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

    return Result.ok({ prevState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const resultType: TwoWayOperation = { $v: 1 };
    if (prevState.name !== nextState.name) {
        resultType.name = TextOperation.diff({ prev: prevState.name, next: nextState.name });
    }
    if (isIdRecord(resultType)) {
        return undefined;
    }
    return resultType;
};

export const serverTransform: ServerTransform<State, TwoWayOperation, UpOperation> = ({
    prevState,
    clientOperation,
    serverOperation,
}) => {
    const twoWayOperation: TwoWayOperation = { $v: 1 };

    const name = TextOperation.serverTransform({
        first: serverOperation?.name,
        second: clientOperation.name,
        prevState: prevState.name,
    });
    if (name.isError) {
        return name;
    }
    twoWayOperation.name = name.value.secondPrime;

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok({ ...twoWayOperation });
};

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
    const name = TextOperation.clientTransform({
        first: first.name,
        second: second.name,
    });
    if (name.isError) {
        return name;
    }

    const firstPrime: UpOperation = {
        $v: 1,
        name: name.value.firstPrime,
    };

    const secondPrime: UpOperation = {
        $v: 1,
        name: name.value.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
