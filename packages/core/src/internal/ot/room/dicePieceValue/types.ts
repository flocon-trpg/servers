import * as t from 'io-ts';
import * as DieValueTypes from './dieValue/types';
import * as PieceTypes from '../../piece/types';
import {
    recordDownOperationElementFactory,
    recordUpOperationElementFactory,
} from '../../util/recordOperationElement';
import { createOperation } from '../../util/createOperation';
import { record } from '../../util/record';
import { RecordTwoWayOperation } from '../../util/recordOperation';
import { Maybe, maybe } from '../../../maybe';
import { ReplaceValueTwoWayOperation } from '../../util/replaceOperation';
import * as NullableTextOperation from '../../util/nullableTextOperation';

export const dicePieceValueStrIndexes = ['1', '2', '3', '4'] as const;

export const state = t.type({
    $v: t.literal(2),
    $r: t.literal(1),

    ownerCharacterId: maybe(t.string),

    /**
     * To 3rd-party developers: Please always set undefined or empty string because it is not implemented yet in the official web-server.
     */
    memo: maybe(t.string),

    name: maybe(t.string),
    dice: record(t.string, DieValueTypes.state),
    pieces: record(t.string, PieceTypes.state),
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(2, 1, {
    ownerCharacterId: t.type({ oldValue: maybe(t.string) }),
    memo: NullableTextOperation.downOperation,
    name: NullableTextOperation.downOperation,
    dice: record(
        t.string,
        recordDownOperationElementFactory(DieValueTypes.state, DieValueTypes.downOperation)
    ),
    pieces: record(
        t.string,
        recordDownOperationElementFactory(PieceTypes.state, PieceTypes.downOperation)
    ),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(2, 1, {
    ownerCharacterId: t.type({ newValue: maybe(t.string) }),
    memo: NullableTextOperation.upOperation,
    name: NullableTextOperation.upOperation,
    dice: record(
        t.string,
        recordUpOperationElementFactory(DieValueTypes.state, DieValueTypes.upOperation)
    ),
    pieces: record(
        t.string,
        recordUpOperationElementFactory(PieceTypes.state, PieceTypes.upOperation)
    ),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 2;
    $r: 1;

    ownerCharacterId?: ReplaceValueTwoWayOperation<Maybe<string>>;
    memo?: NullableTextOperation.TwoWayOperation;
    name?: NullableTextOperation.TwoWayOperation;
    dice?: RecordTwoWayOperation<DieValueTypes.State, DieValueTypes.TwoWayOperation>;
    pieces?: RecordTwoWayOperation<PieceTypes.State, PieceTypes.TwoWayOperation>;
};
