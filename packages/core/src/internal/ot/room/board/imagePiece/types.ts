import * as t from 'io-ts';
import * as ReplaceOperation from '../../../util/replaceOperation';
import { createOperation } from '../../../util/createOperation';
import { FilePath, filePath } from '../../../filePath/types';
import * as BoardPosition from '../../../boardPositionBase/types';
import * as Piece from '../../../pieceBase/types';
import { Maybe, maybe } from '../../../../maybe';

export const state = t.intersection([
    BoardPosition.state,
    Piece.stateBase,
    t.type({
        $v: t.literal(2),
        $r: t.literal(1),

        ownerParticipantId: maybe(t.string),
        image: maybe(filePath),
        isPrivate: t.boolean,
    }),
]);

export type State = t.TypeOf<typeof state>;

export const downOperation = t.intersection([
    BoardPosition.downOperation,
    Piece.downOperationBase,
    createOperation(2, 1, {
        ownerParticipantId: t.type({ oldValue: maybe(t.string) }),
        image: t.type({ oldValue: maybe(filePath) }),
        isPrivate: t.type({ oldValue: t.boolean }),
    }),
]);

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = t.intersection([
    BoardPosition.upOperation,
    Piece.upOperationBase,
    createOperation(2, 1, {
        ownerParticipantId: t.type({ newValue: maybe(t.string) }),
        image: t.type({ newValue: maybe(filePath) }),
        isPrivate: t.type({ newValue: t.boolean }),
    }),
]);

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = Piece.TwoWayOperation & {
    $v: 2;
    $r: 1;

    ownerParticipantId?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<string>>;
    image?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<FilePath>>;
    isPrivate?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
};
