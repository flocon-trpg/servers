import * as ReplaceOperation from '../../../../../util/replaceOperation';
import {
    Apply,
    ClientTransform,
    Compose,
    Diff,
    Restore,
    ServerTransform,
} from '../../../../../util/type';
import { isIdRecord } from '../../../../../util/record';
import { Result } from '@kizahasi/result';
import { DownOperation, State, TwoWayOperation, UpOperation } from './types';

export const toClientState =
    (isAuthorized: boolean) =>
    (source: State): State => {
        return {
            ...source,
            value: source.isValuePrivate && !isAuthorized ? null : source.value,
        };
    };

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return source;
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return source;
};

export const apply: Apply<State, UpOperation | TwoWayOperation> = ({ state, operation }) => {
    const result: State = { ...state };
    if (operation.dieType != null) {
        result.dieType = operation.dieType.newValue;
    }
    if (operation.isValuePrivate != null) {
        result.isValuePrivate = operation.isValuePrivate.newValue;
    }
    if (operation.value != null) {
        result.value = operation.value.newValue;
    }

    return Result.ok(result);
};

export const applyBack: Apply<State, DownOperation> = ({ state, operation }) => {
    const result: State = { ...state };
    if (operation.dieType != null) {
        result.dieType = operation.dieType.oldValue;
    }
    if (operation.isValuePrivate != null) {
        result.isValuePrivate = operation.isValuePrivate.oldValue;
    }
    if (operation.value != null) {
        result.value = operation.value.oldValue;
    }

    return Result.ok(result);
};

export const composeDownOperation: Compose<DownOperation> = ({ first, second }) => {
    const valueProps: DownOperation = {
        $v: 1,
        dieType: ReplaceOperation.composeDownOperation(
            first.dieType ?? undefined,
            second.dieType ?? undefined
        ),
        isValuePrivate: ReplaceOperation.composeDownOperation(
            first.isValuePrivate ?? undefined,
            second.isValuePrivate ?? undefined
        ),
        value: ReplaceOperation.composeDownOperation(
            first.value ?? undefined,
            second.value ?? undefined
        ),
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
    const twoWayOperation: TwoWayOperation = {
        $v: 1,
    };

    if (downOperation.dieType != null) {
        prevState.dieType = downOperation.dieType.oldValue;
        twoWayOperation.dieType = {
            ...downOperation.dieType,
            newValue: nextState.dieType,
        };
    }
    if (downOperation.isValuePrivate != null) {
        prevState.isValuePrivate = downOperation.isValuePrivate.oldValue;
        twoWayOperation.isValuePrivate = {
            ...downOperation.isValuePrivate,
            newValue: nextState.isValuePrivate,
        };
    }
    if (downOperation.value != null) {
        prevState.value = downOperation.value.oldValue;
        twoWayOperation.value = {
            ...downOperation.value,
            newValue: nextState.value,
        };
    }

    return Result.ok({ prevState, nextState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const resultType: TwoWayOperation = {
        $v: 1,
    };
    if (prevState.dieType !== nextState.dieType) {
        resultType.dieType = {
            oldValue: prevState.dieType,
            newValue: nextState.dieType,
        };
    }
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

export const serverTransform =
    (isAuthorized: boolean): ServerTransform<State, TwoWayOperation, UpOperation> =>
    ({ prevState, currentState, clientOperation, serverOperation }) => {
        if (!isAuthorized) {
            // 自分以外はどのプロパティも編集できない。
            return Result.ok(undefined);
        }

        const twoWayOperation: TwoWayOperation = {
            $v: 1,
        };

        twoWayOperation.dieType = ReplaceOperation.serverTransform({
            first: serverOperation?.dieType ?? undefined,
            second: clientOperation.dieType ?? undefined,
            prevState: prevState.dieType,
        });
        twoWayOperation.isValuePrivate = ReplaceOperation.serverTransform({
            first: serverOperation?.isValuePrivate ?? undefined,
            second: clientOperation.isValuePrivate ?? undefined,
            prevState: prevState.isValuePrivate,
        });
        // !isAuthorized の場合は最初の方ですべて弾いているため、isValuePrivateのチェックをする必要はない。
        twoWayOperation.value = ReplaceOperation.serverTransform({
            first: serverOperation?.value ?? undefined,
            second: clientOperation.value ?? undefined,
            prevState: prevState.value,
        });

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok({ ...twoWayOperation });
    };

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
    const dieType = ReplaceOperation.clientTransform({
        first: first.dieType,
        second: second.dieType,
    });

    const isValuePrivate = ReplaceOperation.clientTransform({
        first: first.isValuePrivate,
        second: second.isValuePrivate,
    });

    const value = ReplaceOperation.clientTransform({
        first: first.value,
        second: second.value,
    });

    const firstPrime: UpOperation = {
        $v: 1,
        dieType: dieType.firstPrime,
        isValuePrivate: isValuePrivate.firstPrime,
        value: value.firstPrime,
    };

    const secondPrime: UpOperation = {
        $v: 1,
        dieType: dieType.secondPrime,
        isValuePrivate: isValuePrivate.secondPrime,
        value: value.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
