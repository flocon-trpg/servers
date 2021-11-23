import * as t from 'io-ts';
import { createOperation } from '../util/createOperation';
import * as ReplaceOperation from '../util/replaceOperation';

const numberDownOperation = t.type({ oldValue: t.number });
const booleanDownOperation = t.type({ oldValue: t.boolean });
const numberUpOperation = t.type({ newValue: t.number });
const booleanUpOperation = t.type({ newValue: t.boolean });

// boardId:変更機能は今の所UIに存在しないので定義していない

export const state = t.type({
    $v: t.literal(2),
    $r: t.literal(1),

    boardId: t.string,
    cellH: t.number,
    cellW: t.number,
    cellX: t.number,
    cellY: t.number,
    h: t.number,
    isCellMode: t.boolean,
    isPrivate: t.boolean,
    w: t.number,
    x: t.number,
    y: t.number,
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(2, 1, {
    boardId: t.type({ oldValue: t.string }),
    cellH: numberDownOperation,
    cellW: numberDownOperation,
    cellX: numberDownOperation,
    cellY: numberDownOperation,
    h: numberDownOperation,
    isCellMode: booleanDownOperation,
    isPrivate: booleanDownOperation,
    w: numberDownOperation,
    x: numberDownOperation,
    y: numberDownOperation,
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(2, 1, {
    boardId: t.type({ newValue: t.string }),
    cellH: numberUpOperation,
    cellW: numberUpOperation,
    cellX: numberUpOperation,
    cellY: numberUpOperation,
    h: numberUpOperation,
    isCellMode: booleanUpOperation,
    isPrivate: booleanUpOperation,
    w: numberUpOperation,
    x: numberUpOperation,
    y: numberUpOperation,
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 2;
    $r: 1;

    boardId?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    cellH?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellW?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellX?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellY?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    h?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    isCellMode?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    isPrivate?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    w?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    x?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    y?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
};
