import * as t from 'io-ts';
import * as ReplaceOperation from '../../util/replaceOperation';
import { createOperation } from '../../util/createOperation';
import { record } from '../../util/record';
import { FilePath, filePath } from '../../filePath/types';
import * as TextOperation from '../../util/textOperation';
import * as NullableTextOperation from '../../util/nullableTextOperation';
import * as Piece from '../../piece/types';
import {
    recordDownOperationElementFactory,
    recordUpOperationElementFactory,
} from '../../util/recordOperationElement';
import { Maybe, maybe } from '../../../maybe';
import { RecordTwoWayOperation } from '../../util/recordOperation';

export const state = t.type({
    $v: t.literal(2),
    $r: t.literal(1),

    ownerParticipantId: maybe(t.string),
    image: maybe(filePath),
    isPrivate: t.boolean,
    memo: t.string,
    name: maybe(t.string),
    pieces: record(t.string, Piece.state),
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(2, 1, {
    ownerParticipantId: t.type({ oldValue: maybe(t.string) }),
    image: t.type({ oldValue: maybe(filePath) }),
    isPrivate: t.type({ oldValue: t.boolean }),
    memo: TextOperation.downOperation,
    name: NullableTextOperation.downOperation,
    pieces: record(t.string, recordDownOperationElementFactory(Piece.state, Piece.downOperation)),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(2, 1, {
    ownerParticipantId: t.type({ newValue: maybe(t.string) }),
    image: t.type({ newValue: maybe(filePath) }),
    isPrivate: t.type({ newValue: t.boolean }),
    memo: TextOperation.upOperation,
    name: NullableTextOperation.upOperation,
    pieces: record(t.string, recordUpOperationElementFactory(Piece.state, Piece.upOperation)),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 2;
    $r: 1;

    ownerParticipantId?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<string>>;
    image?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<FilePath>>;
    isPrivate?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    memo?: TextOperation.TwoWayOperation;
    name?: NullableTextOperation.TwoWayOperation;
    pieces?: RecordTwoWayOperation<Piece.State, Piece.TwoWayOperation>;
};
