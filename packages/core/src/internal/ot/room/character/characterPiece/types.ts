import * as t from 'io-ts';
import * as BoardPosition from '../../../boardPositionBase/types';
import * as Piece from '../../../pieceBase/types';
import { createOperation } from '../../../util/createOperation';
import { ReplaceValueTwoWayOperation } from '../../../util/replaceOperation';

const booleanDownOperation = t.type({ oldValue: t.boolean });
const booleanUpOperation = t.type({ newValue: t.boolean });

// boardId変更機能は今の所UIに存在しないので定義していない

export const state = t.intersection([
    BoardPosition.state,
    Piece.stateBase,
    t.type({
        $v: t.literal(2),
        $r: t.literal(1),

        boardId: t.string,
        isPrivate: t.boolean,
    }),
]);

export type State = t.TypeOf<typeof state>;

export const downOperation = t.intersection([
    BoardPosition.downOperation,
    Piece.downOperationBase,
    createOperation(2, 1, {
        isPrivate: booleanDownOperation,
    }),
]);

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = t.intersection([
    BoardPosition.upOperation,
    Piece.upOperationBase,
    createOperation(2, 1, {
        isPrivate: booleanUpOperation,
    }),
]);

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = Piece.TwoWayOperation & {
    $v: 2;
    $r: 1;

    isPrivate?: ReplaceValueTwoWayOperation<boolean>;
};
