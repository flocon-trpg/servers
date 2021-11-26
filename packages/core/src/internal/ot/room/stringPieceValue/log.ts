import * as t from 'io-ts';
import { recordUpOperationElementFactory } from '../../util/recordOperationElement';
import * as StringPieceValueTypes from './types';
import * as PieceTypes from '../../piece/types';
import { record } from '../../util/record';
import { createType, deleteType, updateType } from '../../piece/log';
import { maybe } from '../../../maybe';

const update = t.intersection([
    t.type({
        $v: t.literal(2),
        $r: t.literal(1),

        type: t.literal(updateType),
    }),
    t.partial({
        isValuePrivateChanged: t.type({ newValue: maybe(t.string) }),
        isValueChanged: t.boolean,
        pieces: record(
            t.string,
            recordUpOperationElementFactory(PieceTypes.state, PieceTypes.upOperation)
        ),
    }),
]);

export const type = t.union([
    t.type({
        $v: t.literal(2),
        $r: t.literal(1),
        type: t.literal(createType),
        value: StringPieceValueTypes.state,
    }),
    t.type({
        $v: t.literal(2),
        $r: t.literal(1),
        type: t.literal(deleteType),
        value: StringPieceValueTypes.state,
    }),
    update,
]);

export const exactType = t.union([
    t.strict({
        $v: t.literal(2),
        $r: t.literal(1),
        type: t.literal(createType),
        value: StringPieceValueTypes.state,
    }),
    t.strict({
        $v: t.literal(2),
        $r: t.literal(1),
        type: t.literal(deleteType),
        value: StringPieceValueTypes.state,
    }),
    t.exact(update),
]);

export type Type = t.TypeOf<typeof type>;

export const ofOperation = (
    operation: StringPieceValueTypes.TwoWayOperation,
    currentState: StringPieceValueTypes.State
): Type => {
    return {
        $v: 2,
        $r: 1,
        type: updateType,
        isValueChanged: operation.value != null,
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
