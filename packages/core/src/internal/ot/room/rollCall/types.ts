import * as t from 'io-ts';
import { createOperation } from '../../util/createOperation';
import { record } from '../../util/record';
import {
    recordDownOperationElementFactory,
    recordUpOperationElementFactory,
} from '../../util/recordOperationElement';
import * as ReplaceOperation from '../../util/replaceOperation';
import * as RollCallParticipant from './rollCallParticipant/types';
import * as RecordOperation from '../../util/recordOperation';

export const state = t.type({
    $v: t.literal(1),
    $r: t.literal(1),

    createdAt: t.number,
    createdBy: t.string, // Participant ID

    // keyはParticipantのID
    // 一般に、roll-callが作られたときにいたなおかつ作成者以外のParticipantのみが入る
    participants: record(t.string, RollCallParticipant.state),
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(1, 1, {
    createdAt: t.type({ oldValue: t.number }),
    createdBy: t.type({ oldValue: t.string }),
    participants: record(
        t.string,
        recordDownOperationElementFactory(
            RollCallParticipant.state,
            RollCallParticipant.downOperation
        )
    ),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(1, 1, {
    createdAt: t.type({ newValue: t.number }),
    createdBy: t.type({ newValue: t.string }),
    participants: record(
        t.string,
        recordUpOperationElementFactory(RollCallParticipant.state, RollCallParticipant.upOperation)
    ),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 1;
    $r: 1;

    createdAt?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    createdBy?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    participants?: RecordOperation.RecordTwoWayOperation<
        RollCallParticipant.State,
        RollCallParticipant.TwoWayOperation
    >;
};
