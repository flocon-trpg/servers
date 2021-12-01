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
import { DownOperation, State, TwoWayOperation, UpOperation } from './types';
import * as TextOperation from '../../../util/textOperation';
import * as NullableTextOperation from '../../../util/nullableTextOperation';
import * as Room from '../../types';
import {
    RequestedBy,
    isCharacterOwner,
    anyValue,
    canChangeOwnerCharacterId,
} from '../../../util/requestedBy';
import * as Piece from '../../../pieceBase/functions';

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
        };
    };

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        memo: undefined,
        name: undefined,
        ...Piece.toDownOperation(source),
        value: source.value == null ? undefined : TextOperation.toDownOperation(source.value),
    };
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return {
        ...source,
        memo: undefined,
        name: undefined,
        ...Piece.toUpOperation(source),
        value: source.value == null ? undefined : TextOperation.toUpOperation(source.value),
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

    if (operation.valueInputType != null) {
        result.valueInputType = operation.valueInputType.newValue;
    }

    return Result.ok(result);
};

export const applyBack: Apply<State, DownOperation> = ({ state, operation }) => {
    const piece = Piece.applyBack({ state, operation });
    if (piece.isError) {
        return piece;
    }
    const result = { ...state, ...piece.value };

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

    if (operation.valueInputType != null) {
        result.valueInputType = operation.valueInputType.oldValue;
    }

    return Result.ok(result);
};

export const composeDownOperation: Compose<DownOperation, DownError> = ({ first, second }) => {
    const value = TextOperation.composeDownOperation(first.value, second.value);
    if (value.isError) {
        return value;
    }

    const valueProps: DownOperation = {
        $v: 2,
        $r: 1,
        ...Piece.composeDownOperation({ first, second }),
        ownerCharacterId: ReplaceOperation.composeDownOperation(
            first.ownerCharacterId,
            second.ownerCharacterId
        ),
        isValuePrivate: ReplaceOperation.composeDownOperation(
            first.isValuePrivate ?? undefined,
            second.isValuePrivate ?? undefined
        ),
        value: value.value,
        valueInputType: ReplaceOperation.composeDownOperation(
            first.valueInputType ?? undefined,
            second.valueInputType ?? undefined
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

    const piece = Piece.restore({ nextState, downOperation });
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
    if (downOperation.valueInputType != null) {
        prevState.valueInputType = downOperation.valueInputType.oldValue;
        twoWayOperation.valueInputType = {
            ...downOperation.valueInputType,
            newValue: nextState.valueInputType,
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
    if (prevState.valueInputType !== nextState.valueInputType) {
        result.valueInputType = {
            oldValue: prevState.valueInputType,
            newValue: nextState.valueInputType,
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

        twoWayOperation.valueInputType = ReplaceOperation.serverTransform({
            first: serverOperation?.valueInputType ?? undefined,
            second: clientOperation.valueInputType ?? undefined,
            prevState: prevState.valueInputType,
        });

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
    const piece = Piece.clientTransform({ first, second });

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

    const valueInputType = ReplaceOperation.clientTransform({
        first: first.valueInputType,
        second: second.valueInputType,
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

    const firstPrime: UpOperation = {
        ...piece.value?.firstPrime,
        $v: 2,
        $r: 1,
        ownerCharacterId: ownerCharacterId.firstPrime,
        isValuePrivate: isValuePrivate.firstPrime,
        value: value.value.firstPrime,
        valueInputType: valueInputType.firstPrime,
        memo: memo.value.firstPrime,
        name: name.value.firstPrime,
    };

    const secondPrime: UpOperation = {
        ...piece.value?.secondPrime,
        $v: 2,
        $r: 1,
        ownerCharacterId: ownerCharacterId.secondPrime,
        isValuePrivate: isValuePrivate.secondPrime,
        value: value.value.secondPrime,
        valueInputType: valueInputType.secondPrime,
        memo: memo.value.secondPrime,
        name: name.value.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
