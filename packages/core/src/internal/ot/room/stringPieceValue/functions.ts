import * as RecordOperation from '../../util/recordOperation';
import * as Piece from '../../piece/functions';
import * as PieceTypes from '../../piece/types';
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
import { DownOperation, State, TwoWayOperation, UpOperation } from './types';
import * as TextOperation from '../../util/textOperation';
import * as Room from '../types';
import {
    RequestedBy,
    isCharacterOwner,
    anyValue,
    canChangeOwnerCharacterId,
} from '../../util/requestedBy';

export const toClientState =
    (requestedBy: RequestedBy, currentRoomState: Room.State) =>
    (source: State): State => {
        const isAuthorized = isCharacterOwner({
            requestedBy,
            characterId: source.ownerCharacterId ?? anyValue,
            currentRoomState,
        });
        return {
            ...source,
            value: source.isValuePrivate && !isAuthorized ? '' : source.value,
            pieces: Piece.toClientStateMany(requestedBy, currentRoomState)(source.pieces),
        };
    };

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        value: source.value == null ? undefined : TextOperation.toDownOperation(source.value),
    };
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return {
        ...source,
        value: source.value == null ? undefined : TextOperation.toUpOperation(source.value),
    };
};

export const apply: Apply<State, UpOperation | TwoWayOperation> = ({ state, operation }) => {
    const result: State = { ...state };

    if (operation.ownerCharacterId != null) {
        result.ownerCharacterId = operation.ownerCharacterId.newValue;
    }

    if (operation.isValuePrivate != null) {
        result.isValuePrivate = operation.isValuePrivate.newValue;
    }

    if (operation.value != null) {
        const newValue = TextOperation.apply(result.value, operation.value);
        if (newValue.isError) {
            return newValue;
        }
        result.value = newValue.value;
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

    if (operation.ownerCharacterId != null) {
        result.ownerCharacterId = operation.ownerCharacterId.oldValue;
    }

    if (operation.isValuePrivate != null) {
        result.isValuePrivate = operation.isValuePrivate.oldValue;
    }

    if (operation.value != null) {
        const newValue = TextOperation.applyBack(result.value, operation.value);
        if (newValue.isError) {
            return newValue;
        }
        result.value = newValue.value;
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
    const value = TextOperation.composeDownOperation(first.value, second.value);
    if (value.isError) {
        return value;
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
        ownerCharacterId: ReplaceOperation.composeDownOperation(
            first.ownerCharacterId,
            second.ownerCharacterId
        ),
        isValuePrivate: ReplaceOperation.composeDownOperation(
            first.isValuePrivate ?? undefined,
            second.isValuePrivate ?? undefined
        ),
        value: value.value,
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

    const prevState: State = { ...nextState, pieces: pieces.value.prevState };
    const twoWayOperation: TwoWayOperation = {
        $v: 2,
        $r: 1,
        pieces: pieces.value.twoWayOperation,
    };

    if (downOperation.ownerCharacterId !== undefined) {
        prevState.ownerCharacterId = downOperation.ownerCharacterId.oldValue ?? undefined;
        twoWayOperation.ownerCharacterId = {
            oldValue: downOperation.ownerCharacterId.oldValue ?? undefined,
            newValue: nextState.ownerCharacterId,
        };
    }
    if (downOperation.isValuePrivate != null) {
        prevState.isValuePrivate = downOperation.isValuePrivate.oldValue;
        twoWayOperation.isValuePrivate = {
            ...downOperation.isValuePrivate,
            newValue: nextState.isValuePrivate,
        };
    }
    if (downOperation.value != null) {
        const restored = TextOperation.restore({
            nextState: nextState.value,
            downOperation: downOperation.value,
        });
        if (restored.isError) {
            return restored;
        }
        prevState.value = restored.value.prevState;
        twoWayOperation.value = restored.value.twoWayOperation;
    }

    return Result.ok({ prevState, nextState, twoWayOperation });
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

    if (prevState.ownerCharacterId !== nextState.ownerCharacterId) {
        result.ownerCharacterId = {
            oldValue: prevState.ownerCharacterId,
            newValue: nextState.ownerCharacterId,
        };
    }
    if (prevState.isValuePrivate !== nextState.isValuePrivate) {
        result.isValuePrivate = {
            oldValue: prevState.isValuePrivate,
            newValue: nextState.isValuePrivate,
        };
    }
    if (prevState.value !== nextState.value) {
        result.value = TextOperation.diff({
            prev: prevState.value,
            next: nextState.value,
        });
    }

    if (isIdRecord(result)) {
        return undefined;
    }

    return result;
};

export const serverTransform =
    (
        requestedBy: RequestedBy,
        currentRoomState: Room.State
    ): ServerTransform<State, TwoWayOperation, UpOperation> =>
    ({ prevState, currentState, clientOperation, serverOperation }) => {
        const isAuthorized = isCharacterOwner({
            requestedBy,
            characterId: currentState.ownerCharacterId ?? anyValue,
            currentRoomState,
        });
        if (!isAuthorized) {
            // 自分以外はどのプロパティも編集できない。
            return Result.ok(undefined);
        }

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
            canChangeOwnerCharacterId({
                requestedBy,
                currentOwnerCharacter: currentState,
                currentRoomState,
            })
        ) {
            twoWayOperation.ownerCharacterId = ReplaceOperation.serverTransform({
                first: serverOperation?.ownerCharacterId,
                second: clientOperation.ownerCharacterId,
                prevState: prevState.ownerCharacterId,
            });
        }

        twoWayOperation.isValuePrivate = ReplaceOperation.serverTransform({
            first: serverOperation?.isValuePrivate ?? undefined,
            second: clientOperation.isValuePrivate ?? undefined,
            prevState: prevState.isValuePrivate,
        });

        // !isAuthorized の場合は最初の方ですべて弾いているため、isValuePrivateのチェックをする必要はない。
        const valueResult = TextOperation.serverTransform({
            first: serverOperation?.value ?? undefined,
            second: clientOperation.value ?? undefined,
            prevState: prevState.value,
        });
        if (valueResult.isError) {
            return valueResult;
        }
        twoWayOperation.value = valueResult.value;

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
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

    const ownerCharacterId = ReplaceOperation.clientTransform({
        first: first.ownerCharacterId,
        second: second.ownerCharacterId,
    });

    const isValuePrivate = ReplaceOperation.clientTransform({
        first: first.isValuePrivate,
        second: second.isValuePrivate,
    });

    const value = TextOperation.clientTransform({
        first: first.value,
        second: second.value,
    });
    if (value.isError) {
        return value;
    }

    const firstPrime: UpOperation = {
        $v: 2,
        $r: 1,
        pieces: pieces.value.firstPrime,
        ownerCharacterId: ownerCharacterId.firstPrime,
        isValuePrivate: isValuePrivate.firstPrime,
        value: value.value.firstPrime,
    };

    const secondPrime: UpOperation = {
        $v: 2,
        $r: 1,
        pieces: pieces.value.secondPrime,
        ownerCharacterId: ownerCharacterId.secondPrime,
        isValuePrivate: isValuePrivate.secondPrime,
        value: value.value.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
