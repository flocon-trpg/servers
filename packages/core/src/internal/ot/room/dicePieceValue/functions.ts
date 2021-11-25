import * as DieValue from './dieValue/functions';
import * as DieValueTypes from './dieValue/types';
import * as Piece from '../../piece/functions';
import * as PieceTypes from '../../piece/types';
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
import * as RecordOperation from '../../util/recordOperation';
import * as ReplaceOperation from '../../util/replaceOperation';
import {
    dicePieceValueStrIndexes,
    DownOperation,
    State,
    TwoWayOperation,
    UpOperation,
} from './types';
import * as Room from '../types';
import {
    anyValue,
    RequestedBy,
    isCharacterOwner,
    canChangeOwnerCharacterId,
} from '../../util/requestedBy';
import * as TextOperation from '../../util/textOperation';
import * as NullableTextOperation from '../../util/nullableTextOperation';

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
            dice: chooseRecord(source.dice, state => DieValue.toClientState(isAuthorized)(state)),
            pieces: Piece.toClientStateMany(requestedBy, currentRoomState)(source.pieces),
        };
    };

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        memo: source.memo == null ? undefined : TextOperation.toDownOperation(source.memo),
        name: source.name == null ? undefined : NullableTextOperation.toDownOperation(source.name),
    };
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return {
        ...source,
        memo: source.memo == null ? undefined : TextOperation.toUpOperation(source.memo),
        name: source.name == null ? undefined : NullableTextOperation.toUpOperation(source.name),
    };
};

export const apply: Apply<State, UpOperation | TwoWayOperation> = ({ state, operation }) => {
    const result: State = { ...state };

    if (operation.ownerCharacterId != null) {
        result.ownerCharacterId = operation.ownerCharacterId.newValue;
    }
    if (operation.memo != null) {
        const valueResult = TextOperation.apply(state.memo, operation.memo);
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

    const dice = RecordOperation.apply<DieValueTypes.State, DieValueTypes.UpOperation, ScalarError>(
        {
            prevState: state.dice,
            operation: operation.dice,
            innerApply: ({ prevState, operation: upOperation }) => {
                return DieValue.apply({ state: prevState, operation: upOperation });
            },
        }
    );
    if (dice.isError) {
        return dice;
    }
    result.dice = dice.value;

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
    if (operation.memo != null) {
        const valueResult = TextOperation.applyBack(state.memo, operation.memo);
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

    const dice = RecordOperation.applyBack<
        DieValueTypes.State,
        DieValueTypes.DownOperation,
        ScalarError
    >({
        nextState: state.dice,
        operation: operation.dice,
        innerApplyBack: ({ state: nextState, operation }) => {
            return DieValue.applyBack({ state: nextState, operation });
        },
    });
    if (dice.isError) {
        return dice;
    }
    result.dice = dice.value;

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
    const memo = TextOperation.composeDownOperation(first.memo, second.memo);
    if (memo.isError) {
        return memo;
    }

    const name = NullableTextOperation.composeDownOperation(first.name, second.name);
    if (name.isError) {
        return name;
    }

    const dice = RecordOperation.composeDownOperation<
        DieValueTypes.State,
        DieValueTypes.DownOperation,
        DownError
    >({
        first: first.dice,
        second: second.dice,
        innerApplyBack: ({ state, operation }) => {
            return DieValue.applyBack({ state, operation });
        },
        innerCompose: params => DieValue.composeDownOperation(params),
    });
    if (dice.isError) {
        return dice;
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
        memo: memo.value,
        name: name.value,
        dice: dice.value,
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

    const dice = RecordOperation.restore<
        DieValueTypes.State,
        DieValueTypes.DownOperation,
        DieValueTypes.TwoWayOperation,
        ScalarError
    >({
        nextState: nextState.dice,
        downOperation: downOperation.dice,
        innerDiff: params => DieValue.diff(params),
        innerRestore: params => DieValue.restore(params),
    });
    if (dice.isError) {
        return dice;
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
        dice: dice.value.prevState,
        pieces: pieces.value.prevState,
    };
    const twoWayOperation: TwoWayOperation = {
        $v: 2,
        $r: 1,
        dice: dice.value.twoWayOperation,
        pieces: pieces.value.twoWayOperation,
    };

    if (downOperation.ownerCharacterId !== undefined) {
        prevState.ownerCharacterId = downOperation.ownerCharacterId.oldValue ?? undefined;
        twoWayOperation.ownerCharacterId = {
            oldValue: downOperation.ownerCharacterId.oldValue ?? undefined,
            newValue: nextState.ownerCharacterId,
        };
    }
    if (downOperation.memo !== undefined) {
        const restored = TextOperation.restore({
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

    return Result.ok({ prevState, nextState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const dice = RecordOperation.diff<DieValueTypes.State, DieValueTypes.TwoWayOperation>({
        prevState: prevState.dice,
        nextState: nextState.dice,
        innerDiff: params => DieValue.diff(params),
    });
    const pieces = RecordOperation.diff<PieceTypes.State, PieceTypes.TwoWayOperation>({
        prevState: prevState.pieces,
        nextState: nextState.pieces,
        innerDiff: params => Piece.diff(params),
    });

    const result: TwoWayOperation = {
        $v: 2,
        $r: 1,
        dice,
        pieces,
    };

    if (prevState.ownerCharacterId !== nextState.ownerCharacterId) {
        result.ownerCharacterId = {
            oldValue: prevState.ownerCharacterId,
            newValue: nextState.ownerCharacterId,
        };
    }
    if (prevState.memo !== nextState.memo) {
        result.memo = TextOperation.diff({
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

        const dice = RecordOperation.serverTransform<
            DieValueTypes.State,
            DieValueTypes.State,
            DieValueTypes.TwoWayOperation,
            DieValueTypes.UpOperation,
            TwoWayError
        >({
            prevState: prevState.dice,
            nextState: currentState.dice,
            first: serverOperation?.dice,
            second: clientOperation.dice,
            innerTransform: ({ prevState, nextState, first, second }) =>
                DieValue.serverTransform(true)({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: ({ key }) =>
                    !isAuthorized || dicePieceValueStrIndexes.every(x => x !== key),
                cancelRemove: () => !isAuthorized,
                cancelUpdate: () => !isAuthorized,
            },
        });
        if (dice.isError) {
            return dice;
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
            dice: dice.value,
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

        const transformedMemo = TextOperation.serverTransform({
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
    const dice = RecordOperation.clientTransform<
        DieValueTypes.State,
        DieValueTypes.UpOperation,
        UpError
    >({
        first: first.dice,
        second: second.dice,
        innerTransform: params => DieValue.clientTransform(params),
        innerDiff: params => DieValue.diff(params),
    });
    if (dice.isError) {
        return dice;
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

    const ownerCharacterId = ReplaceOperation.clientTransform({
        first: first.ownerCharacterId,
        second: second.ownerCharacterId,
    });

    const memo = TextOperation.clientTransform({
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

    const firstPrime: UpOperation = {
        $v: 2,
        $r: 1,
        dice: dice.value.firstPrime,
        pieces: pieces.value.firstPrime,
        ownerCharacterId: ownerCharacterId.firstPrime,
        memo: memo.value.firstPrime,
        name: name.value.firstPrime,
    };

    const secondPrime: UpOperation = {
        $v: 2,
        $r: 1,
        dice: dice.value.secondPrime,
        pieces: pieces.value.secondPrime,
        ownerCharacterId: ownerCharacterId.secondPrime,
        memo: memo.value.secondPrime,
        name: name.value.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
