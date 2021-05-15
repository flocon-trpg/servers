import * as t from 'io-ts';
import { Maybe, maybe } from '../../../io-ts';
import * as Board from './board/v1';
import * as Character from './character/v1';
import * as MyNumberValue from './myNumberValue/v1';
import { recordDownOperationElementFactory, RecordTwoWayOperationElement, recordUpOperationElementFactory, mapRecordOperationElement } from '../util/recordOperationElement';
import * as RecordOperation from '../util/recordOperation';
import { Apply, ClientTransform, Compose, Diff, RequestedBy, Restore, server, ServerTransform, ToClientOperationParams } from '../util/type';
import * as ReplaceOperation from '../util/replaceOperation';
import { ResultModule } from '../../../Result';
import { chooseRecord } from '../../../utils';
import { ApplyError, ComposeAndTransformError, PositiveInt } from '../../../textOperation';
import { operation } from '../util/operation';
import { isIdRecord } from '../util/record';

export const Player = 'Player';
export const Spectator = 'Spectator';
export const Master = 'Master';

const participantRole = t.union([t.literal(Player), t.literal(Spectator), t.literal(Master)]);
export type ParticipantRole = t.TypeOf<typeof participantRole>;

export const state = t.type({
    $version: t.literal(1),

    name: t.string,
    role: maybe(participantRole),
    boards: t.record(t.string, Board.state),
    characters: t.record(t.string, Character.state),
    myNumberValues: t.record(t.string, MyNumberValue.state),
});

export type State = t.TypeOf<typeof state>

export const downOperation = operation(1, {
    name: t.type({ oldValue: t.string }),
    role: t.type({ oldValue: maybe(participantRole) }),
    boards: t.record(t.string, recordDownOperationElementFactory(Board.state, Board.downOperation)),
    characters: t.record(t.string, recordDownOperationElementFactory(Character.state, Character.downOperation)),
    myNumberValues: t.record(t.string, recordDownOperationElementFactory(MyNumberValue.state, MyNumberValue.downOperation)),
});

export type DownOperation = t.TypeOf<typeof downOperation>

export const upOperation = operation(1, {
    name: t.type({ newValue: t.string }),
    role: t.type({ newValue: maybe(participantRole) }),
    boards: t.record(t.string, recordUpOperationElementFactory(Board.state, Board.upOperation)),
    characters: t.record(t.string, recordUpOperationElementFactory(Character.state, Character.upOperation)),
    myNumberValues: t.record(t.string, recordUpOperationElementFactory(MyNumberValue.state, MyNumberValue.upOperation)),
});

export type UpOperation = t.TypeOf<typeof upOperation>

export type TwoWayOperation = {
    $version: 1;

    name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    role?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<ParticipantRole>>;
    boards?: Record<string, RecordTwoWayOperationElement<Board.State, Board.TwoWayOperation>>;
    characters?: Record<string, RecordTwoWayOperationElement<Character.State, Character.TwoWayOperation>>;
    myNumberValues?: Record<string, RecordTwoWayOperationElement<MyNumberValue.State, MyNumberValue.TwoWayOperation>>;
}

export const toClientState = (createdByMe: boolean) => (source: State): State => {
    return {
        ...source,
        boards: RecordOperation.toClientState({
            serverState: source.boards,
            isPrivate: () => false,
            toClientState: ({ state }) => Board.toClientState(state),
        }),
        characters: RecordOperation.toClientState({
            serverState: source.characters,
            isPrivate: state => !createdByMe && state.isPrivate,
            toClientState: ({ state }) => Character.toClientState(createdByMe)(state),
        }),
        myNumberValues: RecordOperation.toClientState({
            serverState: source.myNumberValues,
            isPrivate: () => false,
            toClientState: ({ state }) => MyNumberValue.toClientState(createdByMe)(state),
        }),
    };
};

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        boards: source.boards == null ? undefined : chooseRecord(source.boards, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Board.toDownOperation,
        })),
        characters: source.characters == null ? undefined : chooseRecord(source.characters, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Character.toDownOperation,
        })),
        myNumberValues: source.myNumberValues == null ? undefined : chooseRecord(source.myNumberValues, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: MyNumberValue.toDownOperation,
        })),
    };
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return {
        ...source,
        boards: source.boards == null ? undefined : chooseRecord(source.boards, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Board.toUpOperation,
        })),
        characters: source.characters == null ? undefined : chooseRecord(source.characters, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Character.toUpOperation,
        })),
        myNumberValues: source.myNumberValues == null ? undefined : chooseRecord(source.myNumberValues, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: MyNumberValue.toUpOperation,
        })),
    };
};

