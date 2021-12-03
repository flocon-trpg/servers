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
import * as NullableTextOperation from '../util/nullableTextOperation';

export const toClientState = (source: State): State => {
    return source;
};

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        memo: source.memo == null ? undefined : NullableTextOperation.toDownOperation(source.memo),
        name: source.name == null ? undefined : NullableTextOperation.toDownOperation(source.name),
    };
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return {
        ...source,
        memo: source.memo == null ? undefined : NullableTextOperation.toUpOperation(source.memo),
        name: source.name == null ? undefined : NullableTextOperation.toUpOperation(source.name),
    };
};

export const apply: Apply<State, UpOperation> = ({ state, operation }) => {
    const result: State = { ...state };
    if (operation.h != null) {
        result.h = operation.h.newValue;
    }
    if (operation.isPositionLocked != null) {
        result.isPositionLocked = operation.isPositionLocked.newValue;
    }
    if (operation.memo != null) {
        const valueResult = NullableTextOperation.apply(state.memo, operation.memo);
        if (valueResult.isError) {
            return valueResult;
        }
        result.memo = valueResult.value;
    }
    if (operation.name != null) {
        const valueResult = NullableTextOperation.apply(state.name, operation.name);
        if (valueResult.isError) {
            return valueResult;
        }
        result.name = valueResult.value;
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

    if (operation.h !== undefined) {
        result.h = operation.h.oldValue;
    }
    if (operation.isPositionLocked != null) {
        result.isPositionLocked = operation.isPositionLocked.oldValue;
    }
    if (operation.memo != null) {
        const valueResult = NullableTextOperation.applyBack(state.memo, operation.memo);
        if (valueResult.isError) {
            return valueResult;
        }
        result.memo = valueResult.value;
    }
    if (operation.name != null) {
        const valueResult = NullableTextOperation.applyBack(state.name, operation.name);
        if (valueResult.isError) {
            return valueResult;
        }
        result.name = valueResult.value;
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
    const memo = NullableTextOperation.composeDownOperation(first.memo, second.memo);
    if (memo.isError) {
        return memo;
    }

    const name = NullableTextOperation.composeDownOperation(first.name, second.name);
    if (name.isError) {
        return name;
    }

    const valueProps: DownOperation = {
        h: ReplaceOperation.composeDownOperation(first.h, second.h),
        isPositionLocked: ReplaceOperation.composeDownOperation(
            first.isPositionLocked,
            second.isPositionLocked
        ),
        memo: memo.value,
        name: name.value,
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
    const twoWayOperation: TwoWayOperation = {};

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
    if (downOperation.memo !== undefined) {
        const restored = NullableTextOperation.restore({
            nextState: nextState.memo,
            downOperation: downOperation.memo,
        });
        if (restored.isError) {
            return restored;
        }
        prevState.memo = restored.value.prevState;
        twoWayOperation.memo = restored.value.twoWayOperation;
    }
    if (downOperation.name !== undefined) {
        const restored = NullableTextOperation.restore({
            nextState: nextState.name,
            downOperation: downOperation.name,
        });
        if (restored.isError) {
            return restored;
        }
        prevState.name = restored.value.prevState;
        twoWayOperation.name = restored.value.twoWayOperation;
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
    const resultType: TwoWayOperation = {};
    if (prevState.h !== nextState.h) {
        resultType.h = { oldValue: prevState.h, newValue: nextState.h };
    }
    if (prevState.isPositionLocked !== nextState.isPositionLocked) {
        resultType.isPositionLocked = {
            oldValue: prevState.isPositionLocked,
            newValue: nextState.isPositionLocked,
        };
    }
    if (prevState.memo !== nextState.memo) {
        resultType.memo = NullableTextOperation.diff({
            prev: prevState.memo,
            next: nextState.memo,
        });
    }
    if (prevState.name !== nextState.name) {
        resultType.name = NullableTextOperation.diff({
            prev: prevState.name,
            next: nextState.name,
        });
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
    const twoWayOperation: TwoWayOperation = {};

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

    const transformedMemo = NullableTextOperation.serverTransform({
        first: serverOperation?.memo,
        second: clientOperation.memo,
        prevState: prevState.memo,
    });
    if (transformedMemo.isError) {
        return transformedMemo;
    }
    twoWayOperation.memo = transformedMemo.value;

    const transformedName = NullableTextOperation.serverTransform({
        first: serverOperation?.name,
        second: clientOperation.name,
        prevState: prevState.name,
    });
    if (transformedName.isError) {
        return transformedName;
    }
    twoWayOperation.name = transformedName.value;

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
    const h = ReplaceOperation.clientTransform({
        first: first.h,
        second: second.h,
    });

    const isPositionLocked = ReplaceOperation.clientTransform({
        first: first.isPositionLocked,
        second: second.isPositionLocked,
    });

    const memo = NullableTextOperation.clientTransform({
        first: first.memo,
        second: second.memo,
    });
    if (memo.isError) {
        return memo;
    }

    const name = NullableTextOperation.clientTransform({
        first: first.name,
        second: second.name,
    });
    if (name.isError) {
        return name;
    }

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
        h: h.firstPrime,
        isPositionLocked: isPositionLocked.firstPrime,
        memo: memo.value.firstPrime,
        name: name.value.firstPrime,
        opacity: opacity.firstPrime,
        w: w.firstPrime,
        x: x.firstPrime,
        y: y.firstPrime,
    };

    const secondPrime: UpOperation = {
        h: h.secondPrime,
        isPositionLocked: isPositionLocked.secondPrime,
        memo: memo.value.secondPrime,
        name: name.value.secondPrime,
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
