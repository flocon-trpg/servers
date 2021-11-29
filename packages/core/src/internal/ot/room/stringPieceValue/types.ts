import * as t from 'io-ts';
import * as PieceTypes from '../../piece/types';
import {
    recordDownOperationElementFactory,
    recordUpOperationElementFactory,
} from '../../util/recordOperationElement';
import * as ReplaceOperation from '../../util/replaceOperation';
import { createOperation } from '../../util/createOperation';
import { record } from '../../util/record';
import * as TextOperation from '../../util/textOperation';
import * as NullableTextOperation from '../../util/nullableTextOperation';
import { Maybe, maybe } from '../../../maybe';
import { RecordTwoWayOperation } from '../../util/recordOperation';

export const String = 'String';
export const Number = 'Number';

const valueInputType = t.union([t.literal(String), t.literal(Number)]);
type ValueInputType = t.TypeOf<typeof valueInputType>;

export const state = t.type({
    $v: t.literal(2),
    $r: t.literal(1),

    ownerCharacterId: maybe(t.string),
    isValuePrivate: t.boolean,
    value: t.string,
    valueInputType: maybe(valueInputType),

    /**
     * To 3rd-party developers: Please always set undefined or empty string because it is not implemented yet in the official web-server.
     */
    memo: maybe(t.string),

    name: maybe(t.string),
    pieces: record(t.string, PieceTypes.state),
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(2, 1, {
    ownerCharacterId: t.type({ oldValue: maybe(t.string) }),
    isValuePrivate: t.type({ oldValue: t.boolean }),
    value: TextOperation.downOperation,
    valueInputType: t.type({ oldValue: maybe(valueInputType) }),
    memo: NullableTextOperation.downOperation,
    name: NullableTextOperation.downOperation,
    pieces: record(
        t.string,
        recordDownOperationElementFactory(PieceTypes.state, PieceTypes.downOperation)
    ),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(2, 1, {
    ownerCharacterId: t.type({ newValue: maybe(t.string) }),
    isValuePrivate: t.type({ newValue: t.boolean }),
    value: TextOperation.upOperation,
    valueInputType: t.type({ newValue: maybe(valueInputType) }),
    memo: NullableTextOperation.upOperation,
    name: NullableTextOperation.upOperation,
    pieces: record(
        t.string,
        recordUpOperationElementFactory(PieceTypes.state, PieceTypes.upOperation)
    ),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 2;
    $r: 1;

    ownerCharacterId?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<string>>;
    isValuePrivate?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    value?: TextOperation.TwoWayOperation;
    valueInputType?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<ValueInputType>>;
    memo?: NullableTextOperation.TwoWayOperation;
    name?: NullableTextOperation.TwoWayOperation;
    pieces?: RecordTwoWayOperation<PieceTypes.State, PieceTypes.TwoWayOperation>;
};
