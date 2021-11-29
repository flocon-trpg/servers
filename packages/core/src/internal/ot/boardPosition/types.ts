import * as t from 'io-ts';
import { Maybe, maybe } from '../../maybe';
import { createOperation } from '../util/createOperation';
import * as ReplaceOperation from '../util/replaceOperation';

const numberDownOperation = t.type({ oldValue: t.number });
const booleanDownOperation = t.type({ oldValue: t.boolean });
const numberUpOperation = t.type({ newValue: t.number });
const booleanUpOperation = t.type({ newValue: t.boolean });

// boardId変更機能は今の所UIに存在しないので定義していない

export const state = t.type({
    $v: t.literal(2),
    $r: t.literal(1),
    boardId: t.string,
    h: t.number,
    isPositionLocked: t.boolean,
    isPrivate: t.boolean,

    /**
     * To 3rd-party developers: Please always set undefined because it is not implemented yet in the official web-server.
     */
    opacity: maybe(t.number),

    w: t.number,
    x: t.number,
    y: t.number,
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(2, 1, {
    boardId: t.type({ oldValue: t.string }),
    h: numberDownOperation,
    isPositionLocked: booleanDownOperation,
    isPrivate: booleanDownOperation,
    opacity: t.type({ oldValue: maybe(t.number) }),
    w: numberDownOperation,
    x: numberDownOperation,
    y: numberDownOperation,
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(2, 1, {
    boardId: t.type({ newValue: t.string }),
    h: numberUpOperation,
    isPositionLocked: booleanUpOperation,
    isPrivate: booleanUpOperation,
    opacity: t.type({ newValue: maybe(t.number) }),
    w: numberUpOperation,
    x: numberUpOperation,
    y: numberUpOperation,
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 2;
    $r: 1;

    boardId?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    h?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    isPositionLocked?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    isPrivate?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    opacity?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<number>>;
    w?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    x?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    y?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
};
