import * as t from 'io-ts';
import { Maybe, maybe } from '../../maybe';
import * as ReplaceOperation from '../util/replaceOperation';
import * as NullableTextOperation from '../util/nullableTextOperation';

const numberDownOperation = t.type({ oldValue: t.number });
const booleanDownOperation = t.type({ oldValue: t.boolean });
const numberUpOperation = t.type({ newValue: t.number });
const booleanUpOperation = t.type({ newValue: t.boolean });

export const state = t.type({
    h: t.number,
    isPositionLocked: t.boolean,

    /**
     * @description To 3rd-party developers: Please always set undefined to this if it is CharacterPiece or PortraitPiece.
     */
    memo: maybe(t.string),

    /**
     * @description To 3rd-party developers: Please always set undefined to this if it is CharacterPiece or PortraitPiece.
     */
    name: maybe(t.string),

    /**
     * @description To 3rd-party developers: Please always set undefined to this because it is not implemented yet in the official web-server.
     */
    opacity: maybe(t.number),

    w: t.number,
    x: t.number,
    y: t.number,
});

export type State = t.TypeOf<typeof state>;

export const downOperation = t.partial({
    h: numberDownOperation,
    isPositionLocked: booleanDownOperation,
    memo: NullableTextOperation.downOperation,
    name: NullableTextOperation.downOperation,
    opacity: t.type({ oldValue: maybe(t.number) }),
    w: numberDownOperation,
    x: numberDownOperation,
    y: numberDownOperation,
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = t.partial({
    h: numberUpOperation,
    isPositionLocked: booleanUpOperation,
    memo: NullableTextOperation.upOperation,
    name: NullableTextOperation.upOperation,
    opacity: t.type({ newValue: maybe(t.number) }),
    w: numberUpOperation,
    x: numberUpOperation,
    y: numberUpOperation,
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    h?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    isPositionLocked?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    memo?: NullableTextOperation.TwoWayOperation;
    name?: NullableTextOperation.TwoWayOperation;
    opacity?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<number>>;
    w?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    x?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    y?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
};
