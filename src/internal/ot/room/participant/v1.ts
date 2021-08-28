/*
Participantとは、そのRoomに入っているユーザーのこと。通常は、Player、Spectatorなどのroleを持っている。
Participantのstateには、roleやname（その部屋でのユーザーの表示名）といったデータはもちろん、そのParticipantが作成したBoard、Characterなどのstateも保持される。
Board、Characterを保持するのがRoomなどではなくParticipantなのは、BoardやCharacterなどは作成者が誰かを保持する必要があり、キーがuserUidであるParticipantで保存するほうが都合がよく構成も綺麗になるため。
*/

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
import { Maybe, maybe } from '../../../maybe';
import * as Board from './board/v1';
import * as Character from './character/v1';

export const Player = 'Player';
export const Spectator = 'Spectator';
export const Master = 'Master';

const participantRole = t.union([t.literal(Player), t.literal(Spectator), t.literal(Master)]);
export type ParticipantRole = t.TypeOf<typeof participantRole>;

export const dbState = t.type({
    $v: t.literal(1),

    boards: record(t.string, Board.state),
    characters: record(t.string, Character.state),
    imagePieceValues: record(t.string, ImagePieceValue.state),
});

export type DbState = t.TypeOf<typeof dbState>;

export const state = t.intersection([
    dbState,
    t.type({
        name: maybe(t.string),
        role: maybe(participantRole),
    }),
]);

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(1, {
    name: t.type({ oldValue: maybe(t.string) }),
    role: t.type({ oldValue: maybe(participantRole) }),

    boards: record(t.string, recordDownOperationElementFactory(Board.state, Board.downOperation)),
    characters: record(
        t.string,
        recordDownOperationElementFactory(Character.state, Character.downOperation)
    ),
    imagePieceValues: record(
        t.string,
        recordDownOperationElementFactory(ImagePieceValue.state, ImagePieceValue.downOperation)
    ),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(1, {
    name: t.type({ newValue: maybe(t.string) }),
    role: t.type({ newValue: maybe(participantRole) }),

    boards: record(t.string, recordUpOperationElementFactory(Board.state, Board.upOperation)),
    characters: record(
        t.string,
        recordUpOperationElementFactory(Character.state, Character.upOperation)
    ),
    imagePieceValues: record(
        t.string,
        recordUpOperationElementFactory(ImagePieceValue.state, ImagePieceValue.upOperation)
    ),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 1;

    name?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<string>>;
    role?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<ParticipantRole>>;

    boards?: RecordOperation.RecordTwoWayOperation<Board.State, Board.TwoWayOperation>;
    characters?: RecordOperation.RecordTwoWayOperation<Character.State, Character.TwoWayOperation>;
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
            boards: RecordOperation.toClientState<Board.State, Board.State>({
                serverState: source.boards,
                isPrivate: (state, key) => {
                    if (
                        RequestedBy.isAuthorized({
                            requestedBy,
                            userUid: participantKey,
                        })
                    ) {
                        return false;
                    }
                    if (key !== activeBoardKey?.id) {
                        return true;
                    }
                    return false;
                },
                toClientState: ({ state }) => Board.toClientState(state),
            }),
            characters: RecordOperation.toClientState<Character.State, Character.State>({
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
                ImagePieceValue.State,
                ImagePieceValue.State
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
        Board.State,
        Board.UpOperation,
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
        Character.State,
        Character.UpOperation | Character.TwoWayOperation,
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
        ImagePieceValue.State,
        ImagePieceValue.UpOperation | ImagePieceValue.TwoWayOperation,
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
        Board.State,
        Board.DownOperation,
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
        Character.State,
        Character.DownOperation,
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
        ImagePieceValue.State,
        ImagePieceValue.DownOperation,
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
        Board.State,
        Board.DownOperation,
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
        Character.State,
        Character.DownOperation,
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
        Board.State,
        Board.DownOperation,
        Board.TwoWayOperation,
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
        Character.State,
        Character.DownOperation,
        Character.TwoWayOperation,
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
        ImagePieceValue.State,
        ImagePieceValue.DownOperation,
        ImagePieceValue.TwoWayOperation,
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
    const boards = RecordOperation.diff<Board.State, Board.TwoWayOperation>({
        prevState: prevState.boards,
        nextState: nextState.boards,
        innerDiff: params => Board.diff(params),
    });
    const characters = RecordOperation.diff<Character.State, Character.TwoWayOperation>({
        prevState: prevState.characters,
        nextState: nextState.characters,
        innerDiff: params => Character.diff(params),
    });
    const imagePieceValues = RecordOperation.diff<
        ImagePieceValue.State,
        ImagePieceValue.TwoWayOperation
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
        activeBoardSecondKey,
    }: {
        requestedBy: RequestedBy;
        participantKey: string;
        activeBoardSecondKey: string | null | undefined;
    }): ServerTransform<State, TwoWayOperation, UpOperation> =>
    ({ prevState, currentState, clientOperation, serverOperation }) => {
        const isAuthorized = RequestedBy.isAuthorized({ requestedBy, userUid: participantKey });

        const boards = RecordOperation.serverTransform<
            Board.State,
            Board.State,
            Board.TwoWayOperation,
            Board.UpOperation,
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
                    if (
                        RequestedBy.isAuthorized({
                            requestedBy,
                            userUid: participantKey,
                        })
                    ) {
                        return false;
                    }
                    if (key !== activeBoardSecondKey) {
                        return true;
                    }
                    return false;
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
            Character.State,
            Character.State,
            Character.TwoWayOperation,
            Character.UpOperation,
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
                    })
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
                cancelRemove: ({ nextState }) =>
                    !RequestedBy.isAuthorized({ requestedBy, userUid: participantKey }) &&
                    nextState.isPrivate,
            },
        });
        if (characters.isError) {
            return characters;
        }

        const imagePieceValues = RecordOperation.serverTransform<
            ImagePieceValue.State,
            ImagePieceValue.State,
            ImagePieceValue.TwoWayOperation,
            ImagePieceValue.UpOperation,
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
                cancelRemove: state => !isAuthorized && state.nextState.isPrivate,
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
        Board.State,
        Board.UpOperation,
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
        Character.State,
        Character.UpOperation,
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
