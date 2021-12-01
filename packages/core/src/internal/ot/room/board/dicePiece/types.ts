import * as t from 'io-ts';
import * as DieValueTypes from './dieValue/types';
import {
    recordDownOperationElementFactory,
    recordUpOperationElementFactory,
} from '../../../util/recordOperationElement';
import { createOperation } from '../../../util/createOperation';
import { record } from '../../../util/record';
import { RecordTwoWayOperation } from '../../../util/recordOperation';
import { Maybe, maybe } from '../../../../maybe';
import { ReplaceValueTwoWayOperation } from '../../../util/replaceOperation';
import * as Piece from '../../../pieceBase/types';

export const dicePieceStrIndexes = ['1', '2', '3', '4'] as const;

export const state = t.intersection([
    Piece.state,
    t.type({
        $v: t.literal(2),
        $r: t.literal(1),

        ownerCharacterId: maybe(t.string),
        dice: record(t.string, DieValueTypes.state),
    }),
]);

export type State = t.TypeOf<typeof state>;

export const downOperation = t.intersection([
    Piece.downOperation,
    createOperation(2, 1, {
        ownerCharacterId: t.type({ oldValue: maybe(t.string) }),
        dice: record(
            t.string,
            recordDownOperationElementFactory(DieValueTypes.state, DieValueTypes.downOperation)
        ),
    }),
]);

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = t.intersection([
    Piece.upOperation,
    createOperation(2, 1, {
        ownerCharacterId: t.type({ newValue: maybe(t.string) }),
        dice: record(
            t.string,
            recordUpOperationElementFactory(DieValueTypes.state, DieValueTypes.upOperation)
        ),
    }),
]);

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = Piece.TwoWayOperation & {
    $v: 2;
    $r: 1;

    ownerCharacterId?: ReplaceValueTwoWayOperation<Maybe<string>>;
    dice?: RecordTwoWayOperation<DieValueTypes.State, DieValueTypes.TwoWayOperation>;
};
