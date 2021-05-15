import * as t from 'io-ts';
import { DualKey } from '../../../DualKeyMap';
import { ResultModule } from '../../../Result';
import { undefinedForAll } from '../../../utils';
import * as ReplaceOperation from './replaceOperation';
import { TransformerFactory } from './transformerFactory';
import { Apply, ToClientOperationParams } from './type';

const numberDownOperation = t.type({ oldValue: t.number });
const booleanDownOperation = t.type({ oldValue: t.boolean });
const numberUpOperation = t.type({ newValue: t.number });
const booleanUpOperation = t.type({ newValue: t.boolean });

export const state = t.type({
    h: t.number,
    isPrivate: t.boolean,
    w: t.number,
    x: t.number,
    y: t.number,
});

export type State = t.TypeOf<typeof state>;

export const downOperation = t.partial({
    h: numberDownOperation,
    isPrivate: booleanDownOperation,
    w: numberDownOperation,
    x: numberDownOperation,
    y: numberDownOperation,
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = t.partial({
    h: numberUpOperation,
    isPrivate: booleanUpOperation,
    w: numberUpOperation,
    x: numberUpOperation,
    y: numberUpOperation,
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    h?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    isPrivate?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    w?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    x?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    y?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
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
    return ResultModule.ok(result);
};

export const transformerFactory = (createdByMe: boolean): TransformerFactory<DualKey<string, string>, State, State, DownOperation, UpOperation, TwoWayOperation> => ({
    composeLoose: ({ first, second }) => {
        const valueProps: DownOperation = {
            h: ReplaceOperation.composeDownOperation(first.h, second.h),
            isPrivate: ReplaceOperation.composeDownOperation(first.isPrivate, second.isPrivate),
            w: ReplaceOperation.composeDownOperation(first.w, second.w),
            x: ReplaceOperation.composeDownOperation(first.x, second.x),
            y: ReplaceOperation.composeDownOperation(first.y, second.y),
        };
        return ResultModule.ok(valueProps);
    },
    restore: ({ nextState, downOperation }) => {
        if (downOperation === undefined) {
            return ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
        }
        const prevState = { ...nextState };
        const twoWayOperation: TwoWayOperation = {};

        if (downOperation.h !== undefined) {
            prevState.h = downOperation.h.oldValue;
            twoWayOperation.h = { ...downOperation.h, newValue: nextState.h };
        }
        if (downOperation.isPrivate !== undefined) {
            prevState.isPrivate = downOperation.isPrivate.oldValue;
            twoWayOperation.isPrivate = { ...downOperation.isPrivate, newValue: nextState.isPrivate };
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
    transform: ({ prevState, clientOperation, serverOperation, currentState }) => {
        if (!createdByMe && currentState.isPrivate) {
            return ResultModule.ok(undefined);
        }

        const twoWayOperation: TwoWayOperation = {};

        twoWayOperation.h = ReplaceOperation.transform({
            first: serverOperation?.h,
            second: clientOperation.h,
            prevState: prevState.h,
        });
        twoWayOperation.isPrivate = ReplaceOperation.transform({
            first: serverOperation?.isPrivate,
            second: clientOperation.isPrivate,
            prevState: prevState.isPrivate,
        });
        twoWayOperation.w = ReplaceOperation.transform({
            first: serverOperation?.w,
            second: clientOperation.w,
            prevState: prevState.w,
        });
        twoWayOperation.x = ReplaceOperation.transform({
            first: serverOperation?.x,
            second: clientOperation.x,
            prevState: prevState.x,
        });
        twoWayOperation.y = ReplaceOperation.transform({
            first: serverOperation?.y,
            second: clientOperation.y,
            prevState: prevState.y,
        });

        if (undefinedForAll(twoWayOperation)) {
            return ResultModule.ok(undefined);
        }

        return ResultModule.ok(twoWayOperation);
    },
    diff: ({ prevState, nextState }) => {
        const resultType: TwoWayOperation = {};
        if (prevState.h !== nextState.h) {
            resultType.h = { oldValue: prevState.h, newValue: nextState.h };
        }
        if (prevState.isPrivate !== nextState.isPrivate) {
            resultType.isPrivate = { oldValue: prevState.isPrivate, newValue: nextState.isPrivate };
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
        if (undefinedForAll(resultType)) {
            return undefined;
        }
        return resultType;
    },
    applyBack: ({ downOperation, nextState }) => {
        const result = { ...nextState };

        if (downOperation.h !== undefined) {
            result.h = downOperation.h.oldValue;
        }
        if (downOperation.isPrivate !== undefined) {
            result.isPrivate = downOperation.isPrivate.oldValue;
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
        cancelRemove: ({ nextState }) => !createdByMe && nextState.isPrivate,
    }
});