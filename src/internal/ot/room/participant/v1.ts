import * as t from 'io-ts';
import {
    Apply,
    ClientTransform,
    Compose,
    Diff,
    RequestedBy,
    Restore,
    admin,
    ServerTransform,
} from '../../util/type';
import * as ReplaceOperation from '../../util/replaceOperation';
import { createOperation } from '../../util/createOperation';
import { isIdRecord, record } from '../../util/record';
import { Result } from '@kizahasi/result';
import { chooseRecord, CompositeKey } from '@kizahasi/util';
import * as ImagePieceValue from './imagePieceValue/v1';
import {
    mapRecordOperationElement,
    recordDownOperationElementFactory,
    recordUpOperationElementFactory,
} from '../../util/recordOperationElement';
import * as RecordOperation from '../../util/recordOperation';
import { ApplyError, ComposeAndTransformError, PositiveInt } from '@kizahasi/ot-string';
import { Maybe, maybe } from '../../util/maybe';

export const Player = 'Player';
export const Spectator = 'Spectator';
export const Master = 'Master';

const participantRole = t.union([t.literal(Player), t.literal(Spectator), t.literal(Master)]);
export type ParticipantRole = t.TypeOf<typeof participantRole>;

export const state = t.type({
    $version: t.literal(1),

    name: t.string,
    role: maybe(participantRole),

    // TODO: 互換性のため、maybeを付けている。互換性を壊しても良くなったときはmaybeを外す。
    imagePieceValues: maybe(record(t.string, ImagePieceValue.state)),
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(1, {
    name: t.type({ oldValue: t.string }),
    role: t.type({ oldValue: maybe(participantRole) }),
    imagePieceValues: record(
        t.string,
        recordDownOperationElementFactory(ImagePieceValue.state, ImagePieceValue.downOperation)
    ),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(1, {
    name: t.type({ newValue: t.string }),
    role: t.type({ newValue: maybe(participantRole) }),
    imagePieceValues: record(
        t.string,
        recordUpOperationElementFactory(ImagePieceValue.state, ImagePieceValue.upOperation)
    ),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $version: 1;

    name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    role?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<ParticipantRole>>;
    imagePieceValues?: RecordOperation.RecordTwoWayOperation<
        ImagePieceValue.State,
        ImagePieceValue.TwoWayOperation
    >;
};

export const toClientState =
    (requestedBy: RequestedBy, participantKey: string, activeBoardKey: CompositeKey | null) =>
    (source: State): State => {
        const isAuthorized = RequestedBy.isAuthorized({ requestedBy, userUid: participantKey });
        return {
            ...source,
            imagePieceValues: RecordOperation.toClientState<
                ImagePieceValue.State,
                ImagePieceValue.State
            >({
                serverState: source.imagePieceValues ?? {},
                isPrivate: state => state.isPrivate && !isAuthorized,
                toClientState: ({ state }) =>
                    ImagePieceValue.toClientState(requestedBy, activeBoardKey)(state),
            }),
        };
    };

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        imagePieceValues:
            source.imagePieceValues == null
                ? undefined
                : chooseRecord(source.imagePieceValues, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: ImagePieceValue.toDownOperation,
                      })
                  ),
    };
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return {
        ...source,
        imagePieceValues:
            source.imagePieceValues == null
                ? undefined
                : chooseRecord(source.imagePieceValues, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: ImagePieceValue.toUpOperation,
                      })
                  ),
    };
};

export const apply: Apply<State, UpOperation | TwoWayOperation> = ({ state, operation }) => {
    const result: State = { ...state };
    if (operation.name != null) {
        result.name = operation.name.newValue;
    }
    if (operation.role != null) {
        result.role = operation.role.newValue;
    }

    const imagePieceValues = RecordOperation.apply<
        ImagePieceValue.State,
        ImagePieceValue.UpOperation | ImagePieceValue.TwoWayOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        prevState: state.imagePieceValues ?? {},
        operation: operation.imagePieceValues ?? {},
        innerApply: ({ prevState, operation: upOperation }) => {
            return ImagePieceValue.apply({
                state: prevState,
                operation: upOperation,
            });
        },
    });
    if (imagePieceValues.isError) {
        return imagePieceValues;
    }
    result.imagePieceValues = imagePieceValues.value;

    return Result.ok(result);
};

export const applyBack: Apply<State, DownOperation> = ({ state, operation }) => {
    const result: State = { ...state };
    if (operation.name != null) {
        result.name = operation.name.oldValue;
    }
    if (operation.role != null) {
        result.role = operation.role.oldValue;
    }

    const imagePieceValues = RecordOperation.applyBack<
        ImagePieceValue.State,
        ImagePieceValue.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: state.imagePieceValues ?? {},
        operation: operation.imagePieceValues ?? {},
        innerApplyBack: ({ state, operation }) => {
            return ImagePieceValue.applyBack({
                state,
                operation,
            });
        },
    });
    if (imagePieceValues.isError) {
        return imagePieceValues;
    }
    result.imagePieceValues = imagePieceValues.value;

    return Result.ok(result);
};

