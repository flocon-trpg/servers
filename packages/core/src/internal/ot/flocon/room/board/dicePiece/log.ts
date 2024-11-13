import { chooseRecord } from '@flocon-trpg/utils';
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
import { record } from '../../../../record';
import {
    recordUpOperationElementFactory,
    replace as replaceKey,
    update as updateKey,
} from '../../../../recordOperationElement';
import { createOperation } from '../../../../util/createOperation';
import { createType, deleteType, updateType } from '../../../piece/log';
import * as PieceBaseTypes from '../../../piece/types';
import * as DieValue from './dieValue/functions';
import * as DieValueTypes from './dieValue/types';
import * as DicePieceValueTypes from './types';

const dieValueUpOperation = createOperation(1, 1, {
    dieType: z.object({ newValue: DieValueTypes.dieType }),
    isValuePrivateChanged: z.object({ newValue: maybe(z.number()) }),
    isValueChanged: z.boolean(),
});

type DieValueUpOperation = z.TypeOf<typeof dieValueUpOperation>;

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
                dice: record(
                    recordUpOperationElementFactory(
                        state(DieValueTypes.template),
                        dieValueUpOperation,
                    ),
                ),
            })
            .partial(),
    );

export const type = z.union([
    z.object({
        $v: z.literal(2),
        $r: z.literal(1),
        type: z.literal(createType),
        value: state(DicePieceValueTypes.template),
    }),
    z.object({
        $v: z.literal(2),
        $r: z.literal(1),
        type: z.literal(deleteType),
        value: state(DicePieceValueTypes.template),
    }),
    update,
]);

export type Type = z.TypeOf<typeof type>;

export const ofOperation = (
    operation: TwoWayOperation<typeof DicePieceValueTypes.template>,
    currentState: State<typeof DicePieceValueTypes.template>,
): Type => {
    const result = {
        ...toUpOperation(DicePieceValueTypes.template)(operation),
        $v: 2,
        $r: 1,
        type: updateType,
        ownerCharacterId: operation.ownerCharacterId,
        dice:
            operation.dice == null
                ? undefined
                : chooseRecord(operation.dice, (element, key) => {
                      switch (element.type) {
                          case updateKey: {
                              const currentDiceState = (currentState.dice ?? {})[key];
                              if (currentDiceState == null) {
                                  throw new Error('this should not happen');
                              }
                              const update: DieValueUpOperation = {
                                  $v: 1,
                                  $r: 1,
                                  dieType: element.update.dieType,
                                  isValuePrivateChanged:
                                      element.update.isValuePrivate == null ||
                                      element.update.isValuePrivate.oldValue ===
                                          element.update.isValuePrivate.newValue
                                          ? undefined
                                          : {
                                                newValue: element.update.isValuePrivate.newValue
                                                    ? undefined
                                                    : currentDiceState.value,
                                            },
                                  isValueChanged: element.update.value != null,
                              };
                              return {
                                  type: updateKey,
                                  update,
                              } as const;
                          }
                          case replaceKey: {
                              const newValue: State<typeof DieValueTypes.template> | undefined =
                                  element.replace.newValue == null
                                      ? undefined
                                      : DieValue.toClientState(false)(element.replace.newValue);
                              return {
                                  type: replaceKey,
                                  replace: {
                                      newValue,
                                  },
                              } as const;
                          }
                      }
                  }),
    } as const;
    return type.parse(result);
};
