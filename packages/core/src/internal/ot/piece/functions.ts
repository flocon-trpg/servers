import { Result } from '@kizahasi/result';
import { CompositeKey, compositeKeyEquals } from '@flocon-trpg/utils';
import { DualStringKeyRecord, isIdRecord } from '../util/record';
import * as ReplaceOperation from '../util/replaceOperation';
import * as DualKeyRecordOperation from '../util/dualKeyRecordOperation';
import {
    Apply,
    ClientTransform,
    Compose,
    Diff,
    RequestedBy,
    Restore,
    ServerTransform,
} from '../util/type';
import { isBoardVisible } from '../util/isBoardVisible';
import { DownOperation, State, TwoWayOperation, UpOperation } from './types';

export const toClientStateMany =
    (requestedBy: RequestedBy, activeBoardKey: CompositeKey | null) =>
    (source: DualStringKeyRecord<State>): DualStringKeyRecord<State> => {
        return DualKeyRecordOperation.toClientState<State, State>({
            serverState: source,
            isPrivate: state => {
                return !isBoardVisible({
                    activeBoardKey,
                    boardKey: state.boardKey,
                    requestedBy,
                });
            },
            toClientState: ({ state }) => state,
        });
    };

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return source;
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return source;
};

export const apply: Apply<State, UpOperation> = ({ state, operation }) => {
    const result: State = { ...state };
    if (operation.boardKey != null) {
        result.boardKey = operation.boardKey.newValue;
    }
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
    if (operation.h != null) {
        result.h = operation.h.newValue;
    }
    if (operation.isCellMode != null) {
        result.isCellMode = operation.isCellMode.newValue;
    }
    if (operation.isPrivate != null) {
        result.isPrivate = operation.isPrivate.newValue;
    }
    if (operation.w != null) {
        result.w = operation.w.newValue;
    }
    if (operation.x != null) {
        result.x = operation.x.newValue;
    }
    if (operation.y != null) {
        result.y = operation.y.newValue;
    }
    return Result.ok(result);
};

export const applyBack: Apply<State, DownOperation> = ({ state, operation }) => {
    const result = { ...state };

    if (operation.boardKey != null) {
        result.boardKey = operation.boardKey.oldValue;
    }
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
    if (operation.h !== undefined) {
        result.h = operation.h.oldValue;
    }
    if (operation.isCellMode !== undefined) {
        result.isCellMode = operation.isCellMode.oldValue;
    }
    if (operation.isPrivate !== undefined) {
        result.isPrivate = operation.isPrivate.oldValue;
    }
    if (operation.w !== undefined) {
        result.w = operation.w.oldValue;
    }
    if (operation.x !== undefined) {
        result.x = operation.x.oldValue;
    }
    if (operation.y !== undefined) {
        result.y = operation.y.oldValue;
    }

    return Result.ok(result);
};

