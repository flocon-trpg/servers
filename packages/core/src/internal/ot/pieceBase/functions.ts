import { Result } from '@kizahasi/result';
import { isIdRecord } from '../util/record';
import * as ReplaceOperation from '../util/replaceOperation';
import {
    Apply,
    ClientTransform,
    Compose,
    Diff,
    DownError,
    Restore,
    ServerTransform,
} from '../util/type';
import { DownOperation, State, TwoWayOperation, UpOperation } from './types';
import * as BoardPosition from '../boardPositionBase/functions';

export const toClientState = (source: State): State => {
    return source;
};

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        memo: undefined,
        name: undefined,
        ...BoardPosition.toDownOperation(source),
    };
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return {
        ...source,
        memo: undefined,
        name: undefined,
        ...BoardPosition.toUpOperation(source),
    };
};

export const apply: Apply<State, UpOperation> = ({ state, operation }) => {
    const boardPosition = BoardPosition.apply({ state, operation });
    if (boardPosition.isError) {
        return boardPosition;
    }
    const result: State = { ...state, ...boardPosition.value };

    if (operation.cellH != null) {
        result.cellH = operation.cellH.newValue;
    }
    if (operation.cellW != null) {
        result.cellW = operation.cellW.newValue;
    }
    if (operation.cellX != null) {
        result.cellX = operation.cellX.newValue;
    }
    if (operation.cellY != null) {
        result.cellY = operation.cellY.newValue;
    }
    if (operation.isCellMode != null) {
        result.isCellMode = operation.isCellMode.newValue;
    }
    return Result.ok(result);
};

export const applyBack: Apply<State, DownOperation> = ({ state, operation }) => {
    const boardPosition = BoardPosition.applyBack({ state, operation });
    if (boardPosition.isError) {
        return boardPosition;
    }
    const result = { ...state };

    if (operation.cellH !== undefined) {
        result.cellH = operation.cellH.oldValue;
    }
    if (operation.cellW !== undefined) {
        result.cellW = operation.cellW.oldValue;
    }
    if (operation.cellX !== undefined) {
        result.cellX = operation.cellX.oldValue;
    }
    if (operation.cellY !== undefined) {
        result.cellY = operation.cellY.oldValue;
    }
    if (operation.isCellMode !== undefined) {
        result.isCellMode = operation.isCellMode.oldValue;
    }

    return Result.ok(result);
};

