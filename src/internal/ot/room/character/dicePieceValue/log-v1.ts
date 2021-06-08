import * as t from 'io-ts';
import {
    recordUpOperationElementFactory,
    replace as replaceKey,
    update as updateKey,
} from '../../util/recordOperationElement';
import * as DicePieceValue from './v1';
import * as Piece from '../../../piece/v1';
import * as DieValue from './dieValue/v1';
import { chooseRecord } from '@kizahasi/util';
import { createOperation } from '../../util/createOperation';

export const updateType = 'update';
export const createType = 'create';
export const deleteType = 'delete';

const dieValueState = t.type({
    $version: t.literal(1),
    dieType: DieValue.dieType,
    isValuePrivate: t.boolean,
});

type DieValueState = t.TypeOf<typeof dieValueState>;

const dieValueUpOperation = createOperation(1, {
    dieType: t.type({ newValue: DieValue.dieType }),
    isValuePrivate: t.type({ newValue: t.boolean }),
    isValueChanged: t.boolean,
});

type DieValueUpOperation = t.TypeOf<typeof dieValueUpOperation>;

const update = t.intersection([
    t.type({
        $version: t.literal(1),

        type: t.literal(updateType),
    }),
    t.partial({
        dice: t.record(
            t.string,
            recordUpOperationElementFactory(dieValueState, dieValueUpOperation)
        ),
        pieces: t.record(
            t.string,
            t.record(t.string, recordUpOperationElementFactory(Piece.state, Piece.upOperation))
        ),
    }),
]);

export const main = t.union([
    t.type({
        $version: t.literal(1),
        type: t.literal(createType),
    }),
    t.type({
        $version: t.literal(1),
        type: t.literal(deleteType),
    }),
    update,
]);

export const exactMain = t.union([
    t.strict({
        $version: t.literal(1),
        type: t.literal(createType),
    }),
    t.strict({
        $version: t.literal(1),
        type: t.literal(deleteType),
    }),
    t.exact(update),
]);

export type Main = t.TypeOf<typeof main>;

export const ofOperation = (source: DicePieceValue.TwoWayOperation): Main => {
    return {
        $version: 1,
        type: updateType,
        dice:
            source.dice == null
                ? undefined
                : chooseRecord(source.dice, element => {
                      switch (element.type) {
                          case updateKey: {
                              const update: DieValueUpOperation = {
                                  $version: 1,
                                  dieType: element.update.dieType,
                                  isValuePrivate: element.update.isValuePrivate,
                                  isValueChanged: element.update.value != null,
                              };
                              return {
                                  type: updateKey,
                                  update,
                              } as const;
                          }
                          case replaceKey: {
                              const newValue: DieValueState | undefined =
                                  element.replace.newValue == null
                                      ? undefined
                                      : {
                                            $version: 1,
                                            dieType: element.replace.newValue.dieType,
                                            isValuePrivate: element.replace.newValue.isValuePrivate,
                                        };
                              return {
                                  type: replaceKey,
                                  replace: {
                                      newValue,
                                  },
                              } as const;
                          }
                      }
                  }),
        pieces: source.pieces,
    };
};
