import * as t from 'io-ts';
import * as ReplaceOperation from '../util/replaceOperation';
import * as BoardPosition from '../boardPositionBase/types';

const numberDownOperation = t.type({ oldValue: t.number });
const booleanDownOperation = t.type({ oldValue: t.boolean });
const numberUpOperation = t.type({ newValue: t.number });
const booleanUpOperation = t.type({ newValue: t.boolean });

export const state = t.intersection([
    BoardPosition.state,
    t.type({
        cellH: t.number,
        cellW: t.number,
        cellX: t.number,
        cellY: t.number,
        isCellMode: t.boolean,
    }),
]);

export type State = t.TypeOf<typeof state>;

export const downOperation = t.intersection([
    BoardPosition.downOperation,
    t.partial({
        cellH: numberDownOperation,
        cellW: numberDownOperation,
        cellX: numberDownOperation,
        cellY: numberDownOperation,
        isCellMode: booleanDownOperation,
    }),
]);

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = t.intersection([
    BoardPosition.upOperation,
    t.partial({
        cellH: numberUpOperation,
        cellW: numberUpOperation,
        cellX: numberUpOperation,
        cellY: numberUpOperation,
        isCellMode: booleanUpOperation,
    }),
]);

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = BoardPosition.TwoWayOperation & {
    cellH?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellW?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellX?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellY?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    isCellMode?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
};
