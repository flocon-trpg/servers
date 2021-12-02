import * as ReplaceOperation from '../../../util/replaceOperation';
import {
    Apply,
    ClientTransform,
    Compose,
    Diff,
    DownError,
    Restore,
    ServerTransform,
} from '../../../util/type';
import { isIdRecord } from '../../../util/record';
import { Result } from '@kizahasi/result';
import * as BoardPosition from '../../../boardPositionBase/functions';
import { DownOperation, State, TwoWayOperation, UpOperation } from './types';
import {
    anyValue,
    canChangeOwnerParticipantId,
    isOwner,
    RequestedBy,
} from '../../../util/requestedBy';

export const toClientState = (source: State): State => {
    return source;
};

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        memo: undefined,
        name: undefined,
        ...BoardPosition.toDownOperation(source),
    };
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return {
        ...source,
        memo: undefined,
        name: undefined,
        ...BoardPosition.toUpOperation(source),
    };
};

export const apply: Apply<State, UpOperation> = ({ state, operation }) => {
    const piece = BoardPosition.apply({ state, operation });
    if (piece.isError) {
        return piece;
    }
    const result: State = { ...state, ...piece.value };

    if (operation.ownerParticipantId != null) {
        result.ownerParticipantId = operation.ownerParticipantId.newValue;
    }
    if (operation.image != null) {
        result.image = operation.image.newValue;
    }
    if (operation.isPrivate != null) {
        result.isPrivate = operation.isPrivate.newValue;
    }

    return Result.ok(result);
};

export const applyBack: Apply<State, DownOperation> = ({ state, operation }) => {
    const piece = BoardPosition.applyBack({ state, operation });
    if (piece.isError) {
        return piece;
    }
    const result: State = { ...state, ...piece.value };

    if (operation.ownerParticipantId != null) {
        result.ownerParticipantId = operation.ownerParticipantId.oldValue;
    }
    if (operation.image != null) {
        result.image = operation.image.oldValue;
    }
    if (operation.isPrivate != null) {
        result.isPrivate = operation.isPrivate.oldValue;
    }

    return Result.ok(result);
};

export const composeDownOperation: Compose<DownOperation, DownError> = ({ first, second }) => {
    const boardPosition = BoardPosition.composeDownOperation({ first, second });
    if (boardPosition.isError) {
        return boardPosition;
    }

    const valueProps: DownOperation = {
        $v: 2,
        $r: 1,
        ...boardPosition.value,
        ownerParticipantId: ReplaceOperation.composeDownOperation(
            first.ownerParticipantId,
            second.ownerParticipantId
        ),
        image: ReplaceOperation.composeDownOperation(first.image, second.image),
        isPrivate: ReplaceOperation.composeDownOperation(first.isPrivate, second.isPrivate),
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

    const piece = BoardPosition.restore({ nextState, downOperation });
    if (piece.isError) {
        return piece;
    }

    const prevState: State = {
        ...nextState,
        ...piece.value.prevState,
    };
    const twoWayOperation: TwoWayOperation = {
        $v: 2,
        $r: 1,
        ...piece.value.twoWayOperation,
    };

    if (downOperation.ownerParticipantId !== undefined) {
        prevState.ownerParticipantId = downOperation.ownerParticipantId.oldValue ?? undefined;
        twoWayOperation.ownerParticipantId = {
            oldValue: downOperation.ownerParticipantId.oldValue ?? undefined,
            newValue: nextState.ownerParticipantId,
        };
    }
    if (downOperation.image !== undefined) {
        prevState.image = downOperation.image.oldValue ?? undefined;
        twoWayOperation.image = {
            oldValue: downOperation.image.oldValue ?? undefined,
            newValue: nextState.image,
        };
    }
    if (downOperation.isPrivate !== undefined) {
        prevState.isPrivate = downOperation.isPrivate.oldValue ?? undefined;
        twoWayOperation.isPrivate = {
            oldValue: downOperation.isPrivate.oldValue ?? undefined,
            newValue: nextState.isPrivate,
        };
    }

    return Result.ok({ prevState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const result: TwoWayOperation = {
        $v: 2,
        $r: 1,
        ...BoardPosition.diff({ prevState, nextState }),
    };

    if (prevState.ownerParticipantId !== nextState.ownerParticipantId) {
        result.ownerParticipantId = {
            oldValue: prevState.ownerParticipantId,
            newValue: nextState.ownerParticipantId,
        };
    }
    if (prevState.image !== nextState.image) {
        result.image = { oldValue: prevState.image, newValue: nextState.image };
    }
    if (prevState.isPrivate !== nextState.isPrivate) {
        result.isPrivate = { oldValue: prevState.isPrivate, newValue: nextState.isPrivate };
    }

    if (isIdRecord(result)) {
        return undefined;
    }
    return result;
};

export const serverTransform =
    (requestedBy: RequestedBy): ServerTransform<State, TwoWayOperation, UpOperation> =>
    ({ prevState, currentState, clientOperation, serverOperation }) => {
        const isAuthorized = isOwner({
            requestedBy,
            ownerParticipantId: currentState.ownerParticipantId ?? anyValue,
        });
        if (!isAuthorized) {
            // 自分以外はどのプロパティも編集できない。
            return Result.ok(undefined);
        }

        const piece = BoardPosition.serverTransform({
            prevState,
            currentState,
            clientOperation,
            serverOperation,
        });
        if (piece.isError) {
            return piece;
        }

        const twoWayOperation: TwoWayOperation = {
            $v: 2,
            $r: 1,
            ...piece.value,
        };

        if (
            canChangeOwnerParticipantId({
                requestedBy,
                currentOwnerParticipant: currentState,
            })
        ) {
            twoWayOperation.ownerParticipantId = ReplaceOperation.serverTransform({
                first: serverOperation?.ownerParticipantId,
                second: clientOperation.ownerParticipantId,
                prevState: prevState.ownerParticipantId,
            });
        }

        twoWayOperation.image = ReplaceOperation.serverTransform({
            first: serverOperation?.image,
            second: clientOperation.image,
            prevState: prevState.image,
        });

        twoWayOperation.isPrivate = ReplaceOperation.serverTransform({
            first: serverOperation?.isPrivate,
            second: clientOperation.isPrivate,
            prevState: prevState.isPrivate,
        });

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
    const piece = BoardPosition.clientTransform({ first, second });

    const ownerPariticipantId = ReplaceOperation.clientTransform({
        first: first.ownerParticipantId,
        second: second.ownerParticipantId,
    });

    const image = ReplaceOperation.clientTransform({
        first: first.image,
        second: second.image,
    });

    const isPrivate = ReplaceOperation.clientTransform({
        first: first.isPrivate,
        second: second.isPrivate,
    });

    const firstPrime: UpOperation = {
        ...piece.value?.firstPrime,
        $v: 2,
        $r: 1,
        ownerParticipantId: ownerPariticipantId.firstPrime,
        image: image.firstPrime,
        isPrivate: isPrivate.firstPrime,
    };
    const secondPrime: UpOperation = {
        ...piece.value?.secondPrime,
        $v: 2,
        $r: 1,
        ownerParticipantId: ownerPariticipantId.secondPrime,
        image: image.secondPrime,
        isPrivate: isPrivate.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
