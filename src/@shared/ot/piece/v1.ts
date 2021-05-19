import * as t from 'io-ts';
import { DualKey } from '../../DualKeyMap';
import { ResultModule } from '../../Result';
import { operation } from '../room/util/operation';
import { isIdRecord } from '../room/util/record';
import * as ReplaceValueOperation from '../room/util/replaceOperation';
import { TransformerFactory } from '../room/util/transformerFactory';
import { Apply, ToClientOperationParams } from '../room/util/type';

const numberDownOperation = t.type({ oldValue: t.number });
const booleanDownOperation = t.type({ oldValue: t.boolean });
const numberUpOperation = t.type({ newValue: t.number });
const booleanUpOperation = t.type({ newValue: t.boolean });

export const state = t.type({
    $version: t.literal(1),
    cellH: t.number,
    cellW: t.number,
    cellX: t.number,
    cellY: t.number,
    h: t.number,
    isCellMode: t.boolean,
    w: t.number,
    x: t.number,
    y: t.number,
});

export type State = t.TypeOf<typeof state>;

export const downOperation = operation(1, {
    cellH: numberDownOperation,
    cellW: numberDownOperation,
    cellX: numberDownOperation,
    cellY: numberDownOperation,
    h: numberDownOperation,
    isCellMode: booleanDownOperation,
    w: numberDownOperation,
    x: numberDownOperation,
    y: numberDownOperation,
});

