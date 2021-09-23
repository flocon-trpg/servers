import { Result } from '@kizahasi/result';
import { CompositeKey, compositeKeyEquals } from '@kizahasi/util';
import * as t from 'io-ts';
import { compositeKey } from '../compositeKey/v1';
import { createOperation } from '../util/createOperation';
import { isIdRecord } from '../util/record';
import * as ReplaceOperation from '../util/replaceOperation';
import { Apply, ClientTransform, Compose, Diff, Restore, ServerTransform } from '../util/type';

const numberDownOperation = t.type({ oldValue: t.number });
const booleanDownOperation = t.type({ oldValue: t.boolean });
const numberUpOperation = t.type({ newValue: t.number });
const booleanUpOperation = t.type({ newValue: t.boolean });

// boardKey変更機能は今の所UIに存在しないので定義していない

export const state = t.type({
    $v: t.literal(1),
    boardKey: compositeKey,
    h: t.number,
    isPrivate: t.boolean,
    w: t.number,
    x: t.number,
    y: t.number,
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(1, {
    boardKey: t.type({ oldValue: compositeKey }),
    h: numberDownOperation,
    isPrivate: booleanDownOperation,
    w: numberDownOperation,
    x: numberDownOperation,
    y: numberDownOperation,
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(1, {
    boardKey: t.type({ newValue: compositeKey }),
    h: numberUpOperation,
    isPrivate: booleanUpOperation,
    w: numberUpOperation,
    x: numberUpOperation,
    y: numberUpOperation,
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 1;

    boardKey?: ReplaceOperation.ReplaceValueTwoWayOperation<CompositeKey>;
    h?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    isPrivate?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    w?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    x?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    y?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
};

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
    if (operation.boardKey != null) {
        result.boardKey = operation.boardKey.newValue;
    }
    if (operation.h != null) {
        result.h = operation.h.newValue;
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
    if (operation.h !== undefined) {
        result.h = operation.h.oldValue;
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
        boardKey: ReplaceOperation.composeDownOperation(first.boardKey, second.boardKey),
        h: ReplaceOperation.composeDownOperation(first.h, second.h),
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
    const prevState = { ...nextState };
    const twoWayOperation: TwoWayOperation = { $v: 1 };

    if (downOperation.boardKey !== undefined) {
        prevState.boardKey = downOperation.boardKey.oldValue;
        twoWayOperation.boardKey = { ...downOperation.boardKey, newValue: nextState.boardKey };
    }
    if (downOperation.h !== undefined) {
        prevState.h = downOperation.h.oldValue;
        twoWayOperation.h = { ...downOperation.h, newValue: nextState.h };
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
    const resultType: TwoWayOperation = { $v: 1 };
    if (!compositeKeyEquals(prevState.boardKey, nextState.boardKey)) {
        resultType.boardKey = { oldValue: prevState.boardKey, newValue: nextState.boardKey };
    }
    if (prevState.h !== nextState.h) {
        resultType.h = { oldValue: prevState.h, newValue: nextState.h };
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
    const twoWayOperation: TwoWayOperation = { $v: 1 };

    twoWayOperation.boardKey = ReplaceOperation.serverTransform({
        first: serverOperation?.boardKey,
        second: clientOperation.boardKey,
        prevState: prevState.boardKey,
    });
    twoWayOperation.h = ReplaceOperation.serverTransform({
        first: serverOperation?.h,
        second: clientOperation.h,
        prevState: prevState.h,
    });
    twoWayOperation.isPrivate = ReplaceOperation.serverTransform({
        first: serverOperation?.isPrivate,
        second: clientOperation.isPrivate,
        prevState: prevState.isPrivate,
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
    const h = ReplaceOperation.clientTransform({
        first: first.h,
        second: second.h,
    });
    const isPrivate = ReplaceOperation.clientTransform({
        first: first.isPrivate,
        second: second.isPrivate,
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
        boardKey: boardKey.firstPrime,
        h: h.firstPrime,
        isPrivate: isPrivate.firstPrime,
        w: w.firstPrime,
        x: x.firstPrime,
        y: y.firstPrime,
    };

    const secondPrime: UpOperation = {
        $v: 1,
        boardKey: boardKey.secondPrime,
        h: h.secondPrime,
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
