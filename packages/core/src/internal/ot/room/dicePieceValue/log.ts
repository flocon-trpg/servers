import * as t from 'io-ts';
import {
    recordUpOperationElementFactory,
    replace as replaceKey,
    update as updateKey,
} from '../../util/recordOperationElement';
import * as DicePieceValueTypes from './types';
import * as PieceTypes from '../../piece/types';
import * as DieValue from './dieValue/functions';
import * as DieValueTypes from './dieValue/types';
import { chooseRecord } from '@flocon-trpg/utils';
import { createOperation } from '../../util/createOperation';
import { record } from '../../util/record';
import { createType, deleteType, updateType } from '../../piece/log';
import { maybe } from '../../../maybe';

const dieValueUpOperation = createOperation(1, 1, {
    dieType: t.type({ newValue: DieValueTypes.dieType }),
    isValuePrivateChanged: t.type({ newValue: maybe(t.number) }),
    isValueChanged: t.boolean,
});

type DieValueUpOperation = t.TypeOf<typeof dieValueUpOperation>;

const update = t.intersection([
    t.type({
        $v: t.literal(2),
        $r: t.literal(1),

        type: t.literal(updateType),
    }),
    t.partial({
        ownerCharacterId: t.type({ newValue: maybe(t.string) }),
        dice: record(
            t.string,
            recordUpOperationElementFactory(DieValueTypes.state, dieValueUpOperation)
        ),
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
        value: DicePieceValueTypes.state,
    }),
    t.type({
        $v: t.literal(2),
        $r: t.literal(1),
        type: t.literal(deleteType),
        value: DicePieceValueTypes.state,
    }),
    update,
]);

export const exactType = t.union([
    t.strict({
        $v: t.literal(2),
        $r: t.literal(1),
        type: t.literal(createType),
        value: DicePieceValueTypes.state,
    }),
    t.strict({
        $v: t.literal(2),
        $r: t.literal(1),
        type: t.literal(deleteType),
        value: DicePieceValueTypes.state,
    }),
    t.exact(update),
]);

export type Type = t.TypeOf<typeof type>;

export const ofOperation = (
    operation: DicePieceValueTypes.TwoWayOperation,
    currentState: DicePieceValueTypes.State
): Type => {
    return {
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
                              const currentDiceState = currentState.dice[key];
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
                              const newValue: DieValueTypes.State | undefined =
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
        pieces: operation.pieces,
    };
};
