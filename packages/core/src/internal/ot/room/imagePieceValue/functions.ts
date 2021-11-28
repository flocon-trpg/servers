import * as ReplaceOperation from '../../util/replaceOperation';
import * as NullableTextOperation from '../../util/nullableTextOperation';
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
import * as Piece from '../../piece/functions';
import * as PieceTypes from '../../piece/types';
import * as RecordOperation from '../../util/recordOperation';
import { DownOperation, State, TwoWayOperation, UpOperation } from './types';
import * as Room from '../types';
import {
    anyValue,
    canChangeOwnerParticipantId,
    isOwner,
    RequestedBy,
} from '../../util/requestedBy';

export const toClientState =
    (requestedBy: RequestedBy, currentRoomState: Room.State) =>
    (source: State): State => {
        return {
            ...source,
            pieces: Piece.toClientStateMany(requestedBy, currentRoomState)(source.pieces),
        };
    };

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        memo: source.memo == null ? undefined : NullableTextOperation.toDownOperation(source.memo),
        name: source.name == null ? undefined : NullableTextOperation.toDownOperation(source.name),
    };
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return {
        ...source,
        memo: source.memo == null ? undefined : NullableTextOperation.toUpOperation(source.memo),
        name: source.name == null ? undefined : NullableTextOperation.toUpOperation(source.name),
    };
};

export const apply: Apply<State, UpOperation | TwoWayOperation> = ({ state, operation }) => {
    const result: State = { ...state };

    if (operation.ownerParticipantId != null) {
        result.ownerParticipantId = operation.ownerParticipantId.newValue;
    }
    if (operation.image != null) {
        result.image = operation.image.newValue;
    }
    if (operation.isPrivate != null) {
        result.isPrivate = operation.isPrivate.newValue;
    }
    if (operation.memo != null) {
        const valueResult = NullableTextOperation.apply(state.memo, operation.memo);
        if (valueResult.isError) {
            return valueResult;
        }
        result.memo = valueResult.value;
    }
    if (operation.name != null) {
        const valueResult = NullableTextOperation.apply(state.name, operation.name);
        if (valueResult.isError) {
            return valueResult;
        }
        result.name = valueResult.value;
    }

    const pieces = RecordOperation.apply<PieceTypes.State, PieceTypes.UpOperation, ScalarError>({
        prevState: state.pieces,
        operation: operation.pieces,
        innerApply: ({ prevState, operation: upOperation }) => {
            return Piece.apply({ state: prevState, operation: upOperation });
        },
    });
    if (pieces.isError) {
        return pieces;
    }
    result.pieces = pieces.value;

    return Result.ok(result);
};

export const applyBack: Apply<State, DownOperation> = ({ state, operation }) => {
    const result: State = { ...state };

    if (operation.ownerParticipantId != null) {
        result.ownerParticipantId = operation.ownerParticipantId.oldValue;
    }
    if (operation.image != null) {
        result.image = operation.image.oldValue;
    }
    if (operation.isPrivate != null) {
        result.isPrivate = operation.isPrivate.oldValue;
    }
    if (operation.memo != null) {
        const valueResult = NullableTextOperation.applyBack(state.memo, operation.memo);
        if (valueResult.isError) {
            return valueResult;
        }
        result.memo = valueResult.value;
    }
    if (operation.name != null) {
        const valueResult = NullableTextOperation.applyBack(state.name, operation.name);
        if (valueResult.isError) {
            return valueResult;
        }
        result.name = valueResult.value;
    }

    const pieces = RecordOperation.applyBack<
        PieceTypes.State,
        PieceTypes.DownOperation,
        ScalarError
    >({
        nextState: state.pieces,
        operation: operation.pieces,
        innerApplyBack: ({ state: nextState, operation }) => {
            return Piece.applyBack({ state: nextState, operation });
        },
    });
    if (pieces.isError) {
        return pieces;
    }
    result.pieces = pieces.value;

    return Result.ok(result);
};

