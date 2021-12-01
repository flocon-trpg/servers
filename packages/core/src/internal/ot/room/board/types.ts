import * as t from 'io-ts';
import { filePath } from '../../filePath/types';
import * as ReplaceOperation from '../../util/replaceOperation';
import * as TextOperation from '../../util/textOperation';
import { createOperation } from '../../util/createOperation';
import { Maybe, maybe } from '../../../maybe';
import * as RecordOperation from '../../util/recordOperation';
import { record } from '../../util/record';
import * as DicePiece from './dicePiece/types';
import * as ImagePiece from './imagePiece/types';
import * as StringPiece from './stringPiece/types';
import {
    recordDownOperationElementFactory,
    recordUpOperationElementFactory,
} from '../../util/recordOperationElement';

const numberDownOperation = t.type({ oldValue: t.number });
const numberUpOperation = t.type({ newValue: t.number });

export const state = t.type({
    $v: t.literal(2),
    $r: t.literal(1),

    backgroundImage: maybe(filePath),
    backgroundImageZoom: t.number,
    cellColumnCount: t.number,
    cellHeight: t.number,
    cellOffsetX: t.number,
    cellOffsetY: t.number,
    cellRowCount: t.number,
    cellWidth: t.number,
    name: t.string,
    ownerParticipantId: maybe(t.string),

    dicePieces: record(t.string, DicePiece.state),
    imagePieces: record(t.string, ImagePiece.state),
    stringPieces: record(t.string, StringPiece.state),
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(2, 1, {
    backgroundImage: t.type({ oldValue: maybe(filePath) }),
    backgroundImageZoom: numberDownOperation,
    cellColumnCount: numberDownOperation,
    cellHeight: numberDownOperation,
    cellOffsetX: numberDownOperation,
    cellOffsetY: numberDownOperation,
    cellRowCount: numberDownOperation,
    cellWidth: numberDownOperation,
    name: TextOperation.downOperation,
    ownerParticipantId: t.type({ oldValue: maybe(t.string) }),

    dicePieces: record(
        t.string,
        recordDownOperationElementFactory(DicePiece.state, DicePiece.downOperation)
    ),
    imagePieces: record(
        t.string,
        recordDownOperationElementFactory(ImagePiece.state, ImagePiece.downOperation)
    ),
    stringPieces: record(
        t.string,
        recordDownOperationElementFactory(StringPiece.state, StringPiece.downOperation)
    ),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(2, 1, {
    backgroundImage: t.type({ newValue: maybe(filePath) }),
    backgroundImageZoom: numberUpOperation,
    cellColumnCount: numberUpOperation,
    cellHeight: numberUpOperation,
    cellOffsetX: numberUpOperation,
    cellOffsetY: numberUpOperation,
    cellRowCount: numberUpOperation,
    cellWidth: numberUpOperation,
    name: TextOperation.upOperation,
    ownerParticipantId: t.type({ newValue: maybe(t.string) }),

    dicePieces: record(
        t.string,
        recordUpOperationElementFactory(DicePiece.state, DicePiece.upOperation)
    ),
    imagePieces: record(
        t.string,
        recordUpOperationElementFactory(ImagePiece.state, ImagePiece.upOperation)
    ),
    stringPieces: record(
        t.string,
        recordUpOperationElementFactory(StringPiece.state, StringPiece.upOperation)
    ),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 2;
    $r: 1;

    backgroundImage?: ReplaceOperation.ReplaceValueTwoWayOperation<
        t.TypeOf<typeof filePath> | undefined
    >;
    backgroundImageZoom?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellColumnCount?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellHeight?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellOffsetX?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellOffsetY?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellRowCount?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellWidth?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    name?: TextOperation.TwoWayOperation;
    ownerParticipantId?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<string>>;

    dicePieces?: RecordOperation.RecordTwoWayOperation<DicePiece.State, DicePiece.TwoWayOperation>;
    imagePieces?: RecordOperation.RecordTwoWayOperation<
        ImagePiece.State,
        ImagePiece.TwoWayOperation
    >;
    stringPieces?: RecordOperation.RecordTwoWayOperation<
        StringPiece.State,
        StringPiece.TwoWayOperation
    >;
};
