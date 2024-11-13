import { z } from 'zod';
import { maybe } from '../../../../../maybe';
import { toUpOperation } from '../../../../generator/functions';
import {
    State,
    TwoWayOperation,
    createObjectValueTemplate,
    state,
    upOperation,
} from '../../../../generator/types';
import { createType, deleteType, updateType } from '../../../piece/log';
import * as PieceBaseTypes from '../../../piece/types';
import * as StringPieceValueTypes from './types';

const update = z
    .object({
        $v: z.literal(2),
        $r: z.literal(1),

        type: z.literal(updateType),
    })
    .and(upOperation(createObjectValueTemplate(PieceBaseTypes.templateValue, 2, 1)))
    .and(
        z
            .object({
                ownerCharacterId: z.object({ newValue: maybe(z.string()) }),
                isValuePrivateChanged: z.object({ newValue: maybe(z.string()) }),
                isValueChanged: z.boolean(),
            })
            .partial(),
    );

export const type = z.union([
    z.object({
        $v: z.literal(2),
        $r: z.literal(1),
        type: z.literal(createType),
        value: state(StringPieceValueTypes.template),
    }),
    z.object({
        $v: z.literal(2),
        $r: z.literal(1),
        type: z.literal(deleteType),
        value: state(StringPieceValueTypes.template),
    }),
    update,
]);

export type Type = z.TypeOf<typeof type>;

export const ofOperation = (
    operation: TwoWayOperation<typeof StringPieceValueTypes.template>,
    currentState: State<typeof StringPieceValueTypes.template>,
): Type => {
    const result = {
        ...toUpOperation(StringPieceValueTypes.template)(operation),
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
    } as const;
    return type.parse(result);
};
