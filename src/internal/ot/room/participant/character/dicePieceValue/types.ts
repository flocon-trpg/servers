import * as t from 'io-ts';
import { DualKeyRecordTwoWayOperation } from '../../../../util/dualKeyRecordOperation';
import * as DieValueTypes from './dieValue/types';
import * as PieceTypes from '../../../../piece/types';
import {
    recordDownOperationElementFactory,
    recordUpOperationElementFactory,
} from '../../../../util/recordOperationElement';
import { createOperation } from '../../../../util/createOperation';
import { record } from '../../../../util/record';
import { RecordTwoWayOperation } from '../../../../util/recordOperation';

export const dicePieceValueStrIndexes = ['1', '2', '3', '4'] as const;

export const state = t.type({
    $v: t.literal(1),
    dice: record(t.string, DieValueTypes.state),
    pieces: record(t.string, record(t.string, PieceTypes.state)),
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(1, {
    dice: record(
        t.string,
        recordDownOperationElementFactory(DieValueTypes.state, DieValueTypes.downOperation)
    ),
    pieces: record(
        t.string,
        record(
            t.string,
            recordDownOperationElementFactory(PieceTypes.state, PieceTypes.downOperation)
        )
    ),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(1, {
    dice: record(
        t.string,
        recordUpOperationElementFactory(DieValueTypes.state, DieValueTypes.upOperation)
    ),
    pieces: record(
        t.string,
        record(t.string, recordUpOperationElementFactory(PieceTypes.state, PieceTypes.upOperation))
    ),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 1;
    dice?: RecordTwoWayOperation<DieValueTypes.State, DieValueTypes.TwoWayOperation>;
    pieces?: DualKeyRecordTwoWayOperation<PieceTypes.State, PieceTypes.TwoWayOperation>;
};
