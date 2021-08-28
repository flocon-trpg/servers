import * as t from 'io-ts';
import { DualKeyRecordTwoWayOperation } from '../../../../util/dualKeyRecordOperation';
import * as DualKeyRecordOperation from '../../../../util/dualKeyRecordOperation';
import * as Piece from '../../../../piece/v1';
import {
    recordDownOperationElementFactory,
    recordUpOperationElementFactory,
} from '../../../../util/recordOperationElement';
import * as ReplaceOperation from '../../../../util/replaceOperation';
import {
    Apply,
    ClientTransform,
    Compose,
    Diff,
    RequestedBy,
    Restore,
    ServerTransform,
} from '../../../../util/type';
import { createOperation } from '../../../../util/createOperation';
import { isIdRecord, record } from '../../../../util/record';
import { Result } from '@kizahasi/result';
import { ApplyError, ComposeAndTransformError, PositiveInt } from '@kizahasi/ot-string';
import { CompositeKey } from '@kizahasi/util';

export const state = t.type({
    $v: t.literal(1),
    isValuePrivate: t.boolean,
    value: t.number,
    pieces: record(t.string, record(t.string, Piece.state)),
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(1, {
    isValuePrivate: t.type({ oldValue: t.boolean }),
    value: t.type({ oldValue: t.number }),
    pieces: record(
        t.string,
        record(t.string, recordDownOperationElementFactory(Piece.state, Piece.downOperation))
    ),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(1, {
    isValuePrivate: t.type({ newValue: t.boolean }),
    value: t.type({ newValue: t.number }),
    pieces: record(
        t.string,
        record(t.string, recordUpOperationElementFactory(Piece.state, Piece.upOperation))
    ),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 1;
    isValuePrivate?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    value?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    pieces?: DualKeyRecordTwoWayOperation<Piece.State, Piece.TwoWayOperation>;
};

export const toClientState =
    (isAuthorized: boolean, requestedBy: RequestedBy, activeBoardKey: CompositeKey | null) =>
    (source: State): State => {
        return {
            ...source,
            value: source.isValuePrivate && !isAuthorized ? 0 : source.value,
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
    if (operation.isValuePrivate != null) {
        result.isValuePrivate = operation.isValuePrivate.newValue;
    }
    if (operation.value != null) {
        result.value = operation.value.newValue;
    }

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
    if (operation.isValuePrivate != null) {
        result.isValuePrivate = operation.isValuePrivate.oldValue;
    }
    if (operation.value != null) {
        result.value = operation.value.oldValue;
    }

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
        $v: 1,
        isValuePrivate: ReplaceOperation.composeDownOperation(
            first.isValuePrivate ?? undefined,
            second.isValuePrivate ?? undefined
        ),
        value: ReplaceOperation.composeDownOperation(
            first.value ?? undefined,
            second.value ?? undefined
        ),
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

    const prevState: State = { ...nextState, pieces: pieces.value.prevState };
    const twoWayOperation: TwoWayOperation = {
        $v: 1,
        pieces: pieces.value.twoWayOperation,
    };

    if (downOperation.isValuePrivate != null) {
        prevState.isValuePrivate = downOperation.isValuePrivate.oldValue;
        twoWayOperation.isValuePrivate = {
            ...downOperation.isValuePrivate,
            newValue: nextState.isValuePrivate,
        };
    }
    if (downOperation.value != null) {
        prevState.value = downOperation.value.oldValue;
        twoWayOperation.value = {
            ...downOperation.value,
            newValue: nextState.value,
        };
    }

    return Result.ok({ prevState, nextState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const pieces = DualKeyRecordOperation.diff<Piece.State, Piece.TwoWayOperation>({
        prevState: prevState.pieces,
        nextState: nextState.pieces,
        innerDiff: params => Piece.diff(params),
    });
    const resultType: TwoWayOperation = {
        $v: 1,
        pieces,
    };
    if (prevState.isValuePrivate !== nextState.isValuePrivate) {
        resultType.isValuePrivate = {
            oldValue: prevState.isValuePrivate,
            newValue: nextState.isValuePrivate,
        };
    }
    if (prevState.value !== nextState.value) {
        resultType.value = {
            oldValue: prevState.value,
            newValue: nextState.value,
        };
    }
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
                cancelCreate: () => !isAuthorized,
                cancelRemove: params => !isAuthorized && params.nextState.isPrivate,
                cancelUpdate: params => !isAuthorized && params.nextState.isPrivate,
            },
        });
        if (pieces.isError) {
            return pieces;
        }

        const twoWayOperation: TwoWayOperation = {
            $v: 1,
            pieces: pieces.value,
        };

        twoWayOperation.isValuePrivate = ReplaceOperation.serverTransform({
            first: serverOperation?.isValuePrivate ?? undefined,
            second: clientOperation.isValuePrivate ?? undefined,
            prevState: prevState.isValuePrivate,
        });
        // !isAuthorized の場合は最初の方ですべて弾いているため、isValuePrivateのチェックをする必要はない。
        twoWayOperation.value = ReplaceOperation.serverTransform({
            first: serverOperation?.value ?? undefined,
            second: clientOperation.value ?? undefined,
            prevState: prevState.value,
        });

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
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

    const isValuePrivate = ReplaceOperation.clientTransform({
        first: first.isValuePrivate,
        second: second.isValuePrivate,
    });

    const value = ReplaceOperation.clientTransform({
        first: first.value,
        second: second.value,
    });

    const firstPrime: UpOperation = {
        $v: 1,
        pieces: pieces.value.firstPrime,
        isValuePrivate: isValuePrivate.firstPrime,
        value: value.firstPrime,
    };

    const secondPrime: UpOperation = {
        $v: 1,
        pieces: pieces.value.secondPrime,
        isValuePrivate: isValuePrivate.secondPrime,
        value: value.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
