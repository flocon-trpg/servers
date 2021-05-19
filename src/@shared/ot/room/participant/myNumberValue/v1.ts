import * as t from 'io-ts';
import { ResultModule } from '../../../../Result';
import { chooseDualKeyRecord } from '../../../../utils';
import { DualKeyRecordTransformer, DualKeyRecordTwoWayOperation } from '../../util/dualKeyRecordOperation';
import * as DualKeyRecordOperation from '../../util/dualKeyRecordOperation';
import * as Piece from '../../../piece/v1';
import { recordDownOperationElementFactory, recordUpOperationElementFactory } from '../../util/recordOperationElement';
import * as ReplaceOperation from '../../util/replaceOperation';
import { TransformerFactory } from '../../util/transformerFactory';
import { Apply, ToClientOperationParams } from '../../util/type';
import { ApplyError, ComposeAndTransformError, PositiveInt } from '../../../../textOperation';
import { operation } from '../../util/operation';
import { isIdRecord } from '../../util/record';

export const state = t.type({
    $version: t.literal(1),
    isValuePrivate: t.boolean,
    value: t.number,
    pieces: t.record(t.string, t.record(t.string, Piece.state)),
});

export type State = t.TypeOf<typeof state>;

export const downOperation = operation(1, {
    isValuePrivate: t.type({ oldValue: t.boolean }),
    value: t.type({ oldValue: t.number }),
    pieces: t.record(t.string, t.record(t.string, recordDownOperationElementFactory(Piece.state, Piece.downOperation))),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = operation(1, {
    isValuePrivate: t.type({ newValue: t.boolean }),
    value: t.type({ newValue: t.number }),
    pieces: t.record(t.string, t.record(t.string, recordUpOperationElementFactory(Piece.state, Piece.upOperation))),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $version: 1;
    isValuePrivate?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    value?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    pieces?: DualKeyRecordTwoWayOperation<Piece.State, Piece.TwoWayOperation>;
}

export const toClientState = (createdByMe: boolean) => (source: State): State => {
    return {
        ...source,
        value: source.isValuePrivate && !createdByMe ? 0 : source.value,
        pieces: chooseDualKeyRecord<Piece.State, Piece.State>(source.pieces, state => Piece.toClientState(state))
    };
};

export const toServerOperation = (source: TwoWayOperation): DownOperation => {
    return source;
};

export const toClientOperation = (createdByMe: boolean) => ({ prevState, nextState, diff }: ToClientOperationParams<State, TwoWayOperation>): UpOperation => {
    return {
        ...diff,
        value: ReplaceOperation.toPrivateClientOperation({
            oldValue: {
                value: prevState.value,
                isValuePrivate: prevState.isValuePrivate,
            },
            newValue: {
                value: nextState.value,
                isValuePrivate: nextState.isValuePrivate,
            },
            defaultState: 0,
            createdByMe,
        }),
        pieces: diff.pieces == null ? undefined : DualKeyRecordOperation.toClientOperation({
            diff: diff.pieces,
            isPrivate: () => false,
            prevState: prevState.pieces,
            nextState: nextState.pieces,
            toClientState: ({ nextState }) => Piece.toClientState(nextState),
            toClientOperation: params => Piece.toClientOperation(params),
        })
    };
};

export const apply: Apply<State, UpOperation | TwoWayOperation> = ({ state, operation }) => {
    const result: State = { ...state };
    if (operation.isValuePrivate != null) {
        result.isValuePrivate = operation.isValuePrivate.newValue;
    }
    if (operation.value != null) {
        result.value = operation.value.newValue;
    }

    const pieces = DualKeyRecordOperation.apply<Piece.State, Piece.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: state.pieces, operation: operation.pieces, innerApply: ({ prevState, operation: upOperation }) => {
            return Piece.apply({ state: prevState, operation: upOperation });
        }
    });
    if (pieces.isError) {
        return pieces;
    }
    result.pieces = pieces.value;

    return ResultModule.ok(result);
};

const createPieceTransformer = (createdByMe: boolean) => Piece.transformerFactory(createdByMe);
const createPiecesTransformer = (createdByMe: boolean) => new DualKeyRecordTransformer(createPieceTransformer(createdByMe));

export const transformerFactory = (createdByMe: boolean): TransformerFactory<string, State, State, DownOperation, UpOperation, TwoWayOperation> => ({
    composeLoose: ({ first, second }) => {
        const piecesTransformer = createPiecesTransformer(createdByMe);
        const pieces = piecesTransformer.composeLoose({
            first: first.pieces,
            second: second.pieces,
        });
        if (pieces.isError) {
            return pieces;
        }

        const valueProps: DownOperation = {
            $version: 1,
            isValuePrivate: ReplaceOperation.composeDownOperation(first.isValuePrivate ?? undefined, second.isValuePrivate ?? undefined),
            value: ReplaceOperation.composeDownOperation(first.value ?? undefined, second.value ?? undefined),
            pieces: pieces.value,
        };
        return ResultModule.ok(valueProps);
    },
    restore: ({ nextState, downOperation }) => {
        if (downOperation === undefined) {
            return ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
        }

        const piecesTransformer = createPiecesTransformer(createdByMe);
        const pieces = piecesTransformer.restore({
            nextState: nextState.pieces,
            downOperation: downOperation.pieces,
        });
        if (pieces.isError) {
            return pieces;
        }

        const prevState: State = { ...nextState, pieces: pieces.value.prevState, };
        const twoWayOperation: TwoWayOperation = { $version: 1, pieces: pieces.value.twoWayOperation };

        if (downOperation.isValuePrivate != null) {
            prevState.isValuePrivate = downOperation.isValuePrivate.oldValue;
            twoWayOperation.isValuePrivate = { ...downOperation.isValuePrivate, newValue: nextState.isValuePrivate };
        }
        if (downOperation.value != null) {
            prevState.value = downOperation.value.oldValue;
            twoWayOperation.value = { ...downOperation.value, newValue: nextState.value };
        }

        return ResultModule.ok({ prevState, nextState, twoWayOperation });
    },
    transform: ({ prevState, clientOperation, serverOperation, currentState }) => {
        if (!createdByMe) {
            // 自分以外はどのプロパティも編集できない。
            return ResultModule.ok(undefined);
        }

        const piecesTransformer = createPiecesTransformer(createdByMe);
        const pieces = piecesTransformer.transform({
            prevState: prevState.pieces,
            currentState: currentState.pieces,
            clientOperation: clientOperation.pieces,
            serverOperation: serverOperation?.pieces,
        });
        if (pieces.isError) {
            return pieces;
        }

        const twoWayOperation: TwoWayOperation = { $version: 1, pieces: pieces.value };

        twoWayOperation.isValuePrivate = ReplaceOperation.transform({
            first: serverOperation?.isValuePrivate ?? undefined,
            second: clientOperation.isValuePrivate ?? undefined,
            prevState: prevState.isValuePrivate,
        });
        // !createdByMe の場合は最初の方ですべて弾いているため、isValuePrivateのチェックをする必要はない。
        twoWayOperation.value = ReplaceOperation.transform({
            first: serverOperation?.value ?? undefined,
            second: clientOperation.value ?? undefined,
            prevState: prevState.value,
        });

        if (isIdRecord(twoWayOperation)) {
            return ResultModule.ok(undefined);
        }

        return ResultModule.ok({ ...twoWayOperation });
    },
    diff: ({ prevState, nextState }) => {
        const piecesTransformer = createPiecesTransformer(createdByMe);
        const pieces = piecesTransformer.diff({
            prevState: prevState.pieces,
            nextState: nextState.pieces,
        });
        const resultType: TwoWayOperation = {
            $version: 1,
            pieces,
        };
        if (prevState.isValuePrivate !== nextState.isValuePrivate) {
            resultType.isValuePrivate = { oldValue: prevState.isValuePrivate, newValue: nextState.isValuePrivate };
        }
        if (prevState.value !== nextState.value) {
            resultType.value = { oldValue: prevState.value, newValue: nextState.value };
        }
        if (isIdRecord(resultType)) {
            return undefined;
        }
        return { ...resultType };
    },
    applyBack: ({ downOperation, nextState }) => {
        const piecesTransformer = createPiecesTransformer(createdByMe);
        const pieces = piecesTransformer.applyBack({
            downOperation: downOperation.pieces,
            nextState: nextState.pieces,
        });
        if (pieces.isError) {
            return pieces;
        }

        const result: State = { ...nextState, pieces: pieces.value };

        if (downOperation.isValuePrivate != null) {
            result.isValuePrivate = downOperation.isValuePrivate.oldValue;
        }
        if (downOperation.value != null) {
            result.value = downOperation.value.oldValue;
        }

        return ResultModule.ok(result);
    },
    toServerState: ({ clientState }) => clientState,
    protectedValuePolicy: {
        cancelRemove: () => !createdByMe,
        cancelCreate: () => !createdByMe,
    },
});