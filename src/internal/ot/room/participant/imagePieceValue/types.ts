import * as t from 'io-ts';
import * as ReplaceOperation from '../../../util/replaceOperation';
import { createOperation } from '../../../util/createOperation';
import { record } from '../../../util/record';
import { FilePath, filePath } from '../../../filePath/types';
import * as TextOperation from '../../../util/textOperation';
import * as Piece from '../../../piece/types';
import {
    recordDownOperationElementFactory,
    recordUpOperationElementFactory,
} from '../../../util/recordOperationElement';
import * as DualKeyRecordOperation from '../../../util/dualKeyRecordOperation';
import { Maybe, maybe } from '../../../../maybe';

export const state = t.type({
    $v: t.literal(1),
    image: maybe(filePath),
    isPrivate: t.boolean,
    memo: t.string,
    name: t.string,
    pieces: record(t.string, record(t.string, Piece.state)),
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(1, {
    image: t.type({ oldValue: maybe(filePath) }),
    isPrivate: t.type({ oldValue: t.boolean }),
    memo: TextOperation.downOperation,
    name: t.type({ oldValue: t.string }),
    pieces: record(
        t.string,
        record(t.string, recordDownOperationElementFactory(Piece.state, Piece.downOperation))
    ),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(1, {
    image: t.type({ newValue: maybe(filePath) }),
    isPrivate: t.type({ newValue: t.boolean }),
    memo: TextOperation.upOperation,
    name: t.type({ newValue: t.string }),
    pieces: record(
        t.string,
        record(t.string, recordUpOperationElementFactory(Piece.state, Piece.upOperation))
    ),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 1;
    image?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<FilePath>>;
    isPrivate?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    memo?: TextOperation.TwoWayOperation;
    name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    pieces?: DualKeyRecordOperation.DualKeyRecordTwoWayOperation<
        Piece.State,
        Piece.TwoWayOperation
    >;
};
