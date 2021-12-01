import * as t from 'io-ts';
import * as ReplaceOperation from '../util/replaceOperation';
import * as BoardPosition from '../boardPositionBase/types';

const numberDownOperation = t.type({ oldValue: t.number });
const booleanDownOperation = t.type({ oldValue: t.boolean });
const numberUpOperation = t.type({ newValue: t.number });
const booleanUpOperation = t.type({ newValue: t.boolean });

/*
fast-check-io-tsは、intersectionの配列にintersectionが含まれていると無限ループに陥る模様？
それを回避させるため、stateBaseなどをexportしている。
*/

export const stateBase = t.type({
    cellH: t.number,
    cellW: t.number,
    cellX: t.number,
    cellY: t.number,
    isCellMode: t.boolean,
});

export const state = t.intersection([BoardPosition.state, stateBase]);

export type State = t.TypeOf<typeof state>;

export const downOperationBase = t.partial({
    cellH: numberDownOperation,
    cellW: numberDownOperation,
    cellX: numberDownOperation,
    cellY: numberDownOperation,
    isCellMode: booleanDownOperation,
});

export const downOperation = t.intersection([BoardPosition.downOperation, downOperationBase]);

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperationBase = t.partial({
    cellH: numberUpOperation,
    cellW: numberUpOperation,
    cellX: numberUpOperation,
    cellY: numberUpOperation,
    isCellMode: booleanUpOperation,
});

export const upOperation = t.intersection([BoardPosition.upOperation, upOperationBase]);

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = BoardPosition.TwoWayOperation & {
    cellH?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellW?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellX?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellY?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    isCellMode?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
};
