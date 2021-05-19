import * as t from 'io-ts';
import { Maybe, maybe } from '../../../io-ts';
import * as Board from './board/v1';
import * as Character from './character/v1';
import * as MyNumberValue from './myNumberValue/v1';
import { recordDownOperationElementFactory, RecordTwoWayOperationElement, recordUpOperationElementFactory, mapRecordOperationElement } from '../util/recordOperationElement';
import { TransformerFactory } from '../util/transformerFactory';
import { RecordTransformer } from '../util/recordOperation';
import * as RecordOperation from '../util/recordOperation';
import { Apply, RequestedBy, server, ToClientOperationParams } from '../util/type';
import * as ReplaceValueOperation from '../util/replaceOperation';
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

    name?: ReplaceValueOperation.ReplaceValueTwoWayOperation<string>;
    role?: ReplaceValueOperation.ReplaceValueTwoWayOperation<Maybe<ParticipantRole>>;
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

export const toServerOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        boards: source.boards == null ? undefined : chooseRecord(source.boards, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Board.toServerOperation,
        })),
        characters: source.characters == null ? undefined : chooseRecord(source.characters, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Character.toServerOperation,
        })),
        myNumberValues: source.myNumberValues == null ? undefined : chooseRecord(source.myNumberValues, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: MyNumberValue.toServerOperation,
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

const boardTransformer = Board.transformerFactory;
const boardsTransformer = new RecordTransformer(boardTransformer);
const createCharacterTransformer = (createdByMe: boolean) => Character.transformerFactory(createdByMe);
const createCharactersTransformer = (createdByMe: boolean) => new RecordTransformer(createCharacterTransformer(createdByMe));
const createMyNumberValueTransformer = (createdByMe: boolean) => MyNumberValue.transformerFactory(createdByMe);
const createMyNumberValuesTransformer = (createdByMe: boolean) => new RecordTransformer(createMyNumberValueTransformer(createdByMe));

export const transformerFactory = (requestedBy: RequestedBy): TransformerFactory<string, State, State, DownOperation, UpOperation, TwoWayOperation, ApplyError<PositiveInt> | ComposeAndTransformError> => ({
    composeLoose: ({ key, first, second }) => {
        const boards = boardsTransformer.composeLoose({
            first: first.boards,
            second: second.boards,
        });
        if (boards.isError) {
            return boards;
        }

        const charactersTransformer = createCharactersTransformer(RequestedBy.createdByMe({ requestedBy, userUid: key }));
        const characters = charactersTransformer.composeLoose({
            first: first.characters,
            second: second.characters,
        });
        if (characters.isError) {
            return characters;
        }

        const myNumberValuesTransformer = createMyNumberValuesTransformer(RequestedBy.createdByMe({ requestedBy, userUid: key }));
        const myNumberValues = myNumberValuesTransformer.composeLoose({
            first: first.myNumberValues,
            second: second.myNumberValues,
        });
        if (myNumberValues.isError) {
            return myNumberValues;
        }

        const valueProps: DownOperation = {
            $version: 1,
            name: ReplaceValueOperation.composeDownOperation(first.name ?? undefined, second.name ?? undefined),
            role: ReplaceValueOperation.composeDownOperation(first.role ?? undefined, second.role ?? undefined),
            boards: boards.value,
            characters: characters.value,
            myNumberValues: myNumberValues.value,
        };
        return ResultModule.ok(valueProps);
    },
    restore: ({ key, nextState, downOperation }) => {
        if (downOperation === undefined) {
            return ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
        }

        const boards = boardsTransformer.restore({
            nextState: nextState.boards,
            downOperation: downOperation.boards,
        });
        if (boards.isError) {
            return boards;
        }

        const charactersTransformer = createCharactersTransformer(RequestedBy.createdByMe({ requestedBy, userUid: key }));
        const characters = charactersTransformer.restore({
            nextState: nextState.characters,
            downOperation: downOperation.characters,
        });
        if (characters.isError) {
            return characters;
        }

        const myNumberValuesTransformer = createMyNumberValuesTransformer(RequestedBy.createdByMe({ requestedBy, userUid: key }));
        const myNumberValues = myNumberValuesTransformer.restore({
            nextState: nextState.myNumberValues,
            downOperation: downOperation.myNumberValues,
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
    },
    transform: ({ key, prevState, currentState, clientOperation, serverOperation }) => {
        const boards = boardsTransformer.transform({
            prevState: prevState.boards,
            currentState: currentState.boards,
            clientOperation: clientOperation.boards,
            serverOperation: serverOperation?.boards,
        });
        if (boards.isError) {
            return boards;
        }

        const charactersTransformer = createCharactersTransformer(RequestedBy.createdByMe({ requestedBy, userUid: key }));
        const characters = charactersTransformer.transform({
            prevState: prevState.characters,
            currentState: currentState.characters,
            clientOperation: clientOperation.characters,
            serverOperation: serverOperation?.characters,
        });
        if (characters.isError) {
            return characters;
        }

        const myNumberValuesTransformer = createMyNumberValuesTransformer(RequestedBy.createdByMe({ requestedBy, userUid: key }));
        const myNumberValues = myNumberValuesTransformer.transform({
            prevState: prevState.myNumberValues,
            currentState: currentState.myNumberValues,
            clientOperation: clientOperation.myNumberValues,
            serverOperation: serverOperation?.myNumberValues,
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

        twoWayOperation.name = ReplaceValueOperation.transform({
            first: serverOperation?.name ?? undefined,
            second: clientOperation.name ?? undefined,
            prevState: prevState.name,
        });

        if (requestedBy.type === server) {
            twoWayOperation.role = ReplaceValueOperation.transform({
                first: serverOperation?.role ?? undefined,
                second: clientOperation.role ?? undefined,
                prevState: prevState.role,
            });
        }

        if (isIdRecord(twoWayOperation)) {
            return ResultModule.ok(undefined);
        }

        return ResultModule.ok(twoWayOperation);
    },
    diff: ({ key, prevState, nextState }) => {
        const boards = boardsTransformer.diff({
            prevState: prevState.boards,
            nextState: nextState.boards,
        });
        const charactersTransformer = createCharactersTransformer(RequestedBy.createdByMe({ requestedBy, userUid: key }));
        const characters = charactersTransformer.diff({
            prevState: prevState.characters,
            nextState: nextState.characters,
        });
        const myNumberValuesTransformer = createMyNumberValuesTransformer(RequestedBy.createdByMe({ requestedBy, userUid: key }));
        const myNumberValues = myNumberValuesTransformer.diff({
            prevState: prevState.myNumberValues,
            nextState: nextState.myNumberValues,
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
    },
    applyBack: ({ key, downOperation, nextState }) => {
        const boards = boardsTransformer.applyBack({
            downOperation: downOperation.boards,
            nextState: nextState.boards,
        });
        if (boards.isError) {
            return boards;
        }

        const charactersTransformer = createCharactersTransformer(RequestedBy.createdByMe({ requestedBy, userUid: key }));
        const characters = charactersTransformer.applyBack({
            downOperation: downOperation.characters,
            nextState: nextState.characters,
        });
        if (characters.isError) {
            return characters;
        }

        const myNumberValuesTransformer = createMyNumberValuesTransformer(RequestedBy.createdByMe({ requestedBy, userUid: key }));
        const myNumberValues = myNumberValuesTransformer.applyBack({
            downOperation: downOperation.myNumberValues,
            nextState: nextState.myNumberValues,
        });
        if (myNumberValues.isError) {
            return myNumberValues;
        }

        const result: State = {
            ...nextState,
            boards: boards.value,
            characters: characters.value,
            myNumberValues: myNumberValues.value,
        };

        if (downOperation.name !== undefined) {
            result.name = downOperation.name.oldValue ?? undefined;
        }
        if (downOperation.role !== undefined) {
            result.role = downOperation.role.oldValue ?? undefined;
        }

        return ResultModule.ok(result);
    },
    toServerState: ({ clientState }) => clientState,
    protectedValuePolicy: {}
});