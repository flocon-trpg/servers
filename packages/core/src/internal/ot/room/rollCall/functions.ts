import * as Participant from './rollCallParticipant/functions';
import * as ParticipantTypes from './rollCallParticipant/types';
import * as RecordOperation from '../../util/recordOperation';
import { mapRecordOperationElement } from '../../util/recordOperationElement';
import * as ReplaceOperation from '../../util/replaceOperation';
import {
    Apply,
    ClientTransform,
    Compose,
    Diff,
    DownError,
    Restore,
    ScalarError,
    ServerTransform,
    TwoWayError,
    UpError,
} from '../../util/type';
import { isIdRecord } from '../../util/record';
import { Result } from '@kizahasi/result';
import { chooseRecord } from '@flocon-trpg/utils';
import { DownOperation, State, TwoWayOperation, UpOperation } from './types';

export const toClientState = (source: State): State => {
    return {
        ...source,
        participants: RecordOperation.toClientState({
            serverState: source.participants,
            isPrivate: () => false,
            toClientState: ({ state }) => Participant.toClientState(state),
        }),
    };
};

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        participants:
            source.participants == null
                ? undefined
                : chooseRecord(source.participants, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: Participant.toDownOperation,
                      })
                  ),
    };
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return {
        ...source,
        participants:
            source.participants == null
                ? undefined
                : chooseRecord(source.participants, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: Participant.toUpOperation,
                      })
                  ),
    };
};

export const apply: Apply<State, UpOperation> = ({ state, operation }) => {
    const result: State = { ...state };

    const participants = RecordOperation.apply<
        ParticipantTypes.State,
        ParticipantTypes.UpOperation,
        ScalarError
    >({
        prevState: state.participants,
        operation: operation.participants,
        innerApply: ({ prevState, operation }) => {
            return Participant.apply({ state: prevState, operation });
        },
    });
    if (participants.isError) {
        return participants;
    }
    result.participants = participants.value;

    if (operation.createdAt != null) {
        result.createdAt = operation.createdAt.newValue;
    }
    if (operation.createdBy != null) {
        result.createdBy = operation.createdBy.newValue;
    }

    return Result.ok(result);
};

export const applyBack: Apply<State, DownOperation> = ({ state, operation }) => {
    const result: State = { ...state };

    const participants = RecordOperation.applyBack<
        ParticipantTypes.State,
        ParticipantTypes.DownOperation,
        ScalarError
    >({
        nextState: state.participants,
        operation: operation.participants,
        innerApplyBack: ({ state, operation }) => {
            return Participant.applyBack({ state, operation });
        },
    });
    if (participants.isError) {
        return participants;
    }
    result.participants = participants.value;

    if (operation.createdAt != null) {
        result.createdAt = operation.createdAt.oldValue;
    }
    if (operation.createdBy != null) {
        result.createdBy = operation.createdBy.oldValue;
    }

    return Result.ok(result);
};

export const composeDownOperation: Compose<DownOperation, DownError> = ({ first, second }) => {
    const participants = RecordOperation.composeDownOperation({
        first: first.participants,
        second: second.participants,
        innerApplyBack: params => Participant.applyBack(params),
        innerCompose: params => Participant.composeDownOperation(params),
    });
    if (participants.isError) {
        return participants;
    }

    const valueProps: DownOperation = {
        $v: 1,
        $r: 1,
        participants: participants.value,
        createdAt: ReplaceOperation.composeDownOperation(first.createdAt, second.createdAt),
        createdBy: ReplaceOperation.composeDownOperation(first.createdBy, second.createdBy),
    };

    return Result.ok(valueProps);
};

export const restore: Restore<State, DownOperation, TwoWayOperation> = ({
    nextState,
    downOperation,
}) => {
    if (downOperation === undefined) {
        return Result.ok({ prevState: nextState, twoWayOperation: undefined });
    }

    const participants = RecordOperation.restore<
        ParticipantTypes.State,
        ParticipantTypes.DownOperation,
        ParticipantTypes.TwoWayOperation,
        ScalarError
    >({
        nextState: nextState.participants,
        downOperation: downOperation.participants,
        innerDiff: params => Participant.diff(params),
        innerRestore: params => Participant.restore(params),
    });
    if (participants.isError) {
        return participants;
    }

    const prevState: State = {
        ...nextState,
        participants: participants.value.prevState,
    };
    const twoWayOperation: TwoWayOperation = {
        $v: 1,
        $r: 1,
        participants: participants.value.twoWayOperation,
    };

    if (downOperation.createdAt !== undefined) {
        prevState.createdAt = downOperation.createdAt.oldValue;
        twoWayOperation.createdAt = {
            ...downOperation.createdAt,
            newValue: nextState.createdAt,
        };
    }

    if (downOperation.createdBy !== undefined) {
        prevState.createdBy = downOperation.createdBy.oldValue;
        twoWayOperation.createdBy = {
            ...downOperation.createdBy,
            newValue: nextState.createdBy,
        };
    }

    return Result.ok({ prevState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const participants = RecordOperation.diff<
        ParticipantTypes.State,
        ParticipantTypes.TwoWayOperation
    >({
        prevState: prevState.participants,
        nextState: nextState.participants,
        innerDiff: params => Participant.diff(params),
    });
    const result: TwoWayOperation = {
        $v: 1,
        $r: 1,
        participants,
    };
    if (prevState.createdAt !== nextState.createdAt) {
        result.createdAt = {
            oldValue: prevState.createdAt,
            newValue: nextState.createdAt,
        };
    }
    if (prevState.createdBy !== nextState.createdBy) {
        result.createdBy = {
            oldValue: prevState.createdBy,
            newValue: nextState.createdBy,
        };
    }

    if (isIdRecord(result)) {
        return undefined;
    }
    return result;
};

export const serverTransform: ServerTransform<State, TwoWayOperation, UpOperation> = ({
    prevState,
    currentState,
    clientOperation,
    serverOperation,
}) => {
    const participants = RecordOperation.serverTransform<
        ParticipantTypes.State,
        ParticipantTypes.State,
        ParticipantTypes.TwoWayOperation,
        ParticipantTypes.UpOperation,
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

    const twoWayOperation: TwoWayOperation = {
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

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
    const participants = RecordOperation.clientTransform<
        ParticipantTypes.State,
        ParticipantTypes.UpOperation,
        UpError
    >({
        first: first.participants,
        second: second.participants,
        innerTransform: params => Participant.clientTransform(params),
        innerDiff: params => Participant.diff(params),
    });
    if (participants.isError) {
        return participants;
    }

    const createdAt = ReplaceOperation.clientTransform({
        first: first.createdAt,
        second: second.createdAt,
    });

    const createdBy = ReplaceOperation.clientTransform({
        first: first.createdBy,
        second: second.createdBy,
    });

    const firstPrime: UpOperation = {
        $v: 1,
        $r: 1,

        participants: participants.value.firstPrime,
        createdAt: createdAt.firstPrime,
        createdBy: createdBy.firstPrime,
    };
    const secondPrime: UpOperation = {
        $v: 1,
        $r: 1,

        participants: participants.value.secondPrime,
        createdAt: createdAt.secondPrime,
        createdBy: createdBy.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
