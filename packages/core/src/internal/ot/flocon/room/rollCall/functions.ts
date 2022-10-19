import { Result } from '@kizahasi/result';
import { State, TwoWayOperation, UpOperation } from '../../../generator';
import { isIdRecord } from '../../../record';
import * as RecordOperation from '../../../recordOperation';
import * as ReplaceOperation from '../../../util/replaceOperation';
import { ServerTransform, TwoWayError } from '../../../util/type';
import * as Participant from './rollCallParticipant/functions';
import * as ParticipantTypes from './rollCallParticipant/types';
import { template } from './types';

export const toClientState = (source: State<typeof template>): State<typeof template> => {
    return {
        ...source,
        participants: RecordOperation.toClientState({
            serverState: source.participants,
            isPrivate: () => false,
            toClientState: ({ state }) => Participant.toClientState(state),
        }),
    };
};

export const serverTransform: ServerTransform<
    State<typeof template>,
    TwoWayOperation<typeof template>,
    UpOperation<typeof template>
> = ({ prevState, currentState, clientOperation, serverOperation }) => {
    const participants = RecordOperation.serverTransform<
        State<typeof ParticipantTypes.template>,
        State<typeof ParticipantTypes.template>,
        TwoWayOperation<typeof ParticipantTypes.template>,
        UpOperation<typeof ParticipantTypes.template>,
        TwoWayError
    >({
        prevState: prevState.participants,
        nextState: currentState.participants,
        first: serverOperation?.participants,
        second: clientOperation.participants,
        innerTransform: ({ prevState, nextState, first, second }) =>
            Participant.serverTransform({
                prevState,
                currentState: nextState,
                serverOperation: first,
                clientOperation: second,
            }),
        toServerState: state => state,
        cancellationPolicy: {},
    });
    if (participants.isError) {
        return participants;
    }

    const twoWayOperation: TwoWayOperation<typeof template> = {
        $v: 1,
        $r: 1,
        participants: participants.value,
    };

    twoWayOperation.createdAt = ReplaceOperation.serverTransform({
        first: serverOperation?.createdAt,
        second: clientOperation.createdAt,
        prevState: prevState.createdAt,
    });

    twoWayOperation.createdBy = ReplaceOperation.serverTransform({
        first: serverOperation?.createdBy,
        second: clientOperation.createdBy,
        prevState: prevState.createdBy,
    });

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok(twoWayOperation);
};
