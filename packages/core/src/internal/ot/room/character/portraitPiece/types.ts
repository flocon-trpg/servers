import * as t from 'io-ts';
import * as BoardPositionBase from '../../../boardPositionBase/types';
import { createOperation } from '../../../util/createOperation';
import { ReplaceValueTwoWayOperation } from '../../../util/replaceOperation';

const booleanDownOperation = t.type({ oldValue: t.boolean });
const booleanUpOperation = t.type({ newValue: t.boolean });

// boardId変更機能は今の所UIに存在しないので定義していない

export const state = t.intersection([
    BoardPositionBase.state,
    t.type({
        $v: t.literal(2),
        $r: t.literal(1),

        boardId: t.string,
        isPrivate: t.boolean,
    }),
]);

export type State = t.TypeOf<typeof state>;

export const downOperation = t.intersection([
    BoardPositionBase.downOperation,
    createOperation(2, 1, {
        isPrivate: booleanDownOperation,
    }),
]);

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = t.intersection([
    BoardPositionBase.upOperation,
    createOperation(2, 1, {
        isPrivate: booleanUpOperation,
    }),
]);

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = BoardPositionBase.TwoWayOperation & {
    $v: 2;
    $r: 1;

    isPrivate?: ReplaceValueTwoWayOperation<boolean>;
};
