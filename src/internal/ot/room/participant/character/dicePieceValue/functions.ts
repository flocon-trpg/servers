import * as DualKeyRecordOperation from '../../../../util/dualKeyRecordOperation';
import * as DieValue from './dieValue/functions';
import * as DieValueTypes from './dieValue/types';
import * as Piece from '../../../../piece/functions';
import * as PieceTypes from '../../../../piece/types';
import {
    Apply,
    ClientTransform,
    Compose,
    Diff,
    RequestedBy,
    Restore,
    ServerTransform,
} from '../../../../util/type';
import { isIdRecord } from '../../../../util/record';
import { Result } from '@kizahasi/result';
import { ApplyError, ComposeAndTransformError, PositiveInt } from '@kizahasi/ot-string';
import { chooseRecord, CompositeKey } from '@kizahasi/util';
import * as RecordOperation from '../../../../util/recordOperation';
import {
    dicePieceValueStrIndexes,
    DownOperation,
    State,
    TwoWayOperation,
    UpOperation,
} from './types';

export const toClientState =
    (isAuthorized: boolean, requestedBy: RequestedBy, activeBoardKey: CompositeKey | null) =>
    (source: State): State => {
        return {
            ...source,
            dice: chooseRecord(source.dice, state => DieValue.toClientState(isAuthorized)(state)),
            pieces: Piece.toClientStateMany(requestedBy, activeBoardKey)(source.pieces),
        };
    };

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return source;
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return source;
};

export const apply: Apply<State, UpOperation | TwoWayOperation> = ({ state, operation }) => {
    const result: State = { ...state };

    const dice = RecordOperation.apply<
        DieValueTypes.State,
        DieValueTypes.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        prevState: state.dice,
        operation: operation.dice,
        innerApply: ({ prevState, operation: upOperation }) => {
            return DieValue.apply({ state: prevState, operation: upOperation });
        },
    });
    if (dice.isError) {
        return dice;
    }
    result.dice = dice.value;

    const pieces = DualKeyRecordOperation.apply<
        PieceTypes.State,
        PieceTypes.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
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

    const dice = RecordOperation.applyBack<
        DieValueTypes.State,
        DieValueTypes.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
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

    const pieces = DualKeyRecordOperation.applyBack<
        PieceTypes.State,
        PieceTypes.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
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

export const composeDownOperation: Compose<DownOperation> = ({ first, second }) => {
    const dice = RecordOperation.composeDownOperation<
        DieValueTypes.State,
        DieValueTypes.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
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

    const pieces = DualKeyRecordOperation.composeDownOperation<
        PieceTypes.State,
        PieceTypes.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
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
        $v: 1,
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
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: nextState.dice,
        downOperation: downOperation.dice,
        innerDiff: params => DieValue.diff(params),
        innerRestore: params => DieValue.restore(params),
    });
    if (dice.isError) {
        return dice;
    }

    const pieces = DualKeyRecordOperation.restore<
        PieceTypes.State,
        PieceTypes.DownOperation,
        PieceTypes.TwoWayOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
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
        $v: 1,
        dice: dice.value.twoWayOperation,
        pieces: pieces.value.twoWayOperation,
    };

    return Result.ok({ prevState, nextState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const dice = RecordOperation.diff<DieValueTypes.State, DieValueTypes.TwoWayOperation>({
        prevState: prevState.dice,
        nextState: nextState.dice,
        innerDiff: params => DieValue.diff(params),
    });
    const pieces = DualKeyRecordOperation.diff<PieceTypes.State, PieceTypes.TwoWayOperation>({
        prevState: prevState.pieces,
        nextState: nextState.pieces,
        innerDiff: params => Piece.diff(params),
    });
    const resultType: TwoWayOperation = {
        $v: 1,
        dice,
        pieces,
    };
    if (isIdRecord(resultType)) {
        return undefined;
    }
    return resultType;
};

export const serverTransform =
    (isAuthorized: boolean): ServerTransform<State, TwoWayOperation, UpOperation> =>
    ({ prevState, currentState, clientOperation, serverOperation }) => {
        if (!isAuthorized) {
            // 自分以外はどのプロパティも編集できない。
            return Result.ok(undefined);
        }

        const dice = RecordOperation.serverTransform<
            DieValueTypes.State,
            DieValueTypes.State,
            DieValueTypes.TwoWayOperation,
            DieValueTypes.UpOperation,
            string | ApplyError<PositiveInt> | ComposeAndTransformError
        >({
            prevState: prevState.dice,
            nextState: currentState.dice,
            first: serverOperation?.dice,
            second: clientOperation.dice,
            innerTransform: ({ prevState, nextState, first, second }) =>
                DieValue.serverTransform(isAuthorized)({
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

        const pieces = DualKeyRecordOperation.serverTransform<
            PieceTypes.State,
            PieceTypes.State,
            PieceTypes.TwoWayOperation,
            PieceTypes.UpOperation,
            string | ApplyError<PositiveInt> | ComposeAndTransformError
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
            $v: 1,
            dice: dice.value,
            pieces: pieces.value,
        };

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
    const dice = RecordOperation.clientTransform<
        DieValueTypes.State,
        DieValueTypes.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: first.dice,
        second: second.dice,
        innerTransform: params => DieValue.clientTransform(params),
        innerDiff: params => DieValue.diff(params),
    });
    if (dice.isError) {
        return dice;
    }

    const pieces = DualKeyRecordOperation.clientTransform<
        PieceTypes.State,
        PieceTypes.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
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
        $v: 1,
        dice: dice.value.firstPrime,
        pieces: pieces.value.firstPrime,
    };

    const secondPrime: UpOperation = {
        $v: 1,
        dice: dice.value.secondPrime,
        pieces: pieces.value.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
