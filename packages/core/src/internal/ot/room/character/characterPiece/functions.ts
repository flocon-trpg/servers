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
import * as PieceBase from '../../../pieceBase/functions';

export const toClientState = (source: State): State => {
    return source;
};

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        memo: undefined,
        name: undefined,
        ...PieceBase.toDownOperation(source),
    };
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return {
        ...source,
        memo: undefined,
        name: undefined,
        ...PieceBase.toUpOperation(source),
    };
};

export const apply: Apply<State, UpOperation> = ({ state, operation }) => {
    const boardPosition = PieceBase.apply({ state, operation });
    if (boardPosition.isError) {
        return boardPosition;
    }
    const result: State = { ...state, ...boardPosition.value };

    if (operation.isPrivate != null) {
        result.isPrivate = operation.isPrivate.newValue;
    }

    return Result.ok(result);
};

export const applyBack: Apply<State, DownOperation> = ({ state, operation }) => {
    const boardPosition = PieceBase.applyBack({ state, operation });
    if (boardPosition.isError) {
        return boardPosition;
    }
    const result = { ...state };

    if (operation.isPrivate != null) {
        result.isPrivate = operation.isPrivate.oldValue;
    }

    return Result.ok(result);
};

export const composeDownOperation: Compose<DownOperation, DownError> = ({ first, second }) => {
    const valueProps: DownOperation = {
        ...PieceBase.composeDownOperation({ first, second }),
        $v: 2,
        $r: 1,
        isPrivate: ReplaceOperation.composeDownOperation(first.isPrivate, second.isPrivate),
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

    const boardPosition = PieceBase.restore({ nextState, downOperation });
    if (boardPosition.isError) {
        return boardPosition;
    }

    const prevState: State = {
        ...nextState,
        ...boardPosition.value.prevState,
    };
    const twoWayOperation: TwoWayOperation = {
        ...boardPosition.value.twoWayOperation,
        $v: 2,
        $r: 1,
    };

    if (downOperation.isPrivate !== undefined) {
        prevState.isPrivate = downOperation.isPrivate.oldValue;
        twoWayOperation.isPrivate = {
            ...downOperation.isPrivate,
            newValue: nextState.isPrivate,
        };
    }

    return Result.ok({ prevState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const resultType: TwoWayOperation = {
        ...PieceBase.diff({ prevState, nextState }),
        $v: 2,
        $r: 1,
    };
    if (prevState.isPrivate !== nextState.isPrivate) {
        resultType.isPrivate = {
            oldValue: prevState.isPrivate,
            newValue: nextState.isPrivate,
        };
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
    const boardPosition = PieceBase.serverTransform({
        prevState,
        currentState,
        clientOperation,
        serverOperation,
    });
    if (boardPosition.isError) {
        return boardPosition;
    }

    const twoWayOperation: TwoWayOperation = { ...boardPosition.value, $v: 2, $r: 1 };

    twoWayOperation.isPrivate = ReplaceOperation.serverTransform({
        first: serverOperation?.isPrivate,
        second: clientOperation.isPrivate,
        prevState: prevState.isPrivate,
    });

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok(twoWayOperation);
};

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
    const boardPosition = PieceBase.clientTransform({ first, second });
    const isPrivate = ReplaceOperation.clientTransform({
        first: first.isPrivate,
        second: second.isPrivate,
    });

    const firstPrime: UpOperation = {
        ...boardPosition.value?.firstPrime,
        $v: 2,
        $r: 1,
        isPrivate: isPrivate.firstPrime,
    };

    const secondPrime: UpOperation = {
        ...boardPosition.value?.secondPrime,
        $v: 2,
        $r: 1,
        isPrivate: isPrivate.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
