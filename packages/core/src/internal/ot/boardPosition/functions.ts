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

export const toClientState = (source: State): State => {
    return source;
};

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return source;
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return source;
};

export const apply: Apply<State, UpOperation> = ({ state, operation }) => {
    const result: State = { ...state };
    if (operation.boardId != null) {
        result.boardId = operation.boardId.newValue;
    }
    if (operation.h != null) {
        result.h = operation.h.newValue;
    }
    if (operation.isPositionLocked != null) {
        result.isPositionLocked = operation.isPositionLocked.newValue;
    }
    if (operation.isPrivate != null) {
        result.isPrivate = operation.isPrivate.newValue;
    }
    if (operation.opacity != null) {
        result.opacity = operation.opacity.newValue;
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

    if (operation.boardId != null) {
        result.boardId = operation.boardId.oldValue;
    }
    if (operation.h !== undefined) {
        result.h = operation.h.oldValue;
    }
    if (operation.isPositionLocked != null) {
        result.isPositionLocked = operation.isPositionLocked.oldValue;
    }
    if (operation.isPrivate !== undefined) {
        result.isPrivate = operation.isPrivate.oldValue;
    }
    if (operation.opacity != null) {
        result.opacity = operation.opacity.oldValue;
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

export const composeDownOperation: Compose<DownOperation, DownError> = ({ first, second }) => {
    const valueProps: DownOperation = {
        $v: 2,
        $r: 1,
        boardId: ReplaceOperation.composeDownOperation(first.boardId, second.boardId),
        h: ReplaceOperation.composeDownOperation(first.h, second.h),
        isPositionLocked: ReplaceOperation.composeDownOperation(
            first.isPositionLocked,
            second.isPositionLocked
        ),
        isPrivate: ReplaceOperation.composeDownOperation(first.isPrivate, second.isPrivate),
        opacity: ReplaceOperation.composeDownOperation(first.opacity, second.opacity),
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
    const prevState = { ...nextState };
    const twoWayOperation: TwoWayOperation = { $v: 2, $r: 1 };

    if (downOperation.boardId !== undefined) {
        prevState.boardId = downOperation.boardId.oldValue;
        twoWayOperation.boardId = { ...downOperation.boardId, newValue: nextState.boardId };
    }
    if (downOperation.h !== undefined) {
        prevState.h = downOperation.h.oldValue;
        twoWayOperation.h = { ...downOperation.h, newValue: nextState.h };
    }
    if (downOperation.isPositionLocked !== undefined) {
        prevState.isPositionLocked = downOperation.isPositionLocked.oldValue;
        twoWayOperation.isPositionLocked = {
            ...downOperation.isPositionLocked,
            newValue: nextState.isPositionLocked,
        };
    }
    if (downOperation.isPrivate !== undefined) {
        prevState.isPrivate = downOperation.isPrivate.oldValue;
        twoWayOperation.isPrivate = {
            ...downOperation.isPrivate,
            newValue: nextState.isPrivate,
        };
    }
    if (downOperation.opacity !== undefined) {
        prevState.opacity = downOperation.opacity.oldValue;
        twoWayOperation.opacity = { ...downOperation.opacity, newValue: nextState.opacity };
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
    const resultType: TwoWayOperation = { $v: 2, $r: 1 };
    if (prevState.boardId !== nextState.boardId) {
        resultType.boardId = { oldValue: prevState.boardId, newValue: nextState.boardId };
    }
    if (prevState.h !== nextState.h) {
        resultType.h = { oldValue: prevState.h, newValue: nextState.h };
    }
    if (prevState.isPositionLocked !== nextState.isPositionLocked) {
        resultType.isPositionLocked = {
            oldValue: prevState.isPositionLocked,
            newValue: nextState.isPositionLocked,
        };
    }
    if (prevState.isPrivate !== nextState.isPrivate) {
        resultType.isPrivate = {
            oldValue: prevState.isPrivate,
            newValue: nextState.isPrivate,
        };
    }
    if (prevState.opacity !== nextState.opacity) {
        resultType.opacity = { oldValue: prevState.opacity, newValue: nextState.opacity };
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
    const twoWayOperation: TwoWayOperation = { $v: 2, $r: 1 };

    twoWayOperation.boardId = ReplaceOperation.serverTransform({
        first: serverOperation?.boardId,
        second: clientOperation.boardId,
        prevState: prevState.boardId,
    });
    twoWayOperation.h = ReplaceOperation.serverTransform({
        first: serverOperation?.h,
        second: clientOperation.h,
        prevState: prevState.h,
    });
    twoWayOperation.isPositionLocked = ReplaceOperation.serverTransform({
        first: serverOperation?.isPositionLocked,
        second: clientOperation.isPositionLocked,
        prevState: prevState.isPositionLocked,
    });
    twoWayOperation.isPrivate = ReplaceOperation.serverTransform({
        first: serverOperation?.isPrivate,
        second: clientOperation.isPrivate,
        prevState: prevState.isPrivate,
    });
    twoWayOperation.opacity = ReplaceOperation.serverTransform({
        first: serverOperation?.opacity,
        second: clientOperation.opacity,
        prevState: prevState.opacity,
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
    const boardId = ReplaceOperation.clientTransform({
        first: first.boardId,
        second: second.boardId,
    });
    const h = ReplaceOperation.clientTransform({
        first: first.h,
        second: second.h,
    });
    const isPositionLocked = ReplaceOperation.clientTransform({
        first: first.isPositionLocked,
        second: second.isPositionLocked,
    });
    const isPrivate = ReplaceOperation.clientTransform({
        first: first.isPrivate,
        second: second.isPrivate,
    });
    const opacity = ReplaceOperation.clientTransform({
        first: first.opacity,
        second: second.opacity,
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
        $v: 2,
        $r: 1,
        boardId: boardId.firstPrime,
        h: h.firstPrime,
        isPositionLocked: isPositionLocked.firstPrime,
        isPrivate: isPrivate.firstPrime,
        opacity: opacity.firstPrime,
        w: w.firstPrime,
        x: x.firstPrime,
        y: y.firstPrime,
    };

    const secondPrime: UpOperation = {
        $v: 2,
        $r: 1,
        boardId: boardId.secondPrime,
        h: h.secondPrime,
        isPositionLocked: isPositionLocked.secondPrime,
        isPrivate: isPrivate.secondPrime,
        opacity: opacity.secondPrime,
        w: w.secondPrime,
        x: x.secondPrime,
        y: y.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