export const composeDownOperation: Compose<DownOperation> = ({ first, second }) => {
    const valueProps: DownOperation = {
        $v: 1,
        $r: 1,
        boardKey: ReplaceOperation.composeDownOperation(first.boardKey, second.boardKey),
        cellH: ReplaceOperation.composeDownOperation(first.cellH, second.cellH),
        cellW: ReplaceOperation.composeDownOperation(first.cellW, second.cellW),
        cellX: ReplaceOperation.composeDownOperation(first.cellX, second.cellX),
        cellY: ReplaceOperation.composeDownOperation(first.cellY, second.cellY),
        h: ReplaceOperation.composeDownOperation(first.h, second.h),
        isCellMode: ReplaceOperation.composeDownOperation(first.isCellMode, second.isCellMode),
        isPrivate: ReplaceOperation.composeDownOperation(first.isPrivate, second.isPrivate),
        w: ReplaceOperation.composeDownOperation(first.w, second.w),
        x: ReplaceOperation.composeDownOperation(first.x, second.x),
        y: ReplaceOperation.composeDownOperation(first.y, second.y),
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

    const prevState: State = {
        ...nextState,
    };
    const twoWayOperation: TwoWayOperation = { $v: 1, $r: 1 };

    if (downOperation.boardKey !== undefined) {
        prevState.boardKey = downOperation.boardKey.oldValue;
        twoWayOperation.boardKey = { ...downOperation.boardKey, newValue: nextState.boardKey };
    }
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
    if (downOperation.h !== undefined) {
        prevState.h = downOperation.h.oldValue;
        twoWayOperation.h = { ...downOperation.h, newValue: nextState.h };
    }
    if (downOperation.isCellMode !== undefined) {
        prevState.isCellMode = downOperation.isCellMode.oldValue;
        twoWayOperation.isCellMode = {
            ...downOperation.isCellMode,
            newValue: nextState.isCellMode,
        };
    }
    if (downOperation.isPrivate !== undefined) {
        prevState.isPrivate = downOperation.isPrivate.oldValue;
        twoWayOperation.isPrivate = {
            ...downOperation.isPrivate,
            newValue: nextState.isPrivate,
        };
    }
    if (downOperation.w !== undefined) {
        prevState.w = downOperation.w.oldValue;
        twoWayOperation.w = { ...downOperation.w, newValue: nextState.w };
    }
    if (downOperation.x !== undefined) {
        prevState.x = downOperation.x.oldValue;
        twoWayOperation.x = { ...downOperation.x, newValue: nextState.x };
    }
    if (downOperation.y !== undefined) {
        prevState.y = downOperation.y.oldValue;
        twoWayOperation.y = { ...downOperation.y, newValue: nextState.y };
    }

    return Result.ok({ prevState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const resultType: TwoWayOperation = { $v: 1, $r: 1 };
    if (!compositeKeyEquals(prevState.boardKey, nextState.boardKey)) {
        resultType.boardKey = { oldValue: prevState.boardKey, newValue: nextState.boardKey };
    }
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
    if (prevState.h !== nextState.h) {
        resultType.h = { oldValue: prevState.h, newValue: nextState.h };
    }
    if (prevState.isCellMode !== nextState.isCellMode) {
        resultType.isCellMode = {
            oldValue: prevState.isCellMode,
            newValue: nextState.isCellMode,
        };
    }
    if (prevState.isPrivate !== nextState.isPrivate) {
        resultType.isPrivate = {
            oldValue: prevState.isPrivate,
            newValue: nextState.isPrivate,
        };
    }
    if (prevState.w !== nextState.w) {
        resultType.w = { oldValue: prevState.w, newValue: nextState.w };
    }
    if (prevState.x !== nextState.x) {
        resultType.x = { oldValue: prevState.x, newValue: nextState.x };
    }
    if (prevState.y !== nextState.y) {
        resultType.y = { oldValue: prevState.y, newValue: nextState.y };
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

    twoWayOperation.boardKey = ReplaceOperation.serverTransform({
        first: serverOperation?.boardKey,
        second: clientOperation.boardKey,
        prevState: prevState.boardKey,
    });
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
    twoWayOperation.isPrivate = ReplaceOperation.serverTransform({
        first: serverOperation?.isPrivate,
        second: clientOperation.isPrivate,
        prevState: prevState.isPrivate,
    });
    twoWayOperation.h = ReplaceOperation.serverTransform({
        first: serverOperation?.h,
        second: clientOperation.h,
        prevState: prevState.h,
    });
    twoWayOperation.w = ReplaceOperation.serverTransform({
        first: serverOperation?.w,
        second: clientOperation.w,
        prevState: prevState.w,
    });
    twoWayOperation.x = ReplaceOperation.serverTransform({
        first: serverOperation?.x,
        second: clientOperation.x,
        prevState: prevState.x,
    });
    twoWayOperation.y = ReplaceOperation.serverTransform({
        first: serverOperation?.y,
        second: clientOperation.y,
        prevState: prevState.y,
    });

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok(twoWayOperation);
};

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
    const boardKey = ReplaceOperation.clientTransform({
        first: first.boardKey,
        second: second.boardKey,
    });
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
    const isPrivate = ReplaceOperation.clientTransform({
        first: first.isPrivate,
        second: second.isPrivate,
    });
    const h = ReplaceOperation.clientTransform({
        first: first.h,
        second: second.h,
    });
    const w = ReplaceOperation.clientTransform({
        first: first.w,
        second: second.w,
    });
    const x = ReplaceOperation.clientTransform({
        first: first.x,
        second: second.x,
    });
    const y = ReplaceOperation.clientTransform({
        first: first.y,
        second: second.y,
    });

    const firstPrime: UpOperation = {
        $v: 1,
        $r: 1,
        boardKey: boardKey.firstPrime,
        cellH: cellH.firstPrime,
        cellW: cellW.firstPrime,
        cellX: cellX.firstPrime,
        cellY: cellY.firstPrime,
        h: h.firstPrime,
        isCellMode: isCellMode.firstPrime,
        isPrivate: isPrivate.firstPrime,
        w: w.firstPrime,
        x: x.firstPrime,
        y: y.firstPrime,
    };

    const secondPrime: UpOperation = {
        $v: 1,
        $r: 1,
        boardKey: boardKey.secondPrime,
        cellH: cellH.secondPrime,
        cellW: cellW.secondPrime,
        cellX: cellX.secondPrime,
        cellY: cellY.secondPrime,
        h: h.secondPrime,
        isCellMode: isCellMode.secondPrime,
        isPrivate: isPrivate.secondPrime,
        w: w.secondPrime,
        x: x.secondPrime,
        y: y.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