export const toClientOperation = (createdByMe: boolean) => ({ prevState, nextState, diff }: ToClientOperationParams<State, TwoWayOperation>): UpOperation => {
    return {
        ...diff,
        boards: diff.boards == null ? undefined : RecordOperation.toClientOperation({
            diff: diff.boards,
            prevState: prevState.boards,
            nextState: nextState.boards,
            toClientState: ({ nextState }) => Board.toClientState(nextState),
            toClientOperation: (params) => Board.toClientOperation(params),
            isPrivate: () => false,
        }),
        characters: diff.characters == null ? undefined : RecordOperation.toClientOperation({
            diff: diff.characters,
            prevState: prevState.characters,
            nextState: nextState.characters,
            toClientState: ({ nextState }) => Character.toClientState(createdByMe)(nextState),
            toClientOperation: (params) => Character.toClientOperation(createdByMe)(params),
            isPrivate: () => false,
        }),
        myNumberValues: diff.myNumberValues == null ? undefined : RecordOperation.toClientOperation({
            diff: diff.myNumberValues,
            prevState: prevState.myNumberValues,
            nextState: nextState.myNumberValues,
            toClientState: ({ nextState }) => MyNumberValue.toClientState(createdByMe)(nextState),
            toClientOperation: (params) => MyNumberValue.toClientOperation(createdByMe)(params),
            isPrivate: () => false,
        }),
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

    const boards = RecordOperation.apply<Board.State, Board.UpOperation | Board.TwoWayOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: state.boards, operation: operation.boards, innerApply: ({ prevState, operation: upOperation }) => {
            return Board.apply({ state: prevState, operation: upOperation });
        }
    });
    if (boards.isError) {
        return boards;
    }
    result.boards = boards.value;

    const characters = RecordOperation.apply<Character.State, Character.UpOperation | Character.TwoWayOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: state.characters, operation: operation.characters, innerApply: ({ prevState, operation: upOperation }) => {
            return Character.apply({ state: prevState, operation: upOperation });
        }
    });
    if (characters.isError) {
        return characters;
    }
    result.characters = characters.value;

    const myNumberValues = RecordOperation.apply<MyNumberValue.State, MyNumberValue.UpOperation | MyNumberValue.TwoWayOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: state.myNumberValues, operation: operation.myNumberValues, innerApply: ({ prevState, operation: upOperation }) => {
            return MyNumberValue.apply({ state: prevState, operation: upOperation });
        }
    });
    if (myNumberValues.isError) {
        return myNumberValues;
    }
    result.myNumberValues = myNumberValues.value;

    return ResultModule.ok(result);
};

export const applyBack: Apply<State, DownOperation> = ({ state, operation }) => {
    const result: State = { ...state };
    if (operation.name != null) {
        result.name = operation.name.oldValue;
    }
    if (operation.role != null) {
        result.role = operation.role.oldValue;
    }

    const boards = RecordOperation.applyBack<Board.State, Board.DownOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        nextState: state.boards, operation: operation.boards, innerApplyBack: ({ state, operation }) => {
            return Board.applyBack({ state, operation });
        }
    });
    if (boards.isError) {
        return boards;
    }
    result.boards = boards.value;

    const characters = RecordOperation.applyBack<Character.State, Character.DownOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        nextState: state.characters, operation: operation.characters, innerApplyBack: ({ state, operation }) => {
            return Character.applyBack({ state, operation });
        }
    });
    if (characters.isError) {
        return characters;
    }
    result.characters = characters.value;

    const myNumberValues = RecordOperation.applyBack<MyNumberValue.State, MyNumberValue.DownOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        nextState: state.myNumberValues, operation: operation.myNumberValues, innerApplyBack: ({ state, operation }) => {
            return MyNumberValue.applyBack({ state, operation });
        }
    });
    if (myNumberValues.isError) {
        return myNumberValues;
    }
    result.myNumberValues = myNumberValues.value;

    return ResultModule.ok(result);
};

