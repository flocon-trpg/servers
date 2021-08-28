import * as t from 'io-ts';
import {
    recordUpOperationElementFactory,
    replace as replaceKey,
    update as updateKey,
} from '../../../../util/recordOperationElement';
import * as DicePieceValue from './v1';
import * as Piece from '../../../../piece/v1';
import * as DieValue from './dieValue/v1';
import { chooseRecord } from '@kizahasi/util';
import { createOperation } from '../../../../util/createOperation';
import { record } from '../../../../util/record';
import { createType, deleteType, updateType } from '../../../../piece/log-v1';
import { maybe } from '../../../../../maybe';

const dieValueUpOperation = createOperation(1, {
    dieType: t.type({ newValue: DieValue.dieType }),
    isValuePrivateChanged: t.type({ newValue: maybe(t.number) }),
    isValueChanged: t.boolean,
});

type DieValueUpOperation = t.TypeOf<typeof dieValueUpOperation>;

const update = t.intersection([
    t.type({
        $version: t.literal(1),

        type: t.literal(updateType),
    }),
    t.partial({
        dice: record(
            t.string,
            recordUpOperationElementFactory(DieValue.state, dieValueUpOperation)
        ),
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
        value: DicePieceValue.state,
    }),
    t.type({
        $version: t.literal(1),
        type: t.literal(deleteType),
        value: DicePieceValue.state,
    }),
    update,
]);

export const exactType = t.union([
    t.strict({
        $version: t.literal(1),
        type: t.literal(createType),
        value: DicePieceValue.state,
    }),
    t.strict({
        $version: t.literal(1),
        type: t.literal(deleteType),
        value: DicePieceValue.state,
    }),
    t.exact(update),
]);

export type Type = t.TypeOf<typeof type>;

export const ofOperation = (
    operation: DicePieceValue.TwoWayOperation,
    currentState: DicePieceValue.State
): Type => {
    return {
        $version: 1,
        type: updateType,
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
                                  $version: 1,
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
                              const newValue: DieValue.State | undefined =
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
