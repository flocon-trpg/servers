import {
    Apply,
    ClientTransform,
    Compose,
    Diff,
    Restore,
    ServerTransform,
    DownError,
} from '../../util/type';
import * as ReplaceOperation from '../../util/replaceOperation';
import { isIdRecord } from '../../util/record';
import { Result } from '@kizahasi/result';
import { DownOperation, State, TwoWayOperation, UpOperation } from './types';
import { admin, RequestedBy, isOwner } from '../../util/requestedBy';

export const toClientState = (source: State): State => {
    return source;
};

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return source;
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return source;
};

export const apply: Apply<State, UpOperation> = ({ state, operation }) => {
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

export const composeDownOperation: Compose<DownOperation, DownError> = ({ first, second }) => {
    const valueProps: DownOperation = {
        $v: 2,
        $r: 1,
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
        $v: 2,
        $r: 1,
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
        $v: 2,
        $r: 1,
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

export const serverTransform =
    ({
        requestedBy,
        participantKey,
    }: {
        requestedBy: RequestedBy;
        participantKey: string;
    }): ServerTransform<State, TwoWayOperation, UpOperation> =>
    ({ prevState, currentState, clientOperation, serverOperation }) => {
        const isAuthorized = isOwner({
            requestedBy,
            ownerParticipantId: participantKey,
        });

        const twoWayOperation: TwoWayOperation = {
            $v: 2,
            $r: 1,
        };

        if (isAuthorized) {
            // CONSIDER: ユーザーがnameをnullishに変更することは禁止すべきかもしれない
            twoWayOperation.name = ReplaceOperation.serverTransform({
                first: serverOperation?.name ?? undefined,
                second: clientOperation.name ?? undefined,
                prevState: prevState.name,
            });
        }

        if (requestedBy.type === admin) {
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
        $v: 2,
        $r: 1,
        name: name.firstPrime,
        role: role.firstPrime,
    };

    const secondPrime: UpOperation = {
        $v: 2,
        $r: 1,
        name: name.secondPrime,
        role: role.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
