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
import { isIdRecord } from '../../util/record';
import { Result } from '@kizahasi/result';
import { chooseRecord, CompositeKey } from '@kizahasi/util';
import { mapRecordOperationElement } from '../../util/recordOperationElement';
import * as RecordOperation from '../../util/recordOperation';
import { ApplyError, ComposeAndTransformError, PositiveInt } from '@kizahasi/ot-string';
import * as Board from './board/functions';
import * as BoardTypes from './board/types';
import * as Character from './character/functions';
import * as CharacterTypes from './character/types';
import * as ImagePieceValue from './imagePieceValue/functions';
import * as ImagePieceValueTypes from './imagePieceValue/types';
import { isBoardVisible } from '../../util/isBoardVisible';
import { DownOperation, State, TwoWayOperation, UpOperation } from './types';

export const toClientState =
    (requestedBy: RequestedBy, participantKey: string, activeBoardKey: CompositeKey | null) =>
    (source: State): State => {
        const isAuthorized = RequestedBy.isAuthorized({ requestedBy, userUid: participantKey });
        return {
            ...source,
            boards: RecordOperation.toClientState<BoardTypes.State, BoardTypes.State>({
                serverState: source.boards,
                isPrivate: (state, key) => {
                    return !isBoardVisible({
                        requestedBy,
                        boardKey: { createdBy: participantKey, id: key },
                        activeBoardKey,
                    });
                },
                toClientState: ({ state }) => Board.toClientState(state),
            }),
            characters: RecordOperation.toClientState<CharacterTypes.State, CharacterTypes.State>({
                serverState: source.characters,
                isPrivate: state =>
                    !RequestedBy.isAuthorized({
                        requestedBy,
                        userUid: participantKey,
                    }) && state.isPrivate,
                toClientState: ({ state }) =>
                    Character.toClientState(
                        RequestedBy.isAuthorized({ requestedBy, userUid: participantKey }),
                        requestedBy,
                        activeBoardKey ?? null
                    )(state),
            }),
            imagePieceValues: RecordOperation.toClientState<
                ImagePieceValueTypes.State,
                ImagePieceValueTypes.State
            >({
                serverState: source.imagePieceValues,
                isPrivate: state => state.isPrivate && !isAuthorized,
                toClientState: ({ state }) =>
                    ImagePieceValue.toClientState(requestedBy, activeBoardKey)(state),
            }),
        };
    };

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        boards:
            source.boards == null
                ? undefined
                : chooseRecord(source.boards, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: Board.toDownOperation,
                      })
                  ),
        characters:
            source.characters == null
                ? undefined
                : chooseRecord(source.characters, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: Character.toDownOperation,
                      })
                  ),
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
        boards:
            source.boards == null
                ? undefined
                : chooseRecord(source.boards, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: Board.toUpOperation,
                      })
                  ),
        characters:
            source.characters == null
                ? undefined
                : chooseRecord(source.characters, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: Character.toUpOperation,
                      })
                  ),
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

    const boards = RecordOperation.apply<
        BoardTypes.State,
        BoardTypes.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        prevState: state.boards,
        operation: operation.boards,
        innerApply: ({ prevState, operation: upOperation }) => {
            return Board.apply({ state: prevState, operation: upOperation });
        },
    });
    if (boards.isError) {
        return boards;
    }
    result.boards = boards.value;

    const characters = RecordOperation.apply<
        CharacterTypes.State,
        CharacterTypes.UpOperation | CharacterTypes.TwoWayOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        prevState: state.characters,
        operation: operation.characters,
        innerApply: ({ prevState, operation: upOperation }) => {
            return Character.apply({
                state: prevState,
                operation: upOperation,
            });
        },
    });
    if (characters.isError) {
        return characters;
    }
    result.characters = characters.value;

    const imagePieceValues = RecordOperation.apply<
        ImagePieceValueTypes.State,
        ImagePieceValueTypes.UpOperation | ImagePieceValueTypes.TwoWayOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        prevState: state.imagePieceValues,
        operation: operation.imagePieceValues,
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

    const boards = RecordOperation.applyBack<
        BoardTypes.State,
        BoardTypes.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: state.boards,
        operation: operation.boards,
        innerApplyBack: ({ state, operation }) => {
            return Board.applyBack({ state, operation });
        },
    });
    if (boards.isError) {
        return boards;
    }
    result.boards = boards.value;

    const characters = RecordOperation.applyBack<
        CharacterTypes.State,
        CharacterTypes.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: state.characters,
        operation: operation.characters,
        innerApplyBack: ({ state, operation }) => {
            return Character.applyBack({ state, operation });
        },
    });
    if (characters.isError) {
        return characters;
    }
    result.characters = characters.value;

    const imagePieceValues = RecordOperation.applyBack<
        ImagePieceValueTypes.State,
        ImagePieceValueTypes.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: state.imagePieceValues,
        operation: operation.imagePieceValues,
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
    const boards = RecordOperation.composeDownOperation<
        BoardTypes.State,
        BoardTypes.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: first.boards,
        second: second.boards,
        innerApplyBack: params => Board.applyBack(params),
        innerCompose: params => Board.composeDownOperation(params),
    });
    if (boards.isError) {
        return boards;
    }

    const characters = RecordOperation.composeDownOperation<
        CharacterTypes.State,
        CharacterTypes.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: first.characters,
        second: second.characters,
        innerApplyBack: params => Character.applyBack(params),
        innerCompose: params => Character.composeDownOperation(params),
    });
    if (characters.isError) {
        return characters;
    }

    const imagePieceValues = RecordOperation.composeDownOperation<
        ImagePieceValueTypes.State,
        ImagePieceValueTypes.DownOperation,
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
        $v: 1,
        name: ReplaceOperation.composeDownOperation(
            first.name ?? undefined,
            second.name ?? undefined
        ),
        role: ReplaceOperation.composeDownOperation(
            first.role ?? undefined,
            second.role ?? undefined
        ),
        boards: boards.value,
        characters: characters.value,
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

    const boards = RecordOperation.restore<
        BoardTypes.State,
        BoardTypes.DownOperation,
        BoardTypes.TwoWayOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: nextState.boards,
        downOperation: downOperation.boards,
        innerDiff: params => Board.diff(params),
        innerRestore: params => Board.restore(params),
    });
    if (boards.isError) {
        return boards;
    }

    const characters = RecordOperation.restore<
        CharacterTypes.State,
        CharacterTypes.DownOperation,
        CharacterTypes.TwoWayOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: nextState.characters,
        downOperation: downOperation.characters,
        innerDiff: params => Character.diff(params),
        innerRestore: params => Character.restore(params),
    });
    if (characters.isError) {
        return characters;
    }

    const imagePieceValues = RecordOperation.restore<
        ImagePieceValueTypes.State,
        ImagePieceValueTypes.DownOperation,
        ImagePieceValueTypes.TwoWayOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: nextState.imagePieceValues,
        downOperation: downOperation.imagePieceValues,
        innerDiff: params => ImagePieceValue.diff(params),
        innerRestore: params => ImagePieceValue.restore(params),
    });
    if (imagePieceValues.isError) {
        return imagePieceValues;
    }

    const prevState: State = {
        ...nextState,
        boards: boards.value.prevState,
        characters: characters.value.prevState,
        imagePieceValues: imagePieceValues.value.prevState,
    };
    const twoWayOperation: TwoWayOperation = {
        $v: 1,
        boards: boards.value.twoWayOperation,
        characters: characters.value.twoWayOperation,
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
    const boards = RecordOperation.diff<BoardTypes.State, BoardTypes.TwoWayOperation>({
        prevState: prevState.boards,
        nextState: nextState.boards,
        innerDiff: params => Board.diff(params),
    });
    const characters = RecordOperation.diff<CharacterTypes.State, CharacterTypes.TwoWayOperation>({
        prevState: prevState.characters,
        nextState: nextState.characters,
        innerDiff: params => Character.diff(params),
    });
    const imagePieceValues = RecordOperation.diff<
        ImagePieceValueTypes.State,
        ImagePieceValueTypes.TwoWayOperation
    >({
        prevState: prevState.imagePieceValues,
        nextState: nextState.imagePieceValues,
        innerDiff: params => ImagePieceValue.diff(params),
    });
    const result: TwoWayOperation = {
        $v: 1,
        boards,
        characters,
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
        activeBoardKey,
    }: {
        requestedBy: RequestedBy;
        participantKey: string;
        activeBoardKey: CompositeKey | null;
    }): ServerTransform<State, TwoWayOperation, UpOperation> =>
    ({ prevState, currentState, clientOperation, serverOperation }) => {
        const isAuthorized = RequestedBy.isAuthorized({ requestedBy, userUid: participantKey });

        const boards = RecordOperation.serverTransform<
            BoardTypes.State,
            BoardTypes.State,
            BoardTypes.TwoWayOperation,
            BoardTypes.UpOperation,
            string | ApplyError<PositiveInt> | ComposeAndTransformError
        >({
            first: serverOperation?.boards,
            second: clientOperation.boards,
            prevState: prevState.boards,
            nextState: currentState.boards,
            innerTransform: ({ first, second, prevState, nextState }) =>
                Board.serverTransform(requestedBy)({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: () =>
                    !RequestedBy.isAuthorized({
                        requestedBy,
                        userUid: participantKey,
                    }),
                cancelUpdate: ({ key }) => {
                    return !isBoardVisible({
                        boardKey: { createdBy: participantKey, id: key },
                        activeBoardKey,
                        requestedBy,
                    });
                },
                cancelRemove: () =>
                    !RequestedBy.isAuthorized({
                        requestedBy,
                        userUid: participantKey,
                    }),
            },
        });
        if (boards.isError) {
            return boards;
        }

        const characters = RecordOperation.serverTransform<
            CharacterTypes.State,
            CharacterTypes.State,
            CharacterTypes.TwoWayOperation,
            CharacterTypes.UpOperation,
            string | ApplyError<PositiveInt> | ComposeAndTransformError
        >({
            first: serverOperation?.characters,
            second: clientOperation.characters,
            prevState: prevState.characters,
            nextState: currentState.characters,
            innerTransform: ({ first, second, prevState, nextState }) =>
                Character.serverTransform(
                    RequestedBy.isAuthorized({
                        requestedBy,
                        userUid: participantKey,
                    }),
                    requestedBy,
                    activeBoardKey
                )({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: () =>
                    !RequestedBy.isAuthorized({ requestedBy, userUid: participantKey }),
                cancelUpdate: ({ nextState }) =>
                    !RequestedBy.isAuthorized({ requestedBy, userUid: participantKey }) &&
                    nextState.isPrivate,
                cancelRemove: ({ state: nextState }) =>
                    !RequestedBy.isAuthorized({ requestedBy, userUid: participantKey }) &&
                    nextState.isPrivate,
            },
        });
        if (characters.isError) {
            return characters;
        }

        const imagePieceValues = RecordOperation.serverTransform<
            ImagePieceValueTypes.State,
            ImagePieceValueTypes.State,
            ImagePieceValueTypes.TwoWayOperation,
            ImagePieceValueTypes.UpOperation,
            string | ApplyError<PositiveInt> | ComposeAndTransformError
        >({
            first: serverOperation?.imagePieceValues,
            second: clientOperation.imagePieceValues,
            prevState: prevState.imagePieceValues,
            nextState: currentState.imagePieceValues,
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
                cancelRemove: state => !isAuthorized && state.state.isPrivate,
            },
        });
        if (imagePieceValues.isError) {
            return imagePieceValues;
        }

        const twoWayOperation: TwoWayOperation = {
            $v: 1,
            boards: boards.value,
            characters: characters.value,
            imagePieceValues: imagePieceValues.value,
        };

        if (isAuthorized) {
            // CONSIDER: ユーザーがnameをnullishに変更することは禁止すべきかもしれない
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
    const boards = RecordOperation.clientTransform<
        BoardTypes.State,
        BoardTypes.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: first.boards,
        second: second.boards,
        innerTransform: params => Board.clientTransform(params),
        innerDiff: params => {
            const diff = Board.diff(params);
            if (diff == null) {
                return diff;
            }
            return Board.toUpOperation(diff);
        },
    });
    if (boards.isError) {
        return boards;
    }

    const characters = RecordOperation.clientTransform<
        CharacterTypes.State,
        CharacterTypes.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: first.characters,
        second: second.characters,
        innerTransform: params => Character.clientTransform(params),
        innerDiff: params => {
            const diff = Character.diff(params);
            if (diff == null) {
                return diff;
            }
            return Character.toUpOperation(diff);
        },
    });
    if (characters.isError) {
        return characters;
    }

    const imagePieceValues = RecordOperation.clientTransform<
        ImagePieceValueTypes.State,
        ImagePieceValueTypes.UpOperation,
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
        $v: 1,
        boards: boards.value.firstPrime,
        characters: characters.value.firstPrime,
        imagePieceValues: imagePieceValues.value.firstPrime,
        name: name.firstPrime,
        role: role.firstPrime,
    };

    const secondPrime: UpOperation = {
        $v: 1,
        boards: boards.value.secondPrime,
        characters: characters.value.secondPrime,
        imagePieceValues: imagePieceValues.value.secondPrime,
        name: name.secondPrime,
        role: role.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
