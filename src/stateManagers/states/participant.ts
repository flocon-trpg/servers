import { ParticipantOperation, ParticipantsGetState, ParticipantsOperationFragment, ParticipantValueStateFragment } from '../../generated/graphql';
import produce from 'immer';
import * as $Map from './map';
import { OperationElement as OperationElementCore, replace, update } from './types';
import { ReplaceNullableValueOperationModule, ReplaceValueOperationModule } from './utils/replaceValueOperation';

export type StateElement = Omit<ParticipantValueStateFragment, '__typename'>

export type State = ReadonlyMap<string, StateElement>

export type OperationElement = OperationElementCore<StateElement, Omit<ParticipantOperation, '__typename'>>

export type Operation = ReadonlyMap<string, OperationElement>

export const createState = (source: ParticipantsGetState): State => {
    // サーバーから受け取る値なので、キーの検証はしていない。

    const participants = new Map<string, StateElement>();
    source.participants.forEach(participant => {
        participants.set(participant.userUid, participant.value);
    });
    return participants;
};

export const createOperation = (source: ParticipantsOperationFragment): Operation => {
    // サーバーから受け取る値なので、キーの検証はしていない。

    const participants = new Map<string, OperationElement>();
    source.replace.forEach(participant => {
        participants.set(participant.userUid, { type: replace, newValue: participant.newValue == null ? undefined : participant.newValue });
    });
    source.update.forEach(participant => {
        participants.set(participant.userUid, { type: update, operation: participant.operation });
    });

    return participants;
};

const applyOperationElement = ({
    state,
    operation
}: {
    state: StateElement;
        operation: Omit<ParticipantOperation, '__typename'>;
}) => {
    return produce(state, draft => {
        if (operation.name != null) {
            draft.name = operation.name.newValue;
        }
        if (operation.role != null) {
            draft.role = operation.role.newValue;
        }
    });
};

export const applyOperation = ({
    state,
    operation
}: {
    state: State;
    operation: Operation;
}): State => {
    return $Map.apply({
        state,
        operation,
        inner: applyOperationElement,
    });
};

export const compose = ({
    first,
    second
}: {
    first: Operation;
    second: Operation;
}): Operation => {
    return $Map.compose({
        first,
        second,
        innerApply: applyOperationElement,
        innerCompose: ({ first, second }) => {
            return {
                name: ReplaceValueOperationModule.compose(first.name, second.name ),
                role: ReplaceNullableValueOperationModule.compose(first.role, second.role),
            };
        }
    });
};