export const composeDownOperation: Compose<DownOperation, DownError> = ({ first, second }) => {
    const valueProps: DownOperation = {
        ...BoardPosition.composeDownOperation({ first, second }),
        cellH: ReplaceOperation.composeDownOperation(first.cellH, second.cellH),
        cellW: ReplaceOperation.composeDownOperation(first.cellW, second.cellW),
        cellX: ReplaceOperation.composeDownOperation(first.cellX, second.cellX),
        cellY: ReplaceOperation.composeDownOperation(first.cellY, second.cellY),
        isCellMode: ReplaceOperation.composeDownOperation(first.isCellMode, second.isCellMode),
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

    const boardPosition = BoardPosition.restore({ nextState, downOperation });
    if (boardPosition.isError) {
        return boardPosition;
    }

    const prevState: State = {
        ...nextState,
        ...boardPosition.value.prevState,
    };
    const twoWayOperation: TwoWayOperation = { ...boardPosition.value.twoWayOperation };

    if (downOperation.cellH !== undefined) {
        prevState.cellH = downOperation.cellH.oldValue;
        twoWayOperation.cellH = {
            ...downOperation.cellH,
            newValue: nextState.cellH,
        };
    }
    if (downOperation.cellW !== undefined) {
        prevState.cellW = downOperation.cellW.oldValue;
        twoWayOperation.cellW = {
            ...downOperation.cellW,
            newValue: nextState.cellW,
        };
    }
    if (downOperation.cellX !== undefined) {
        prevState.cellX = downOperation.cellX.oldValue;
        twoWayOperation.cellX = {
            ...downOperation.cellX,
            newValue: nextState.cellX,
        };
    }
    if (downOperation.cellY !== undefined) {
        prevState.cellY = downOperation.cellY.oldValue;
        twoWayOperation.cellY = {
            ...downOperation.cellY,
            newValue: nextState.cellY,
        };
    }
    if (downOperation.isCellMode !== undefined) {
        prevState.isCellMode = downOperation.isCellMode.oldValue;
        twoWayOperation.isCellMode = {
            ...downOperation.isCellMode,
            newValue: nextState.isCellMode,
        };
    }

    return Result.ok({ prevState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const resultType: TwoWayOperation = { ...BoardPosition.diff({ prevState, nextState }) };
    if (prevState.cellH !== nextState.cellH) {
        resultType.cellH = {
            oldValue: prevState.cellH,
            newValue: nextState.cellH,
        };
    }
    if (prevState.cellW !== nextState.cellW) {
        resultType.cellW = {
            oldValue: prevState.cellW,
            newValue: nextState.cellW,
        };
    }
    if (prevState.cellX !== nextState.cellX) {
        resultType.cellX = {
            oldValue: prevState.cellX,
            newValue: nextState.cellX,
        };
    }
    if (prevState.cellY !== nextState.cellY) {
        resultType.cellY = {
            oldValue: prevState.cellY,
            newValue: nextState.cellY,
        };
    }
    if (prevState.isCellMode !== nextState.isCellMode) {
        resultType.isCellMode = {
            oldValue: prevState.isCellMode,
            newValue: nextState.isCellMode,
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
    const boardPosition = BoardPosition.serverTransform({
        prevState,
        currentState,
        clientOperation,
        serverOperation,
    });
    if (boardPosition.isError) {
        return boardPosition;
    }

    const twoWayOperation: TwoWayOperation = { ...boardPosition.value };

    twoWayOperation.cellH = ReplaceOperation.serverTransform({
        first: serverOperation?.cellH,
        second: clientOperation.cellH,
        prevState: prevState.cellH,
    });
    twoWayOperation.cellW = ReplaceOperation.serverTransform({
        first: serverOperation?.cellW,
        second: clientOperation.cellW,
        prevState: prevState.cellW,
    });
    twoWayOperation.cellX = ReplaceOperation.serverTransform({
        first: serverOperation?.cellX,
        second: clientOperation.cellX,
        prevState: prevState.cellX,
    });
    twoWayOperation.cellY = ReplaceOperation.serverTransform({
        first: serverOperation?.cellY,
        second: clientOperation.cellY,
        prevState: prevState.cellY,
    });
    twoWayOperation.isCellMode = ReplaceOperation.serverTransform({
        first: serverOperation?.isCellMode,
        second: clientOperation.isCellMode,
        prevState: prevState.isCellMode,
    });

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok(twoWayOperation);
};

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
    const boardPosition = BoardPosition.clientTransform({ first, second });
    const cellH = ReplaceOperation.clientTransform({
        first: first.cellH,
        second: second.cellH,
    });
    const cellW = ReplaceOperation.clientTransform({
        first: first.cellW,
        second: second.cellW,
    });
    const cellX = ReplaceOperation.clientTransform({
        first: first.cellX,
        second: second.cellX,
    });
    const cellY = ReplaceOperation.clientTransform({
        first: first.cellY,
        second: second.cellY,
    });
    const isCellMode = ReplaceOperation.clientTransform({
        first: first.isCellMode,
        second: second.isCellMode,
    });

    const firstPrime: UpOperation = {
        ...boardPosition.value?.firstPrime,
        cellH: cellH.firstPrime,
        cellW: cellW.firstPrime,
        cellX: cellX.firstPrime,
        cellY: cellY.firstPrime,
        isCellMode: isCellMode.firstPrime,
    };

    const secondPrime: UpOperation = {
        ...boardPosition.value?.secondPrime,
        cellH: cellH.secondPrime,
        cellW: cellW.secondPrime,
        cellX: cellX.secondPrime,
        cellY: cellY.secondPrime,
        isCellMode: isCellMode.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
