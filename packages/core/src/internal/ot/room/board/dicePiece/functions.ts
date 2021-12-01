import * as DieValue from './dieValue/functions';
import * as DieValueTypes from './dieValue/types';
import * as Piece from '../../../pieceBase/functions';
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
} from '../../../util/type';
import { isIdRecord } from '../../../util/record';
import { Result } from '@kizahasi/result';
import { chooseRecord } from '@flocon-trpg/utils';
import * as RecordOperation from '../../../util/recordOperation';
import * as ReplaceOperation from '../../../util/replaceOperation';
import { dicePieceStrIndexes, DownOperation, State, TwoWayOperation, UpOperation } from './types';
import * as Room from '../../types';
import {
    anyValue,
    RequestedBy,
    isCharacterOwner,
    canChangeOwnerCharacterId,
} from '../../../util/requestedBy';
import * as NullableTextOperation from '../../../util/nullableTextOperation';

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
        };
    };

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        memo: undefined,
        name: undefined,
        ...Piece.toDownOperation(source),
    };
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return {
        ...source,
        memo: undefined,
        name: undefined,
        ...Piece.toUpOperation(source),
    };
};

export const apply: Apply<State, UpOperation> = ({ state, operation }) => {
    const piece = Piece.apply({ state, operation });
    if (piece.isError) {
        return piece;
    }
    const result: State = { ...state, ...piece.value };

    if (operation.ownerCharacterId != null) {
        result.ownerCharacterId = operation.ownerCharacterId.newValue;
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

    return Result.ok(result);
};

export const applyBack: Apply<State, DownOperation> = ({ state, operation }) => {
    const piece = Piece.applyBack({ state, operation });
    if (piece.isError) {
        return piece;
    }
    const result: State = { ...state, ...piece.value };

    if (operation.ownerCharacterId != null) {
        result.ownerCharacterId = operation.ownerCharacterId.oldValue;
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

    return Result.ok(result);
};

export const composeDownOperation: Compose<DownOperation, DownError> = ({ first, second }) => {
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

    const valueProps: DownOperation = {
        $v: 2,
        $r: 1,
        ...Piece.composeDownOperation({ first, second }),
        ownerCharacterId: ReplaceOperation.composeDownOperation(
            first.ownerCharacterId,
            second.ownerCharacterId
        ),
        dice: dice.value,
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

    const piece = Piece.restore({ nextState, downOperation });
    if (piece.isError) {
        return piece;
    }

    const prevState: State = {
        ...nextState,
        ...piece.value.prevState,
        dice: dice.value.prevState,
    };
    const twoWayOperation: TwoWayOperation = {
        $v: 2,
        $r: 1,
        ...piece.value.twoWayOperation,
        dice: dice.value.twoWayOperation,
    };

    if (downOperation.ownerCharacterId !== undefined) {
        prevState.ownerCharacterId = downOperation.ownerCharacterId.oldValue ?? undefined;
        twoWayOperation.ownerCharacterId = {
            oldValue: downOperation.ownerCharacterId.oldValue ?? undefined,
            newValue: nextState.ownerCharacterId,
        };
    }

    return Result.ok({ prevState, nextState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const result: TwoWayOperation = {
        $v: 2,
        $r: 1,
        ...Piece.diff({ prevState, nextState }),
    };

    if (prevState.ownerCharacterId !== nextState.ownerCharacterId) {
        result.ownerCharacterId = {
            oldValue: prevState.ownerCharacterId,
            newValue: nextState.ownerCharacterId,
        };
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
                    !isAuthorized || dicePieceStrIndexes.every(x => x !== key),
                cancelRemove: () => !isAuthorized,
                cancelUpdate: () => !isAuthorized,
            },
        });
        if (dice.isError) {
            return dice;
        }

        const piece = Piece.serverTransform({
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
            dice: dice.value,
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

    const piece = Piece.clientTransform({ first, second });

    const ownerCharacterId = ReplaceOperation.clientTransform({
        first: first.ownerCharacterId,
        second: second.ownerCharacterId,
    });

    const firstPrime: UpOperation = {
        ...piece.value?.firstPrime,
        $v: 2,
        $r: 1,
        dice: dice.value.firstPrime,
        ownerCharacterId: ownerCharacterId.firstPrime,
    };

    const secondPrime: UpOperation = {
        ...piece.value?.secondPrime,
        $v: 2,
        $r: 1,
        dice: dice.value.secondPrime,
        ownerCharacterId: ownerCharacterId.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
