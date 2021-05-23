import * as t from 'io-ts';
import * as TextOperation from '../../../util/textOperation';
import * as ReplaceOperation from '../../../util/replaceOperation';
import { ResultModule } from '../../../../../Result';
import { Apply, ClientTransform, Compose, Diff, Restore, ServerTransform, ToClientOperationParams } from '../../../util/type';
import { operation } from '../../../util/operation';
import { isIdRecord } from '../../../util/record';

export const state = t.type({
    $version: t.literal(1),

    value: t.string
});

export type State = t.TypeOf<typeof state>;

export const downOperation = operation(1, {
    value: TextOperation.downOperation,
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = operation(1, {
    value: TextOperation.upOperation,
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $version: 1;

    value?: TextOperation.TwoWayOperation;
}

export const toClientState = (source: State): State => {
    return source;
};

export const toClientOperation = ({ diff }: ToClientOperationParams<State, TwoWayOperation>): UpOperation => {
    return {
        ...diff,
        value: diff.value == null ? undefined : TextOperation.toUpOperation(diff.value)
    };
};

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        value: source.value == null ? undefined : TextOperation.toDownOperation(source.value),
    };
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return {
        ...source,
        value: source.value == null ? undefined : TextOperation.toUpOperation(source.value),
    };
};

export const apply: Apply<State, UpOperation | TwoWayOperation> = ({ state, operation }) => {
    const result: State = { ...state };
    if (operation.value != null) {
        const valueResult = TextOperation.apply(state.value, operation.value);
        if (valueResult.isError) {
            return valueResult;
        }
        result.value = valueResult.value;
    }
    return ResultModule.ok(result);
};

export const applyBack: Apply<State, DownOperation> = ({ state, operation }) => {
    const result = { ...state };

    if (operation.value !== undefined) {
        const prevValue = TextOperation.applyBack(state.value, operation.value);
        if (prevValue.isError) {
            return prevValue;
        }
        result.value = prevValue.value;
    }

    return ResultModule.ok(result);
};

export const composeUpOperation: Compose<UpOperation> = ({ first, second }) => {
    const value = TextOperation.composeUpOperation(first.value, second.value);
    if (value.isError) {
        return value;
    }
    const valueProps: UpOperation = {
        $version: 1,
        value: value.value,
    };
    return ResultModule.ok(valueProps);
};

export const composeDownOperation: Compose<DownOperation> = ({ first, second }) => {
    const value = TextOperation.composeDownOperation(first.value, second.value);
    if (value.isError) {
        return value;
    }
    const valueProps: DownOperation = {
        $version: 1,
        value: value.value,
    };
    return ResultModule.ok(valueProps);
};


export const restore: Restore<State, DownOperation, TwoWayOperation> = ({ nextState, downOperation }) => {
    if (downOperation === undefined) {
        return ResultModule.ok({ prevState: nextState, nextState, twoWayOperation: undefined });
    }

    const prevState: State = { ...nextState };
    const twoWayOperation: TwoWayOperation = { $version: 1 };

    if (downOperation.value !== undefined) {
        const restored = TextOperation.restore({ nextState: nextState.value, downOperation: downOperation.value });
        if (restored.isError) {
            return restored;
        }
        prevState.value = restored.value.prevState;
        twoWayOperation.value = restored.value.twoWayOperation;
    }

    return ResultModule.ok({ prevState, nextState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const resultType: TwoWayOperation = { $version: 1 };
    if (prevState.value !== nextState.value) {
        resultType.value = TextOperation.diff({ prev: prevState.value, next: nextState.value });
    }
    if (isIdRecord(resultType)) {
        return undefined;
    }
    return resultType;
};

export const serverTransform: ServerTransform<State, TwoWayOperation, UpOperation> = ({ prevState, currentState, clientOperation, serverOperation }) => {
    const twoWayOperation: TwoWayOperation = { $version: 1 };

    const transformed = TextOperation.serverTransform({ first: serverOperation?.value, second: clientOperation.value, prevState: prevState.value });
    if (transformed.isError) {
        return transformed;
    }
    twoWayOperation.value = transformed.value.secondPrime;

    if (isIdRecord(twoWayOperation)) {
        return ResultModule.ok(undefined);
    }

    return ResultModule.ok(twoWayOperation);
};

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
    const value = TextOperation.clientTransform({
        first: first.value,
        second: second.value,
    });

    if (value.isError) {
        return value;
    }

    const firstPrime: UpOperation = {
        $version: 1,
        value: value.value.firstPrime,
    };

    const secondPrime: UpOperation = {
        $version: 1,
        value: value.value.secondPrime,
    };

    return ResultModule.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};

