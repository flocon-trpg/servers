import { CompositeKey } from '@kizahasi/util';
import * as t from 'io-ts';
import { compositeKey } from '../compositeKey/types';
import { createOperation } from '../util/createOperation';
import * as ReplaceOperation from '../util/replaceOperation';

const numberDownOperation = t.type({ oldValue: t.number });
const booleanDownOperation = t.type({ oldValue: t.boolean });
const numberUpOperation = t.type({ newValue: t.number });
const booleanUpOperation = t.type({ newValue: t.boolean });

// boardKey変更機能は今の所UIに存在しないので定義していない

export const state = t.type({
    $v: t.literal(1),
    $r: t.literal(1),
    boardKey: compositeKey,
    h: t.number,
    isPrivate: t.boolean,
    w: t.number,
    x: t.number,
    y: t.number,
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(1, 1, {
    boardKey: t.type({ oldValue: compositeKey }),
    h: numberDownOperation,
    isPrivate: booleanDownOperation,
    w: numberDownOperation,
    x: numberDownOperation,
    y: numberDownOperation,
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(1, 1, {
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
    $r: 1;

    boardKey?: ReplaceOperation.ReplaceValueTwoWayOperation<CompositeKey>;
    h?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    isPrivate?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    w?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    x?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    y?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
};
