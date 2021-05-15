import * as t from 'io-ts';
import { recordUpOperationElementFactory } from '../../util/recordOperationElement';
import * as MyNumberValue from './v1';
import * as Piece from '../../../piece/v1';

export const updateType = 'update';
export const createType = 'create';
export const deleteType = 'delete';

const update = t.intersection([t.type({
    type: t.literal(updateType),
    value: t.boolean,
    isValuePrivate: t.boolean,
}), t.partial({
    pieces: t.record(t.string, t.record(t.string, recordUpOperationElementFactory(Piece.state, Piece.upOperation))),
})]);

export const main = t.union([
    t.type({ type: t.literal(createType) }),
    t.type({ type: t.literal(deleteType) }),
    update,
]);

export const exactMain = t.union([
    t.strict({ type: t.literal(createType) }),
    t.strict({ type: t.literal(deleteType) }),
    t.exact(update),
]);

export type Main = t.TypeOf<typeof main>;

export const ofOperation = (source: MyNumberValue.TwoWayOperation): Main => {
    return {
        type: updateType,
        value: source.value != null && source.value.oldValue !== source.value.newValue,
        isValuePrivate: source.isValuePrivate != null && source.isValuePrivate.oldValue !== source.isValuePrivate.newValue,
        pieces: source.pieces,
    };
};