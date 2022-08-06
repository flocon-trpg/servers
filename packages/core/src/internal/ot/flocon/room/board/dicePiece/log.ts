import * as t from 'io-ts';
import {
    recordUpOperationElementFactory,
    replace as replaceKey,
    update as updateKey,
} from '../../../../util/recordOperationElement';
import * as DicePieceValueTypes from './types';
import * as PieceBaseTypes from '../../../piece/types';
import * as DieValue from './dieValue/functions';
import * as DieValueTypes from './dieValue/types';
import { chooseRecord } from '@flocon-trpg/utils';
import { createOperation } from '../../../../util/createOperation';
import { record } from '../../../../util/record';
import { createType, deleteType, updateType } from '../../../piece/log';
import { maybe } from '../../../../../maybe';
import {
    IoTsOptions,
    State,
    TwoWayOperation,
    createObjectValueTemplate,
    state,
    toUpOperation,
    upOperation,
} from '../../../../generator';

const dieValueUpOperation = createOperation(1, 1, {
    dieType: t.type({ newValue: DieValueTypes.dieType }),
    isValuePrivateChanged: t.type({ newValue: maybe(t.number) }),
    isValueChanged: t.boolean,
});

type DieValueUpOperation = t.TypeOf<typeof dieValueUpOperation>;

const update = (options: IoTsOptions) =>
    t.intersection([
        t.type({
            $v: t.literal(2),
            $r: t.literal(1),

            type: t.literal(updateType),
        }),
        upOperation(createObjectValueTemplate(PieceBaseTypes.templateValue, 2, 1), options),
        t.partial({
            ownerCharacterId: t.type({ newValue: maybe(t.string) }),
            dice: record(
                t.string,
                recordUpOperationElementFactory(
                    state(DieValueTypes.template, options),
                    dieValueUpOperation
                )
            ),
        }),
    ]);

export const type = t.union([
    t.type({
        $v: t.literal(2),
        $r: t.literal(1),
        type: t.literal(createType),
        value: state(DicePieceValueTypes.template, { exact: false }),
    }),
    t.type({
        $v: t.literal(2),
        $r: t.literal(1),
        type: t.literal(deleteType),
        value: state(DicePieceValueTypes.template, { exact: false }),
    }),
    update({ exact: false }),
]);

export const exactType = t.union([
    t.strict({
        $v: t.literal(2),
        $r: t.literal(1),
        type: t.literal(createType),
        value: state(DicePieceValueTypes.template, { exact: true }),
    }),
    t.strict({
        $v: t.literal(2),
        $r: t.literal(1),
        type: t.literal(deleteType),
        value: state(DicePieceValueTypes.template, { exact: true }),
    }),
    update({ exact: true }),
]);
export type Type = t.TypeOf<typeof type>;

export const ofOperation = (
    operation: TwoWayOperation<typeof DicePieceValueTypes.template>,
    currentState: State<typeof DicePieceValueTypes.template>
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
    return exactType.encode(result);
};
