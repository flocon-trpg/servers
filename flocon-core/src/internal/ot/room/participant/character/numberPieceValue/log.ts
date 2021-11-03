import * as t from 'io-ts';
import { recordUpOperationElementFactory } from '../../../../util/recordOperationElement';
import * as NumberPieceValueTypes from './types';
import * as PieceTypes from '../../../../piece/types';
import { record } from '../../../../util/record';
import { createType, deleteType, updateType } from '../../../../piece/log';
import { maybe } from '../../../../../maybe';

const update = t.intersection([
    t.type({
        $r: t.literal(1),

        type: t.literal(updateType),
        isValueChanged: t.boolean,
    }),
    t.partial({
        isValuePrivateChanged: t.type({ newValue: maybe(t.number) }),
        pieces: record(
            t.string,
            record(
                t.string,
                recordUpOperationElementFactory(PieceTypes.state, PieceTypes.upOperation)
            )
        ),
    }),
]);

export const type = t.union([
    t.type({
        $r: t.literal(1),
        type: t.literal(createType),
        value: NumberPieceValueTypes.state,
    }),
    t.type({
        $r: t.literal(1),
        type: t.literal(deleteType),
        value: NumberPieceValueTypes.state,
    }),
    update,
]);

export const exactType = t.union([
    t.strict({
        $r: t.literal(1),
        type: t.literal(createType),
        value: NumberPieceValueTypes.state,
    }),
    t.strict({
        $r: t.literal(1),
        type: t.literal(deleteType),
        value: NumberPieceValueTypes.state,
    }),
    t.exact(update),
]);

export type Type = t.TypeOf<typeof type>;

export const ofOperation = (
    operation: NumberPieceValueTypes.TwoWayOperation,
    currentState: NumberPieceValueTypes.State
): Type => {
    return {
        $r: 1,
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
