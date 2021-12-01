import * as t from 'io-ts';
import * as StringPieceValueTypes from './types';
import * as PieceBase from '../../../pieceBase/functions';
import * as PieceBaseTypes from '../../../pieceBase/types';
import { createType, deleteType, updateType } from '../../../pieceBase/log';
import { maybe } from '../../../../maybe';

const update = t.intersection([
    t.type({
        $v: t.literal(2),
        $r: t.literal(1),

        type: t.literal(updateType),
    }),
    PieceBaseTypes.upOperation,
    t.partial({
        ownerCharacterId: t.type({ newValue: maybe(t.string) }),
        isValuePrivateChanged: t.type({ newValue: maybe(t.string) }),
        isValueChanged: t.boolean,
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
        ...PieceBase.toUpOperation(operation),
        $v: 2,
        $r: 1,
        type: updateType,
        ownerCharacterId: operation.ownerCharacterId,
        isValueChanged: operation.value != null,
        isValuePrivateChanged:
            operation.isValuePrivate == null ||
            operation.isValuePrivate.oldValue === operation.isValuePrivate.newValue
                ? undefined
                : {
                      newValue: operation.isValuePrivate.newValue ? undefined : currentState.value,
                  },
    };
};
