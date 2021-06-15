import * as t from 'io-ts';
import { DualKeyRecordTwoWayOperation } from '../../../util/dualKeyRecordOperation';
import * as DualKeyRecordOperation from '../../../util/dualKeyRecordOperation';
import * as DieValue from './dieValue/v1';
import * as Piece from '../../../piece/v1';
import {
    recordDownOperationElementFactory,
    recordUpOperationElementFactory,
} from '../../../util/recordOperationElement';
import {
    Apply,
    ClientTransform,
    Compose,
    Diff,
    Restore,
    ServerTransform,
    ToClientOperationParams,
} from '../../../util/type';
import { createOperation } from '../../../util/createOperation';
import { isIdRecord, record } from '../../../util/record';
import { Result } from '@kizahasi/result';
import { ApplyError, ComposeAndTransformError, PositiveInt } from '@kizahasi/ot-string';
import { chooseDualKeyRecord, chooseRecord } from '@kizahasi/util';
import { RecordTwoWayOperation } from '../../../util/recordOperation';
import * as RecordOperation from '../../../util/recordOperation';

export const dicePieceValueStrIndexes = ['1', '2', '3', '4'] as const;

export const state = t.type({
    $version: t.literal(1),
    dice: record(t.string, DieValue.state),
    pieces: record(t.string, record(t.string, Piece.state)),
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(1, {
    dice: record(
        t.string,
        recordDownOperationElementFactory(DieValue.state, DieValue.downOperation)
    ),
    pieces: record(
        t.string,
        record(t.string, recordDownOperationElementFactory(Piece.state, Piece.downOperation))
    ),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(1, {
    dice: record(t.string, recordUpOperationElementFactory(DieValue.state, DieValue.upOperation)),
    pieces: record(
        t.string,
        record(t.string, recordUpOperationElementFactory(Piece.state, Piece.upOperation))
    ),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $version: 1;
    dice?: RecordTwoWayOperation<DieValue.State, DieValue.TwoWayOperation>;
    pieces?: DualKeyRecordTwoWayOperation<Piece.State, Piece.TwoWayOperation>;
};

export const toClientState = (createdByMe: boolean) => (source: State): State => {
    return {
        ...source,
        dice: chooseRecord(source.dice, state => DieValue.toClientState(createdByMe)(state)),
        pieces: chooseDualKeyRecord<Piece.State, Piece.State>(source.pieces, state =>
            Piece.toClientState(state)
        ),
    };
};

export const toClientOperation = (createdByMe: boolean) => ({
    prevState,
    nextState,
    diff,
}: ToClientOperationParams<State, TwoWayOperation>): UpOperation => {
    const result = {
        ...diff,
        dice:
            diff.dice == null
                ? undefined
                : RecordOperation.toClientOperation({
                      diff: diff.dice,
                      isPrivate: () => false,
                      prevState: prevState.dice,
                      nextState: nextState.dice,
                      toClientState: ({ nextState }) =>
                          DieValue.toClientState(createdByMe)(nextState),
                      toClientOperation: params => DieValue.toClientOperation(createdByMe)(params),
                  }),
        pieces:
            diff.pieces == null
                ? undefined
                : DualKeyRecordOperation.toClientOperation({
                      diff: diff.pieces,
                      isPrivate: () => false,
                      prevState: prevState.pieces,
                      nextState: nextState.pieces,
                      toClientState: ({ nextState }) => Piece.toClientState(nextState),
                      toClientOperation: params => Piece.toClientOperation(params),
                  }),
    };
    return result;
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
        DieValue.State,
        DieValue.UpOperation,
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
        Piece.State,
        Piece.UpOperation,
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
        DieValue.State,
        DieValue.DownOperation,
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
        Piece.State,
        Piece.DownOperation,
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
        DieValue.State,
        DieValue.DownOperation,
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
        Piece.State,
        Piece.DownOperation,
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
        $version: 1,
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
        DieValue.State,
        DieValue.DownOperation,
        DieValue.TwoWayOperation,
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
        Piece.State,
        Piece.DownOperation,
        Piece.TwoWayOperation,
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
        $version: 1,
        dice: dice.value.twoWayOperation,
        pieces: pieces.value.twoWayOperation,
    };

    return Result.ok({ prevState, nextState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const dice = RecordOperation.diff<DieValue.State, DieValue.TwoWayOperation>({
        prevState: prevState.dice,
        nextState: nextState.dice,
        innerDiff: params => DieValue.diff(params),
    });
    const pieces = DualKeyRecordOperation.diff<Piece.State, Piece.TwoWayOperation>({
        prevState: prevState.pieces,
        nextState: nextState.pieces,
        innerDiff: params => Piece.diff(params),
    });
    const resultType: TwoWayOperation = {
        $version: 1,
        dice,
        pieces,
    };
    if (isIdRecord(resultType)) {
        return undefined;
    }
    return resultType;
};

export const serverTransform = (
    createdByMe: boolean
): ServerTransform<State, TwoWayOperation, UpOperation> => ({
    prevState,
    currentState,
    clientOperation,
    serverOperation,
}) => {
    if (!createdByMe) {
        // 自分以外はどのプロパティも編集できない。
        return Result.ok(undefined);
    }

    const dice = RecordOperation.serverTransform<
        DieValue.State,
        DieValue.State,
        DieValue.TwoWayOperation,
        DieValue.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        prevState: prevState.dice,
        nextState: currentState.dice,
        first: serverOperation?.dice,
        second: clientOperation.dice,
        innerTransform: ({ prevState, nextState, first, second }) =>
            DieValue.serverTransform(createdByMe)({
                prevState,
                currentState: nextState,
                serverOperation: first,
                clientOperation: second,
            }),
        toServerState: state => state,
        cancellationPolicy: {
            cancelCreate: ({ key }) =>
                !createdByMe || dicePieceValueStrIndexes.every(x => x !== key),
            cancelRemove: () => !createdByMe,
            cancelUpdate: () => !createdByMe,
        },
    });
    if (dice.isError) {
        return dice;
    }

    const pieces = DualKeyRecordOperation.serverTransform<
        Piece.State,
        Piece.State,
        Piece.TwoWayOperation,
        Piece.UpOperation,
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
            cancelCreate: () => !createdByMe,
            cancelRemove: params => !createdByMe && params.nextState.isPrivate,
            cancelUpdate: params => !createdByMe && params.nextState.isPrivate,
        },
    });
    if (pieces.isError) {
        return pieces;
    }

    const twoWayOperation: TwoWayOperation = {
        $version: 1,
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
        DieValue.State,
        DieValue.UpOperation,
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
        Piece.State,
        Piece.UpOperation,
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
        $version: 1,
        dice: dice.value.firstPrime,
        pieces: pieces.value.firstPrime,
    };

    const secondPrime: UpOperation = {
        $version: 1,
        dice: dice.value.secondPrime,
        pieces: pieces.value.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
