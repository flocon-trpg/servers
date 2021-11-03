import * as t from 'io-ts';
import { DualKeyRecordTwoWayOperation } from '../../../../util/dualKeyRecordOperation';
import * as PieceTypes from '../../../../piece/types';
import {
    recordDownOperationElementFactory,
    recordUpOperationElementFactory,
} from '../../../../util/recordOperationElement';
import * as ReplaceOperation from '../../../../util/replaceOperation';
import { createOperation } from '../../../../util/createOperation';
import { record } from '../../../../util/record';

export const state = t.type({
    $v: t.literal(1),
    $r: t.literal(1),
    isValuePrivate: t.boolean,
    value: t.number,
    pieces: record(t.string, record(t.string, PieceTypes.state)),
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(1, 1, {
    isValuePrivate: t.type({ oldValue: t.boolean }),
    value: t.type({ oldValue: t.number }),
    pieces: record(
        t.string,
        record(
            t.string,
            recordDownOperationElementFactory(PieceTypes.state, PieceTypes.downOperation)
        )
    ),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(1, 1, {
    isValuePrivate: t.type({ newValue: t.boolean }),
    value: t.type({ newValue: t.number }),
    pieces: record(
        t.string,
        record(t.string, recordUpOperationElementFactory(PieceTypes.state, PieceTypes.upOperation))
    ),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 1;
    $r: 1;
    isValuePrivate?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    value?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    pieces?: DualKeyRecordTwoWayOperation<PieceTypes.State, PieceTypes.TwoWayOperation>;
};