type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = operation(1, {
    cellH: numberUpOperation,
    cellW: numberUpOperation,
    cellX: numberUpOperation,
    cellY: numberUpOperation,
    h: numberUpOperation,
    isCellMode: booleanUpOperation,
    w: numberUpOperation,
    x: numberUpOperation,
    y: numberUpOperation,
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $version: 1;

    cellH?: ReplaceValueOperation.ReplaceValueTwoWayOperation<number>;
    cellW?: ReplaceValueOperation.ReplaceValueTwoWayOperation<number>;
    cellX?: ReplaceValueOperation.ReplaceValueTwoWayOperation<number>;
    cellY?: ReplaceValueOperation.ReplaceValueTwoWayOperation<number>;
    h?: ReplaceValueOperation.ReplaceValueTwoWayOperation<number>;
    isCellMode?: ReplaceValueOperation.ReplaceValueTwoWayOperation<boolean>;
    w?: ReplaceValueOperation.ReplaceValueTwoWayOperation<number>;
    x?: ReplaceValueOperation.ReplaceValueTwoWayOperation<number>;
    y?: ReplaceValueOperation.ReplaceValueTwoWayOperation<number>;
}

export const toClientState = (source: State): State => {
    return source;
};

export const toServerOperation = (source: TwoWayOperation): DownOperation => {
    return source;
};

export const toClientOperation = ({ diff }: ToClientOperationParams<State, TwoWayOperation>): UpOperation => {
    return diff;
};

export const apply: Apply<State, UpOperation> = ({ state, operation }) => {
    const result: State = { ...state };
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
    if (operation.w != null) {
        result.w = operation.w.newValue;
    }
    if (operation.x != null) {
        result.x = operation.x.newValue;
    }
    if (operation.y != null) {
        result.y = operation.y.newValue;
    }
    return ResultModule.ok(result);
};

export const transformerFactory = (createdByMe: boolean): TransformerFactory<DualKey<string, string>, State, State, DownOperation, UpOperation, TwoWayOperation> => ({
    composeLoose: ({ first, second }) => {
        const valueProps: DownOperation = {
            $version: 1,
            cellH: ReplaceValueOperation.composeDownOperation(first.cellH, second.cellH),
            cellW: ReplaceValueOperation.composeDownOperation(first.cellW, second.cellW),
            cellX: ReplaceValueOperation.composeDownOperation(first.cellX, second.cellX),
            cellY: ReplaceValueOperation.composeDownOperation(first.cellY, second.cellY),
            h: ReplaceValueOperation.composeDownOperation(first.h, second.h),
            isCellMode: ReplaceValueOperation.composeDownOperation(first.isCellMode, second.isCellMode),
            w: ReplaceValueOperation.composeDownOperation(first.w, second.w),
            x: ReplaceValueOperation.composeDownOperation(first.x, second.x),
            y: ReplaceValueOperation.composeDownOperation(first.y, second.y),
        };
        return ResultModule.ok(valueProps);
    },
    restore: ({ nextState, downOperation }) => {
        if (downOperation === undefined) {
            return ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
        }

        const prevState: State = {
            ...nextState,
        };
        const twoWayOperation: TwoWayOperation = { $version: 1 };

        if (downOperation.cellH !== undefined) {
            prevState.cellH = downOperation.cellH.oldValue;
            twoWayOperation.cellH = { ...downOperation.cellH, newValue: nextState.cellH };
        }
        if (downOperation.cellW !== undefined) {
            prevState.cellW = downOperation.cellW.oldValue;
            twoWayOperation.cellW = { ...downOperation.cellW, newValue: nextState.cellW };
        }
        if (downOperation.cellX !== undefined) {
            prevState.cellX = downOperation.cellX.oldValue;
            twoWayOperation.cellX = { ...downOperation.cellX, newValue: nextState.cellX };
        }
        if (downOperation.cellY !== undefined) {
            prevState.cellY = downOperation.cellY.oldValue;
            twoWayOperation.cellY = { ...downOperation.cellY, newValue: nextState.cellY };
        }
        if (downOperation.h !== undefined) {
            prevState.h = downOperation.h.oldValue;
            twoWayOperation.h = { ...downOperation.h, newValue: nextState.h };
        }
        if (downOperation.isCellMode !== undefined) {
            prevState.isCellMode = downOperation.isCellMode.oldValue;
            twoWayOperation.isCellMode = { ...downOperation.isCellMode, newValue: nextState.isCellMode };
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

        return ResultModule.ok({ prevState, twoWayOperation });
    },
    transform: ({ prevState, clientOperation, serverOperation }) => {
        const twoWayOperation: TwoWayOperation = { $version: 1 };

        twoWayOperation.cellH = ReplaceValueOperation.transform({
            first: serverOperation?.cellH,
            second: clientOperation.cellH,
            prevState: prevState.cellH,
        });
        twoWayOperation.cellW = ReplaceValueOperation.transform({
            first: serverOperation?.cellW,
            second: clientOperation.cellW,
            prevState: prevState.cellW,
        });
        twoWayOperation.cellX = ReplaceValueOperation.transform({
            first: serverOperation?.cellX,
            second: clientOperation.cellX,
            prevState: prevState.cellX,
        });
        twoWayOperation.cellY = ReplaceValueOperation.transform({
            first: serverOperation?.cellY,
            second: clientOperation.cellY,
            prevState: prevState.cellY,
        });
        twoWayOperation.isCellMode = ReplaceValueOperation.transform({
            first: serverOperation?.isCellMode,
            second: clientOperation.isCellMode,
            prevState: prevState.isCellMode,
        });
        twoWayOperation.h = ReplaceValueOperation.transform({
            first: serverOperation?.h,
            second: clientOperation.h,
            prevState: prevState.h,
        });
        twoWayOperation.w = ReplaceValueOperation.transform({
            first: serverOperation?.w,
            second: clientOperation.w,
            prevState: prevState.w,
        });
        twoWayOperation.x = ReplaceValueOperation.transform({
            first: serverOperation?.x,
            second: clientOperation.x,
            prevState: prevState.x,
        });
        twoWayOperation.y = ReplaceValueOperation.transform({
            first: serverOperation?.y,
            second: clientOperation.y,
            prevState: prevState.y,
        });

        if (isIdRecord(twoWayOperation)) {
            return ResultModule.ok(undefined);
        }

        return ResultModule.ok(twoWayOperation);
    },
    diff: ({ prevState, nextState }) => {
        const resultType: TwoWayOperation = { $version: 1 };
        if (prevState.cellH !== nextState.cellH) {
            resultType.cellH = { oldValue: prevState.cellH, newValue: nextState.cellH };
        }
        if (prevState.cellW !== nextState.cellW) {
            resultType.cellW = { oldValue: prevState.cellW, newValue: nextState.cellW };
        }
        if (prevState.cellX !== nextState.cellX) {
            resultType.cellX = { oldValue: prevState.cellX, newValue: nextState.cellX };
        }
        if (prevState.cellY !== nextState.cellY) {
            resultType.cellY = { oldValue: prevState.cellY, newValue: nextState.cellY };
        }
        if (prevState.h !== nextState.h) {
            resultType.h = { oldValue: prevState.h, newValue: nextState.h };
        }
        if (prevState.isCellMode !== nextState.isCellMode) {
            resultType.isCellMode = { oldValue: prevState.isCellMode, newValue: nextState.isCellMode };
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
    },
    applyBack: ({ downOperation, nextState }) => {
        const result = { ...nextState };

        if (downOperation.cellH !== undefined) {
            result.cellH = downOperation.cellH.oldValue;
        }
        if (downOperation.cellW !== undefined) {
            result.cellW = downOperation.cellW.oldValue;
        }
        if (downOperation.cellX !== undefined) {
            result.cellX = downOperation.cellX.oldValue;
        }
        if (downOperation.cellY !== undefined) {
            result.cellY = downOperation.cellY.oldValue;
        }
        if (downOperation.h !== undefined) {
            result.h = downOperation.h.oldValue;
        }
        if (downOperation.isCellMode !== undefined) {
            result.isCellMode = downOperation.isCellMode.oldValue;
        }
        if (downOperation.w !== undefined) {
            result.w = downOperation.w.oldValue;
        }
        if (downOperation.x !== undefined) {
            result.x = downOperation.x.oldValue;
        }
        if (downOperation.y !== undefined) {
            result.y = downOperation.y.oldValue;
        }

        return ResultModule.ok(result);
    },
    toServerState: ({ clientState }) => clientState,
    protectedValuePolicy: {
    }
});