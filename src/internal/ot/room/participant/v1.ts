import * as t from 'io-ts';
import {
    Apply,
    ClientTransform,
    Compose,
    Diff,
    RequestedBy,
    Restore,
    server,
    ServerTransform,
    ToClientOperationParams,
} from '../../util/type';
import * as ReplaceOperation from '../../util/replaceOperation';
import { createOperation } from '../../util/createOperation';
import { isIdRecord } from '../../util/record';
import { Result } from '@kizahasi/result';
import { maybe, Maybe } from '@kizahasi/util';

export const Player = 'Player';
export const Spectator = 'Spectator';
export const Master = 'Master';

const participantRole = t.union([t.literal(Player), t.literal(Spectator), t.literal(Master)]);
export type ParticipantRole = t.TypeOf<typeof participantRole>;

export const state = t.type({
    $version: t.literal(1),

    name: t.string,
    role: maybe(participantRole),
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(1, {
    name: t.type({ oldValue: t.string }),
    role: t.type({ oldValue: maybe(participantRole) }),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(1, {
    name: t.type({ newValue: t.string }),
    role: t.type({ newValue: maybe(participantRole) }),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $version: 1;

    name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    role?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<ParticipantRole>>;
};

export const toClientState = (source: State): State => {
    return source;
};

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return source;
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return source;
};

export const apply: Apply<State, UpOperation | TwoWayOperation> = ({ state, operation }) => {
    const result: State = { ...state };
    if (operation.name != null) {
        result.name = operation.name.newValue;
    }
    if (operation.role != null) {
        result.role = operation.role.newValue;
    }
    return Result.ok(result);
};

export const applyBack: Apply<State, DownOperation> = ({ state, operation }) => {
    const result: State = { ...state };
    if (operation.name != null) {
        result.name = operation.name.oldValue;
    }
    if (operation.role != null) {
        result.role = operation.role.oldValue;
    }

    return Result.ok(result);
};

export const composeDownOperation: Compose<DownOperation> = ({ first, second }) => {
    const valueProps: DownOperation = {
        $version: 1,
        name: ReplaceOperation.composeDownOperation(
            first.name ?? undefined,
            second.name ?? undefined
        ),
        role: ReplaceOperation.composeDownOperation(
            first.role ?? undefined,
            second.role ?? undefined
        ),
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

    const prevState: State = {
        ...nextState,
    };
    const twoWayOperation: TwoWayOperation = {
        $version: 1,
    };

    if (downOperation.name != null) {
        prevState.name = downOperation.name.oldValue;
        twoWayOperation.name = {
            ...downOperation.name,
            newValue: nextState.name,
        };
    }
    if (downOperation.role != null) {
        prevState.role = downOperation.role.oldValue ?? undefined;
        twoWayOperation.role = {
            oldValue: downOperation.role.oldValue ?? undefined,
            newValue: nextState.role,
        };
    }

    return Result.ok({ prevState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const result: TwoWayOperation = {
        $version: 1,
    };
    if (prevState.name !== nextState.name) {
        result.name = { oldValue: prevState.name, newValue: nextState.name };
    }
    if (prevState.role !== nextState.role) {
        result.role = { oldValue: prevState.role, newValue: nextState.role };
    }
    if (isIdRecord(result)) {
        return undefined;
    }
    return result;
};

export const serverTransform = ({
    requestedBy,
    participantKey,
    activeBoardSecondKey,
}: {
    requestedBy: RequestedBy;
    participantKey: string;
    activeBoardSecondKey: string | null | undefined;
}): ServerTransform<State, TwoWayOperation, UpOperation> => ({
    prevState,
    currentState,
    clientOperation,
    serverOperation,
}) => {
    const twoWayOperation: TwoWayOperation = {
        $version: 1,
    };

    if (RequestedBy.createdByMe({ requestedBy, userUid: participantKey })) {
        twoWayOperation.name = ReplaceOperation.serverTransform({
            first: serverOperation?.name ?? undefined,
            second: clientOperation.name ?? undefined,
            prevState: prevState.name,
        });
    }

    if (requestedBy.type === server) {
        twoWayOperation.role = ReplaceOperation.serverTransform({
            first: serverOperation?.role ?? undefined,
            second: clientOperation.role ?? undefined,
            prevState: prevState.role,
        });
    }

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok(twoWayOperation);
};

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
    const name = ReplaceOperation.clientTransform({
        first: first.name,
        second: second.name,
    });

    const role = ReplaceOperation.clientTransform({
        first: first.role,
        second: second.role,
    });

    const firstPrime: UpOperation = {
        $version: 1,
        name: name.firstPrime,
        role: role.firstPrime,
    };

    const secondPrime: UpOperation = {
        $version: 1,
        name: name.secondPrime,
        role: role.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