export const composeDownOperation: Compose<DownOperation> = ({ first, second }) => {
    const imagePieceValues = RecordOperation.composeDownOperation<
        ImagePieceValue.State,
        ImagePieceValue.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: first.imagePieceValues,
        second: second.imagePieceValues,
        innerApplyBack: params => ImagePieceValue.applyBack(params),
        innerCompose: params => ImagePieceValue.composeDownOperation(params),
    });
    if (imagePieceValues.isError) {
        return imagePieceValues;
    }
    const valueProps: DownOperation = {
        $version: 1,
        name: ReplaceOperation.composeDownOperation(
            first.name ?? undefined,
            second.name ?? undefined
        ),
        role: ReplaceOperation.composeDownOperation(
            first.role ?? undefined,
            second.role ?? undefined
        ),
        imagePieceValues: imagePieceValues.value,
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

    const imagePieceValues = RecordOperation.restore<
        ImagePieceValue.State,
        ImagePieceValue.DownOperation,
        ImagePieceValue.TwoWayOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: nextState.imagePieceValues ?? {},
        downOperation: downOperation.imagePieceValues,
        innerDiff: params => ImagePieceValue.diff(params),
        innerRestore: params => ImagePieceValue.restore(params),
    });
    if (imagePieceValues.isError) {
        return imagePieceValues;
    }

    const prevState: State = {
        ...nextState,
        imagePieceValues: imagePieceValues.value.prevState,
    };
    const twoWayOperation: TwoWayOperation = {
        $version: 1,
        imagePieceValues: imagePieceValues.value.twoWayOperation,
    };

    if (downOperation.name != null) {
        prevState.name = downOperation.name.oldValue;
        twoWayOperation.name = {
            ...downOperation.name,
            newValue: nextState.name,
        };
    }
    if (downOperation.role != null) {
        prevState.role = downOperation.role.oldValue ?? undefined;
        twoWayOperation.role = {
            oldValue: downOperation.role.oldValue ?? undefined,
            newValue: nextState.role,
        };
    }

    return Result.ok({ prevState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const imagePieceValues = RecordOperation.diff<
        ImagePieceValue.State,
        ImagePieceValue.TwoWayOperation
    >({
        prevState: prevState.imagePieceValues ?? {},
        nextState: nextState.imagePieceValues ?? {},
        innerDiff: params => ImagePieceValue.diff(params),
    });
    const result: TwoWayOperation = {
        $version: 1,
        imagePieceValues,
    };
    if (prevState.name !== nextState.name) {
        result.name = { oldValue: prevState.name, newValue: nextState.name };
    }
    if (prevState.role !== nextState.role) {
        result.role = { oldValue: prevState.role, newValue: nextState.role };
    }
    if (isIdRecord(result)) {
        return undefined;
    }
    return result;
};

export const serverTransform =
    ({
        requestedBy,
        participantKey,
        activeBoardSecondKey,
    }: {
        requestedBy: RequestedBy;
        participantKey: string;
        activeBoardSecondKey: string | null | undefined;
    }): ServerTransform<State, TwoWayOperation, UpOperation> =>
    ({ prevState, currentState, clientOperation, serverOperation }) => {
        const isAuthorized = RequestedBy.isAuthorized({ requestedBy, userUid: participantKey });

        const imagePieceValues = RecordOperation.serverTransform<
            ImagePieceValue.State,
            ImagePieceValue.State,
            ImagePieceValue.TwoWayOperation,
            ImagePieceValue.UpOperation,
            string | ApplyError<PositiveInt> | ComposeAndTransformError
        >({
            first: serverOperation?.imagePieceValues,
            second: clientOperation.imagePieceValues,
            prevState: prevState.imagePieceValues ?? {},
            nextState: currentState.imagePieceValues ?? {},
            innerTransform: ({ first, second, prevState, nextState }) =>
                ImagePieceValue.serverTransform(isAuthorized)({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: () => !isAuthorized,
                cancelUpdate: state => !isAuthorized && state.nextState.isPrivate,
                cancelRemove: state => !isAuthorized && state.nextState.isPrivate,
            },
        });
        if (imagePieceValues.isError) {
            return imagePieceValues;
        }

        const twoWayOperation: TwoWayOperation = {
            $version: 1,
            imagePieceValues: imagePieceValues.value,
        };

        if (isAuthorized) {
            twoWayOperation.name = ReplaceOperation.serverTransform({
                first: serverOperation?.name ?? undefined,
                second: clientOperation.name ?? undefined,
                prevState: prevState.name,
            });
        }

        if (requestedBy.type === admin) {
            twoWayOperation.role = ReplaceOperation.serverTransform({
                first: serverOperation?.role ?? undefined,
                second: clientOperation.role ?? undefined,
                prevState: prevState.role,
            });
        }

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
    const imagePieceValues = RecordOperation.clientTransform<
        ImagePieceValue.State,
        ImagePieceValue.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: first.imagePieceValues,
        second: second.imagePieceValues,
        innerTransform: params => ImagePieceValue.clientTransform(params),
        innerDiff: params => {
            const diff = ImagePieceValue.diff(params);
            if (diff == null) {
                return diff;
            }
            return ImagePieceValue.toUpOperation(diff);
        },
    });
    if (imagePieceValues.isError) {
        return imagePieceValues;
    }

    const name = ReplaceOperation.clientTransform({
        first: first.name,
        second: second.name,
    });

    const role = ReplaceOperation.clientTransform({
        first: first.role,
        second: second.role,
    });

    const firstPrime: UpOperation = {
        $version: 1,
        imagePieceValues: imagePieceValues.value.firstPrime,
        name: name.firstPrime,
        role: role.firstPrime,
    };

    const secondPrime: UpOperation = {
        $version: 1,
        imagePieceValues: imagePieceValues.value.secondPrime,
        name: name.secondPrime,
        role: role.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