export const composeUpOperation: Compose<UpOperation> = ({ first, second }) => {
    const boards = RecordOperation.composeUpOperation<Board.State, Board.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        first: first.boards,
        second: second.boards,
        innerApply: params => Board.apply(params),
        innerCompose: params => Board.composeUpOperation(params),
    });
    if (boards.isError) {
        return boards;
    }

    const characters = RecordOperation.composeUpOperation<Character.State, Character.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        first: first.characters,
        second: second.characters,
        innerApply: params => Character.apply(params),
        innerCompose: params => Character.composeUpOperation(params),
    });
    if (characters.isError) {
        return characters;
    }

    const myNumberValues = RecordOperation.composeUpOperation<MyNumberValue.State, MyNumberValue.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        first: first.myNumberValues,
        second: second.myNumberValues,
        innerApply: params => MyNumberValue.apply(params),
        innerCompose: params => MyNumberValue.composeUpOperation(params),
    });
    if (myNumberValues.isError) {
        return myNumberValues;
    }

    const valueProps: UpOperation = {
        $version: 1,
        name: ReplaceOperation.composeUpOperation(first.name ?? undefined, second.name ?? undefined),
        role: ReplaceOperation.composeUpOperation(first.role ?? undefined, second.role ?? undefined),
        boards: boards.value,
        characters: characters.value,
        myNumberValues: myNumberValues.value,
    };
    return ResultModule.ok(valueProps);
};

export const composeDownOperation: Compose<DownOperation> = ({ first, second }) => {
    const boards = RecordOperation.composeDownOperation<Board.State, Board.DownOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        first: first.boards,
        second: second.boards,
        innerApplyBack: params => Board.applyBack(params),
        innerCompose: params => Board.composeDownOperation(params),
    });
    if (boards.isError) {
        return boards;
    }

    const characters = RecordOperation.composeDownOperation<Character.State, Character.DownOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        first: first.characters,
        second: second.characters,
        innerApplyBack: params => Character.applyBack(params),
        innerCompose: params => Character.composeDownOperation(params),
    });
    if (characters.isError) {
        return characters;
    }

    const myNumberValues = RecordOperation.composeDownOperation<MyNumberValue.State, MyNumberValue.DownOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        first: first.myNumberValues,
        second: second.myNumberValues,
        innerApplyBack: params => MyNumberValue.applyBack(params),
        innerCompose: params => MyNumberValue.composeDownOperation(params),
    });
    if (myNumberValues.isError) {
        return myNumberValues;
    }

    const valueProps: DownOperation = {
        $version: 1,
        name: ReplaceOperation.composeDownOperation(first.name ?? undefined, second.name ?? undefined),
        role: ReplaceOperation.composeDownOperation(first.role ?? undefined, second.role ?? undefined),
        boards: boards.value,
        characters: characters.value,
        myNumberValues: myNumberValues.value,
    };
    return ResultModule.ok(valueProps);
};

