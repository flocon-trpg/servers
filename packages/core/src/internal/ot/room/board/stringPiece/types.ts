import * as t from 'io-ts';
import * as Piece from '../../../pieceBase/types';
import * as ReplaceOperation from '../../../util/replaceOperation';
import { createOperation } from '../../../util/createOperation';
import * as TextOperation from '../../../util/textOperation';
import { Maybe, maybe } from '../../../../maybe';

export const String = 'String';
export const Number = 'Number';

const valueInputType = t.union([t.literal(String), t.literal(Number)]);
type ValueInputType = t.TypeOf<typeof valueInputType>;

export const state = t.intersection([
    Piece.state,
    t.type({
        $v: t.literal(2),
        $r: t.literal(1),

        ownerCharacterId: maybe(t.string),
        isValuePrivate: t.boolean,
        value: t.string,
        valueInputType: maybe(valueInputType),
    }),
]);

export type State = t.TypeOf<typeof state>;

export const downOperation = t.intersection([
    Piece.downOperation,
    createOperation(2, 1, {
        ownerCharacterId: t.type({ oldValue: maybe(t.string) }),
        isValuePrivate: t.type({ oldValue: t.boolean }),
        value: TextOperation.downOperation,
        valueInputType: t.type({ oldValue: maybe(valueInputType) }),
    }),
]);

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = t.intersection([
    Piece.upOperation,
    createOperation(2, 1, {
        ownerCharacterId: t.type({ newValue: maybe(t.string) }),
        isValuePrivate: t.type({ newValue: t.boolean }),
        value: TextOperation.upOperation,
        valueInputType: t.type({ newValue: maybe(valueInputType) }),
    }),
]);

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = Piece.TwoWayOperation & {
    $v: 2;
    $r: 1;

    ownerCharacterId?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<string>>;
    isValuePrivate?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    value?: TextOperation.TwoWayOperation;
    valueInputType?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<ValueInputType>>;
};
