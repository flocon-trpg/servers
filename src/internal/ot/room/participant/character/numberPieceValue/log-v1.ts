import * as t from 'io-ts';
import { recordUpOperationElementFactory } from '../../../../util/recordOperationElement';
import * as NumberPieceValue from './v1';
import * as Piece from '../../../../piece/v1';
import { record } from '../../../../util/record';
import { createType, deleteType, updateType } from '../../../../piece/log-v1';
import { maybe } from '../../../../../maybe';

const update = t.intersection([
    t.type({
        $version: t.literal(1),

        type: t.literal(updateType),
        isValueChanged: t.boolean,
    }),
    t.partial({
        isValuePrivateChanged: t.type({ newValue: maybe(t.number) }),
        pieces: record(
            t.string,
            record(t.string, recordUpOperationElementFactory(Piece.state, Piece.upOperation))
        ),
    }),
]);

export const type = t.union([
    t.type({
        $version: t.literal(1),
        type: t.literal(createType),
        value: NumberPieceValue.state,
    }),
    t.type({
        $version: t.literal(1),
        type: t.literal(deleteType),
        value: NumberPieceValue.state,
    }),
    update,
]);

export const exactType = t.union([
    t.strict({
        $version: t.literal(1),
        type: t.literal(createType),
        value: NumberPieceValue.state,
    }),
    t.strict({
        $version: t.literal(1),
        type: t.literal(deleteType),
        value: NumberPieceValue.state,
    }),
    t.exact(update),
]);

export type Type = t.TypeOf<typeof type>;

export const ofOperation = (
    operation: NumberPieceValue.TwoWayOperation,
    currentState: NumberPieceValue.State
): Type => {
    return {
        $version: 1,
        type: updateType,
        isValueChanged:
            operation.value != null && operation.value.oldValue !== operation.value.newValue,
        isValuePrivateChanged:
            operation.isValuePrivate == null ||
            operation.isValuePrivate.oldValue === operation.isValuePrivate.newValue
                ? undefined
                : {
                      newValue: operation.isValuePrivate.newValue ? undefined : currentState.value,
                  },

        pieces: operation.pieces,
    };
};