export const restore: Restore<State, DownOperation, TwoWayOperation> = ({ nextState, downOperation }) => {
    if (downOperation === undefined) {
        return ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
    }

    const boards = RecordOperation.restore({
        nextState: nextState.boards,
        downOperation: downOperation.boards,
        innerDiff: params => Board.diff(params),
        innerRestore: params => Board.restore(params),
    });
    if (boards.isError) {
        return boards;
    }

    const characters = RecordOperation.restore({
        nextState: nextState.characters,
        downOperation: downOperation.characters,
        innerDiff: params => Character.diff(params),
        innerRestore: params => Character.restore(params),
    });
    if (characters.isError) {
        return characters;
    }

    const myNumberValues = RecordOperation.restore({
        nextState: nextState.myNumberValues,
        downOperation: downOperation.myNumberValues,
        innerDiff: params => MyNumberValue.diff(params),
        innerRestore: params => MyNumberValue.restore(params),
    });
    if (myNumberValues.isError) {
        return myNumberValues;
    }

    const prevState: State = {
        ...nextState,
        boards: boards.value.prevState,
        characters: characters.value.prevState,
        myNumberValues: myNumberValues.value.prevState,
    };
    const twoWayOperation: TwoWayOperation = {
        $version: 1,
        boards: boards.value.twoWayOperation,
        characters: characters.value.twoWayOperation,
        myNumberValues: myNumberValues.value.twoWayOperation,
    };

    if (downOperation.name != null) {
        prevState.name = downOperation.name.oldValue;
        twoWayOperation.name = { ...downOperation.name, newValue: nextState.name };
    }
    if (downOperation.role != null) {
        prevState.role = downOperation.role.oldValue ?? undefined;
        twoWayOperation.role = { oldValue: downOperation.role.oldValue ?? undefined, newValue: nextState.role };
    }

    return ResultModule.ok({ prevState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const boards = RecordOperation.diff({
        prevState: prevState.boards,
        nextState: nextState.boards,
        innerDiff: params => Board.diff(params),
    });
    const characters = RecordOperation.diff({
        prevState: prevState.characters,
        nextState: nextState.characters,
        innerDiff: params => Character.diff(params),
    });
    const myNumberValues = RecordOperation.diff({
        prevState: prevState.myNumberValues,
        nextState: nextState.myNumberValues,
        innerDiff: params => MyNumberValue.diff(params),
    });
    const result: TwoWayOperation = {
        $version: 1,
        boards,
        characters,
        myNumberValues,
    };
    if (prevState.name != nextState.name) {
        result.name = { oldValue: prevState.name, newValue: nextState.name };
    }
    if (prevState.role != nextState.role) {
        result.role = { oldValue: prevState.role, newValue: nextState.role };
    }
    if (isIdRecord(result)) {
        return undefined;
    }
    return result;
};

export const serverTransform = (requestedBy: RequestedBy): ServerTransform<State, TwoWayOperation, UpOperation> => ({ prevState, currentState, clientOperation, serverOperation }) => {
    const boards = RecordOperation.serverTransform({
        first: serverOperation?.boards,
        second: clientOperation.boards,
        prevState: prevState.boards,
        nextState: currentState.boards,
        innerTransform: ({ first, second, prevState, nextState }) => Board.serverTransform({
            prevState,
            currentState: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        protectedValuePolicy: {
        }
    });
    if (boards.isError) {
        return boards;
    }

    const characters = RecordOperation.serverTransform({
        first: serverOperation?.characters,
        second: clientOperation.characters,
        prevState: prevState.characters,
        nextState: currentState.characters,
        innerTransform: ({ first, second, prevState, nextState, key }) => Character.serverTransform(RequestedBy.createdByMe({ requestedBy, userUid: key }))({
            prevState,
            currentState: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        protectedValuePolicy: {
        }
    });
    if (characters.isError) {
        return characters;
    }

    const myNumberValues = RecordOperation.serverTransform({
        first: serverOperation?.myNumberValues,
        second: clientOperation.myNumberValues,
        prevState: prevState.myNumberValues,
        nextState: currentState.myNumberValues,
        innerTransform: ({ first, second, prevState, nextState, key }) => MyNumberValue.serverTransform(RequestedBy.createdByMe({ requestedBy, userUid: key }))({
            prevState,
            currentState: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        protectedValuePolicy: {
        }
    });
    if (myNumberValues.isError) {
        return myNumberValues;
    }

    const twoWayOperation: TwoWayOperation = {
        $version: 1,
        boards: boards.value,
        characters: characters.value,
        myNumberValues: myNumberValues.value,
    };

    twoWayOperation.name = ReplaceOperation.serverTransform({
        first: serverOperation?.name ?? undefined,
        second: clientOperation.name ?? undefined,
        prevState: prevState.name,
    });

    if (requestedBy.type === server) {
        twoWayOperation.role = ReplaceOperation.serverTransform({
            first: serverOperation?.role ?? undefined,
            second: clientOperation.role ?? undefined,
            prevState: prevState.role,
        });
    }

    if (isIdRecord(twoWayOperation)) {
        return ResultModule.ok(undefined);
    }

    return ResultModule.ok(twoWayOperation);
};

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
    const boards = RecordOperation.clientTransform<Board.State, Board.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
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

    const characters = RecordOperation.clientTransform<Character.State, Character.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
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

    const myNumberValues = RecordOperation.clientTransform<MyNumberValue.State, MyNumberValue.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        first: first.myNumberValues,
        second: second.myNumberValues,
        innerTransform: params => MyNumberValue.clientTransform(params),
        innerDiff: params => {
            const diff = MyNumberValue.diff(params);
            if (diff == null) {
                return diff;
            }
            return MyNumberValue.toUpOperation(diff);
        },
    });
    if (myNumberValues.isError) {
        return myNumberValues;
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
        boards: boards.value.firstPrime,
        characters: characters.value.firstPrime,
        myNumberValues: myNumberValues.value.firstPrime,
        name: name.firstPrime,
        role: role.firstPrime,
    };

    const secondPrime: UpOperation = {
        $version: 1,
        boards: boards.value.secondPrime,
        characters: characters.value.secondPrime,
        myNumberValues: myNumberValues.value.secondPrime,
        name: name.secondPrime,
        role: role.secondPrime,
    };

    return ResultModule.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};