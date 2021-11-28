import { Result } from '@kizahasi/result';
import { isIdRecord } from '../../../util/record';
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
import { DownOperation, State, TwoWayOperation, UpOperation } from './types';

export const toClientState = (source: State): State => source;

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return source;
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return source;
};

export const apply: Apply<State, UpOperation | TwoWayOperation> = ({ state, operation }) => {
    const result: State = { ...state };

    if (operation.answeredAt != null) {
        result.answeredAt = operation.answeredAt.newValue;
    }

    return Result.ok(result);
};

export const applyBack: Apply<State, DownOperation> = ({ state, operation }) => {
    const result = { ...state };

    if (operation.answeredAt != null) {
        result.answeredAt = operation.answeredAt.oldValue;
    }

    return Result.ok(result);
};

export const composeDownOperation: Compose<DownOperation, DownError> = ({ first, second }) => {
    const valueProps: DownOperation = {
        $v: 1,
        $r: 1,
        answeredAt: ReplaceOperation.composeDownOperation(first.answeredAt, second.answeredAt),
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
    const twoWayOperation: TwoWayOperation = { $v: 1, $r: 1 };

    if (downOperation.answeredAt !== undefined) {
        prevState.answeredAt = downOperation.answeredAt.oldValue;
        twoWayOperation.answeredAt = {
            ...downOperation.answeredAt,
            newValue: nextState.answeredAt,
        };
    }

    return Result.ok({ prevState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const resultType: TwoWayOperation = { $v: 1, $r: 1 };

    if (prevState.answeredAt !== nextState.answeredAt) {
        resultType.answeredAt = {
            oldValue: prevState.answeredAt,
            newValue: nextState.answeredAt,
        };
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
    const twoWayOperation: TwoWayOperation = { $v: 1, $r: 1 };

    twoWayOperation.answeredAt = ReplaceOperation.serverTransform({
        first: serverOperation?.answeredAt,
        second: clientOperation.answeredAt,
        prevState: prevState.answeredAt,
    });

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok({ ...twoWayOperation });
};

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
    const answeredAt = ReplaceOperation.clientTransform({
        first: first.answeredAt,
        second: second.answeredAt,
    });

    const firstPrime: UpOperation = {
        $v: 1,
        $r: 1,
        answeredAt: answeredAt.firstPrime,
    };

    const secondPrime: UpOperation = {
        $v: 1,
        $r: 1,
        answeredAt: answeredAt.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