export const composeDownOperation: Compose<DownOperation, DownError> = ({ first, second }) => {
    const memo = NullableTextOperation.composeDownOperation(first.memo, second.memo);
    if (memo.isError) {
        return memo;
    }

    const name = NullableTextOperation.composeDownOperation(first.name, second.name);
    if (name.isError) {
        return name;
    }

    const pieces = RecordOperation.composeDownOperation<
        PieceTypes.State,
        PieceTypes.DownOperation,
        DownError
    >({
        first: first.pieces,
        second: second.pieces,
        innerApplyBack: ({ state, operation }) => {
            return Piece.applyBack({ state, operation });
        },
        innerCompose: params => Piece.composeDownOperation(params),
    });
    if (pieces.isError) {
        return pieces;
    }

    const valueProps: DownOperation = {
        $v: 2,
        $r: 1,
        ownerParticipantId: ReplaceOperation.composeDownOperation(
            first.ownerParticipantId,
            second.ownerParticipantId
        ),
        image: ReplaceOperation.composeDownOperation(first.image, second.image),
        isPrivate: ReplaceOperation.composeDownOperation(first.isPrivate, second.isPrivate),
        memo: memo.value,
        name: name.value,
        pieces: pieces.value,
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

    const pieces = RecordOperation.restore<
        PieceTypes.State,
        PieceTypes.DownOperation,
        PieceTypes.TwoWayOperation,
        ScalarError
    >({
        nextState: nextState.pieces,
        downOperation: downOperation.pieces,
        innerDiff: params => Piece.diff(params),
        innerRestore: params => Piece.restore(params),
    });
    if (pieces.isError) {
        return pieces;
    }

    const prevState: State = {
        ...nextState,
        pieces: pieces.value.prevState,
    };
    const twoWayOperation: TwoWayOperation = {
        $v: 2,
        $r: 1,
        pieces: pieces.value.twoWayOperation,
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
    if (downOperation.memo !== undefined) {
        const restored = NullableTextOperation.restore({
            nextState: nextState.memo,
            downOperation: downOperation.memo,
        });
        if (restored.isError) {
            return restored;
        }
        prevState.memo = restored.value.prevState;
        twoWayOperation.memo = restored.value.twoWayOperation;
    }
    if (downOperation.name !== undefined) {
        const restored = NullableTextOperation.restore({
            nextState: nextState.name,
            downOperation: downOperation.name,
        });
        if (restored.isError) {
            return restored;
        }
        prevState.name = restored.value.prevState;
        twoWayOperation.name = restored.value.twoWayOperation;
    }

    return Result.ok({ prevState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const pieces = RecordOperation.diff<PieceTypes.State, PieceTypes.TwoWayOperation>({
        prevState: prevState.pieces,
        nextState: nextState.pieces,
        innerDiff: params => Piece.diff(params),
    });
    const result: TwoWayOperation = {
        $v: 2,
        $r: 1,
        pieces,
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
    if (prevState.memo !== nextState.memo) {
        result.memo = NullableTextOperation.diff({
            prev: prevState.memo,
            next: nextState.memo,
        });
    }
    if (prevState.name !== nextState.name) {
        result.name = NullableTextOperation.diff({
            prev: prevState.name,
            next: nextState.name,
        });
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

        const pieces = RecordOperation.serverTransform<
            PieceTypes.State,
            PieceTypes.State,
            PieceTypes.TwoWayOperation,
            PieceTypes.UpOperation,
            TwoWayError
        >({
            prevState: prevState.pieces,
            nextState: currentState.pieces,
            first: serverOperation?.pieces,
            second: clientOperation.pieces,
            innerTransform: ({ prevState, nextState, first, second }) =>
                Piece.serverTransform({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: () => !isAuthorized,
                cancelRemove: params => !isAuthorized && params.state.isPrivate,
                cancelUpdate: params => !isAuthorized && params.nextState.isPrivate,
            },
        });
        if (pieces.isError) {
            return pieces;
        }

        const twoWayOperation: TwoWayOperation = {
            $v: 2,
            $r: 1,
            pieces: pieces.value,
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

        const transformedMemo = NullableTextOperation.serverTransform({
            first: serverOperation?.memo,
            second: clientOperation.memo,
            prevState: prevState.memo,
        });
        if (transformedMemo.isError) {
            return transformedMemo;
        }
        twoWayOperation.memo = transformedMemo.value;

        const transformedName = NullableTextOperation.serverTransform({
            first: serverOperation?.name,
            second: clientOperation.name,
            prevState: prevState.name,
        });
        if (transformedName.isError) {
            return transformedName;
        }
        twoWayOperation.name = transformedName.value;

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
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

    const memo = NullableTextOperation.clientTransform({
        first: first.memo,
        second: second.memo,
    });
    if (memo.isError) {
        return memo;
    }

    const name = NullableTextOperation.clientTransform({
        first: first.name,
        second: second.name,
    });
    if (name.isError) {
        return name;
    }

    const pieces = RecordOperation.clientTransform<
        PieceTypes.State,
        PieceTypes.UpOperation,
        UpError
    >({
        first: first.pieces,
        second: second.pieces,
        innerTransform: params => Piece.clientTransform(params),
        innerDiff: params => Piece.diff(params),
    });
    if (pieces.isError) {
        return pieces;
    }

    const firstPrime: UpOperation = {
        $v: 2,
        $r: 1,
        ownerParticipantId: ownerPariticipantId.firstPrime,
        image: image.firstPrime,
        isPrivate: isPrivate.firstPrime,
        memo: memo.value.firstPrime,
        name: name.value.firstPrime,
        pieces: pieces.value.firstPrime,
    };
    const secondPrime: UpOperation = {
        $v: 2,
        $r: 1,
        ownerParticipantId: ownerPariticipantId.secondPrime,
        image: image.secondPrime,
        isPrivate: isPrivate.secondPrime,
        memo: memo.value.secondPrime,
        name: name.value.secondPrime,
        pieces: pieces.value.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
