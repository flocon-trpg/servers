import { CharactersOperationInput, ReplaceCharacterOperationInput, RoomGetStateFragment, RoomOperationValueFragment, RoomOperationValueInput, RoomParameterNameType, UpdateCharacterOperationInput } from '../../generated/graphql';
import { RoomBgm as Bgm } from './roomBgm';
import produce from 'immer';
import { appConsole } from '../../utils/appConsole';
import * as $DualKeyMap from './dualKeyMap';
import * as $Map from './map';
import * as $UpdateMap from './updateMap';
import { transform as transformReplace, transformNullable as transformNullableReplace } from './replaceValue';
import { createStateMap, ReadonlyStateMap, StateMap } from '../../@shared/StateMap';
import { OperationElement, replace, update } from './types';
import { isStrIndex100, isStrIndex5, StrIndex100, StrIndex5 } from '../../@shared/indexes';
import { CustomDualKeyMap } from '../../@shared/CustomDualKeyMap';
import { ReplaceValueOperationModule } from './utils/replaceValueOperation';
import { Board } from './board';
import { Character } from './character';
import { ParamName } from './paramName';
import { Participant } from './participant';
import { __ } from '../../@shared/collection';

export namespace Room {
    export type State = Omit<RoomGetStateFragment, '__typename' | 'revision' | 'boards' | 'characters' | 'bgms' | 'paramNames' | 'participants'> & {
        boards: ReadonlyStateMap<Board.State>;
        characters: ReadonlyStateMap<Character.State>;
        bgms: ReadonlyMap<StrIndex5, Bgm.State>;
        paramNames: ParamName.ReadonlyStateMap<ParamName.State>;
        participants: ReadonlyMap<string, Participant.State>;
    };

    export type GetOperation = Omit<RoomOperationValueFragment, '__typename' | 'boards' | 'characters' | 'bgms' | 'paramNames' | 'participants'> & {
        boards: ReadonlyStateMap<OperationElement<Board.State, Board.GetOperation>>;
        characters: ReadonlyStateMap<OperationElement<Character.State, Character.GetOperation>>;
        bgms: ReadonlyMap<StrIndex5, OperationElement<Bgm.State, Bgm.GetOperation>>;
        paramNames: ParamName.ReadonlyStateMap<OperationElement<ParamName.State, ParamName.GetOperation>>;
        participants: ReadonlyMap<string, OperationElement<Participant.State, Participant.GetOperation>>;
    }

    export type PostOperation = Omit<RoomOperationValueInput, 'boards' | 'characters' | 'bgms' | 'paramNames' | 'participants'> & {
        boards: ReadonlyStateMap<OperationElement<Board.State, Board.PostOperation>>;
        characters: ReadonlyStateMap<OperationElement<Character.State, Character.PostOperation>>;
        bgms: ReadonlyMap<StrIndex5, OperationElement<Bgm.State, Bgm.PostOperation>>;
        paramNames: ParamName.ReadonlyStateMap<OperationElement<ParamName.State, ParamName.PostOperation>>;
        participants: ReadonlyMap<string, Participant.PostOperation>;
    }

    export const createState = (source: RoomGetStateFragment): State => {
        // サーバーから受け取る値なので、キーの検証はしていない。

        const boards = createStateMap<Board.State>();
        source.boards.forEach(board => {
            boards.set(board, board.value);
        });
        const characters = createStateMap<Character.State>();
        source.characters.forEach(character => {
            characters.set(character, Character.createState(character.value));
        });
        const bgms = new Map<StrIndex5, Bgm.State>();
        source.bgms.forEach(bgm => {
            const key = bgm.channelKey;
            if (!isStrIndex5(key)) {
                return;
            }
            bgms.set(key, bgm.value);
        });
        const paramNames = new CustomDualKeyMap<ParamName.Key, RoomParameterNameType, StrIndex100, ParamName.State>(ParamName.keyFactory);
        source.paramNames.forEach(paramName => {
            const key = paramName.key;
            if (!isStrIndex100(key)) {
                return;
            }
            paramNames.set({ key, type: paramName.type }, paramName.value);
        });
        const participants = new Map<string, Participant.State>();
        source.participants.forEach(participant => {
            participants.set(participant.userUid, Participant.createState(participant.value));
        });
        return {
            ...source,
            boards,
            characters,
            bgms,
            paramNames,
            participants,
        };
    };

    export const createGetOperation = (source: RoomOperationValueFragment): GetOperation => {
        // サーバーから受け取る値なので、キーの検証はしていない。

        const boards = createStateMap<OperationElement<Board.State, Board.GetOperation>>();
        source.boards.replace.forEach(board => {
            boards.set(board, { type: replace, newValue: board.newValue ?? undefined });
        });
        source.boards.update.forEach(board => {
            boards.set(board, { type: update, operation: board.operation });
        });

        const characters = createStateMap<OperationElement<Character.State, Character.GetOperation>>();
        source.characters.replace.forEach(character => {
            characters.set(character, { type: replace, newValue: character.newValue == null ? undefined : Character.createState(character.newValue) });
        });
        source.characters.update.forEach(character => {
            characters.set(character, { type: update, operation: Character.createGetOperation(character.operation) });
        });

        const bgms = new Map<StrIndex5, OperationElement<Bgm.State, Bgm.GetOperation>>();
        source.bgms.replace.forEach(bgm => {
            const channelKey = bgm.channelKey;
            if (!isStrIndex5(channelKey)) {
                return;
            }
            bgms.set(channelKey, { type: replace, newValue: bgm.newValue ?? undefined });
        });
        source.bgms.update.forEach(bgm => {
            const channelKey = bgm.channelKey;
            if (!isStrIndex5(channelKey)) {
                return;
            }
            bgms.set(channelKey, { type: update, operation: bgm.operation });
        });

        const paramNames = ParamName.createStateMap<OperationElement<ParamName.State, ParamName.GetOperation>>();
        source.paramNames.replace.forEach(paramName => {
            const key = paramName.key;
            if (!isStrIndex100(key)) {
                return;
            }
            paramNames.set({ ...paramName, key }, { type: replace, newValue: paramName.newValue ?? undefined });
        });
        source.paramNames.update.forEach(paramName => {
            const key = paramName.key;
            if (!isStrIndex100(key)) {
                return;
            }
            paramNames.set({ ...paramName, key }, { type: update, operation: paramName.operation });
        });

        const participants = new Map<string, OperationElement<Participant.State, Participant.GetOperation>>();
        source.participants.replace.forEach(participant => {
            participants.set(participant.userUid, { type: replace, newValue: participant.newValue == null ? undefined : Participant.createState(participant.newValue) });
        });
        source.participants.update.forEach(participant => {
            participants.set(participant.userUid, { type: update, operation: Participant.createGetOperation(participant.operation) });
        });

        return {
            ...source,
            boards,
            characters,
            bgms,
            paramNames,
            participants,
        };
    };

    // addの場合、boardsの代わりにaddBoardsなどを用いてもいい。boards以外も同様。これらにより、createdByの入力を省略できる。
    export type PostOperationSetup = Omit<PostOperation, 'boards' | 'characters' | 'bgms' | 'paramNames' | 'participants'> & {
        boards: StateMap<OperationElement<Board.State, Board.PostOperation>>;
        /** boardsへのaddを簡単に行うためのプロパティ */
        addBoards: Map<string, Board.State>;
        characters: StateMap<OperationElement<Character.State, Character.PostOperation>>;
        /** charactersへのaddを簡単に行うためのプロパティ */
        addCharacters: Map<string, Character.State>;
        bgms: Map<StrIndex5, OperationElement<Bgm.State, Bgm.PostOperation>>;
        paramNames: ParamName.StateMap<OperationElement<ParamName.State, ParamName.PostOperation>>;
        participants: Map<string, Participant.PostOperation>;
    }

    export const createPostOperationSetup = (): PostOperationSetup => {
        return {
            boards: createStateMap(),
            addBoards: new Map(),
            characters: createStateMap(),
            addCharacters: new Map(),
            bgms: new Map(),
            paramNames: ParamName.createStateMap(),
            participants: new Map(),
        };
    };

    export const setupPostOperation = (source: PostOperationSetup, userUid: string): PostOperation => {
        const boards = source.boards.clone();
        source.addBoards.forEach((board, id) => {
            boards.set({ id, createdBy: userUid }, { type: replace, newValue: board });
        });
        const characters = source.characters.clone();
        source.addCharacters.forEach((character, id) => {
            characters.set({ id, createdBy: userUid }, { type: replace, newValue: character });
        });
        // addBoardsとaddCharactersをこのように消さないと、mutationなどしたときに400エラーが返されてしまう
        const result = {
            ...source,
            boards,
            addBoards: undefined,
            characters,
            addCharacters: undefined,
        };
        return result;
    };

    export const toGraphQLInput = (source: PostOperation): RoomOperationValueInput => {
        return {
            ...source,
            boards: Board.toGraphQLInput(source.boards),
            characters: Character.toGraphQLInput(source.characters),
            bgms: Bgm.toGraphQLInput(source.bgms),
            paramNames: ParamName.toGraphQLInput(source.paramNames),
            participants: Participant.toGraphQLInput(source.participants),
        };
    };

    const applyOperationCore = ({
        state,
        operation
    }: {
        state: State;
        operation: GetOperation | PostOperation;
    }): Omit<State, 'participants'> => {
        const result: Omit<State, 'participants'> = {
            ...state,
        };
        result.bgms = $Map.apply({
            state: state.bgms,
            operation: operation.bgms,
            inner: Bgm.applyOperation
        });
        result.boards = state.boards.wrap(
            $DualKeyMap.apply({
                state: state.boards.dualKeyMap,
                operation: operation.boards.dualKeyMap,
                inner: Board.applyOperation
            }));
        result.characters = state.characters.wrap(
            $DualKeyMap.apply({
                state: state.characters.dualKeyMap,
                operation: operation.characters.dualKeyMap,
                inner: Character.applyOperation
            }));
        result.paramNames = state.paramNames.wrap(
            $DualKeyMap.apply({
                state: state.paramNames.dualKeyMap,
                operation: operation.paramNames.dualKeyMap,
                inner: ParamName.applyOperation
            }));

        if (operation.name != null) {
            result.name = operation.name.newValue;
        }
        (['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const).forEach(i => {
            const key = `publicChannel${i}Name` as const;
            const operationElement = operation[key];
            if (operationElement != null) {
                result[key] = operationElement.newValue;
            }
        });

        return result;
    };

    export const applyPostOperation = ({
        state,
        operation
    }: {
        state: State;
        operation: PostOperation;
    }): State => {
        const participants = $UpdateMap.apply({
            state: state.participants,
            operation: operation.participants,
            inner: Participant.applyPostOperation
        });

        return {
            ...applyOperationCore({ state, operation }),
            participants
        };
    };

    export const applyGetOperation = ({
        state,
        operation,
    }: {
        state: State;
        operation: GetOperation;
    }): State => {
        const participants = $Map.apply({
            state: state.participants,
            operation: operation.participants,
            inner: Participant.applyGetOperation,
        });

        return {
            ...applyOperationCore({ state, operation }),
            participants
        };
    };

    export const compose = ({
        state,
        first,
        second
    }: {
        state: State;
        first: PostOperation;
        second: PostOperation;
    }): PostOperation => {
        const result: PostOperation = { ...first };

        result.boards = result.boards.wrap(
            $DualKeyMap.compose({
                state: state.boards.dualKeyMap,
                first: first.boards.dualKeyMap,
                second: second.boards.dualKeyMap,
                innerApply: Board.applyOperation,
                innerCompose: Board.compose,
                innerDiff: Board.diff,
            }));

        result.characters = result.characters.wrap(
            $DualKeyMap.compose({
                state: state.characters.dualKeyMap,
                first: first.characters.dualKeyMap,
                second: second.characters.dualKeyMap,
                innerApply: Character.applyOperation,
                innerCompose: ({ state, first, second }) => {
                    if (state === undefined) {
                        throw 'Character.State is undefined';
                    }
                    return Character.compose({ state, first, second });
                },
                innerDiff: Character.diff,
            }));

        result.bgms = $Map.compose({
            state: state.bgms,
            first: first.bgms,
            second: second.bgms,
            innerApply: Bgm.applyOperation,
            innerCompose: Bgm.compose,
            innerDiff: Bgm.diff,
        });

        result.paramNames = result.paramNames.wrap(
            $DualKeyMap.compose({
                state: state.paramNames.dualKeyMap,
                first: first.paramNames.dualKeyMap,
                second: second.paramNames.dualKeyMap,
                innerApply: ParamName.applyOperation,
                innerCompose: ParamName.compose,
                innerDiff: ParamName.diff,
            }));

        result.participants = $UpdateMap.compose({
            state: state.participants,
            first: first.participants,
            second: second.participants,
            innerCompose: ({ state, first, second }) => {
                if (state === undefined) {
                    throw 'Participant state not found.';
                }
                return Participant.compose({ state, first, second });
            },
        });

        result.name = ReplaceValueOperationModule.compose(first.name, second.name);
        (['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const).forEach(i => {
            const key = `publicChannel${i}Name` as const;
            result[key] = ReplaceValueOperationModule.compose(first[key], second[key]);
        });

        return result;
    };

    const transformBase = ({
        first,
        second
    }: {
        first: PostOperation | GetOperation;
        second: PostOperation | GetOperation;
    }) => {
        const boards = $DualKeyMap.transform({
            first: first.boards.dualKeyMap,
            second: second.boards.dualKeyMap,
            inner: Board.transform,
            diff: Board.diff
        });
        const bgms = $Map.transform({
            first: first.bgms,
            second: second.bgms,
            inner: Bgm.transform,
            diff: Bgm.diff
        });
        const characters = $DualKeyMap.transform({
            first: first.characters.dualKeyMap,
            second: second.characters.dualKeyMap,
            inner: Character.transform,
            diff: Character.diff
        });
        const paramNames = $DualKeyMap.transform({
            first: first.paramNames.dualKeyMap,
            second: second.paramNames.dualKeyMap,
            inner: ParamName.transform,
            diff: ParamName.diff
        });


        const firstPrime: Omit<GetOperation, 'participants'> = {
            boards: first.boards.wrap(boards.firstPrime),
            bgms: bgms.firstPrime,
            characters: first.characters.wrap(characters.firstPrime),
            paramNames: first.paramNames.wrap(paramNames.firstPrime),

        };
        const secondPrime: Omit<GetOperation, 'participants'> = {
            boards: first.boards.wrap(boards.secondPrime),
            bgms: bgms.secondPrime,
            characters: first.characters.wrap(characters.secondPrime),
            paramNames: first.paramNames.wrap(paramNames.secondPrime),
        };

        firstPrime.name = transformReplace({ first: first.name, second: second.name }).firstPrime;
        secondPrime.name = transformReplace({ first: first.name, second: second.name }).secondPrime;

        (['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const).forEach(i => {
            const key = `publicChannel${i}Name` as const;
            firstPrime[key] = transformReplace({ first: first[key], second: second[key] }).firstPrime;
            secondPrime[key] = transformReplace({ first: first[key], second: second[key] }).secondPrime;
        });

        return { firstPrime, secondPrime };
    };

    export const getFirstTransform = ({
        first,
        second
    }: {
        first: GetOperation;
        second: PostOperation;
    }): { firstPrime: GetOperation; secondPrime: PostOperation } => {
        const base = transformBase({ first, second });

        const participants = $UpdateMap.transformSecond({
            first: first.participants,
            second: second.participants,
            inner: Participant.getFirstTransform,
        });

        const firstPrime: GetOperation = {
            ...base.firstPrime,
            participants: participants.firstPrime,

        };
        const secondPrime: PostOperation = {
            ...base.secondPrime,
            participants: participants.secondPrime,
        };

        return { firstPrime, secondPrime };
    };

    export const postFirstTransform = ({
        first,
        second
    }: {
        first: PostOperation;
        second: GetOperation;
    }): { firstPrime: PostOperation; secondPrime: GetOperation } => {
        const base = transformBase({ first, second });

        const participants = $UpdateMap.transformFirst({
            first: first.participants,
            second: second.participants,
            inner: Participant.postFirstTransform,
        });

        const firstPrime: PostOperation = {
            ...base.firstPrime,
            participants: participants.firstPrime,

        };
        const secondPrime: GetOperation = {
            ...base.secondPrime,
            participants: participants.secondPrime,
        };

        return { firstPrime, secondPrime };
    };

    export const diff = ({
        prev,
        next
    }: {
        prev: State;
        next: State;
    }): GetOperation => {
        const boards = $DualKeyMap.diff({ prev: prev.boards.dualKeyMap, next: next.boards.dualKeyMap, inner: Board.diff });
        const characters = $DualKeyMap.diff({ prev: prev.characters.dualKeyMap, next: next.characters.dualKeyMap, inner: Character.diff });
        const bgms = $Map.diff({ prev: prev.bgms, next: next.bgms, inner: Bgm.diff });
        const paramNames = $DualKeyMap.diff({ prev: prev.paramNames.dualKeyMap, next: next.paramNames.dualKeyMap, inner: ParamName.diff });
        const participants = $Map.diff({ prev: prev.participants, next: next.participants, inner: Participant.diff });
        const result: GetOperation = {
            // wrapするのはprevとnextのどちらでも構わない。ここでは適当にprevとしている。
            boards: prev.boards.wrap(boards),
            characters: prev.characters.wrap(characters),
            bgms,
            paramNames: prev.paramNames.wrap(paramNames),
            participants,
        };

        if (prev.name !== next.name) {
            result.name = { newValue: next.name };
        }

        (['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const).forEach(i => {
            const key = `publicChannel${i}Name` as const;
            if (prev[key] !== next[key]) {
                result[key] = { newValue: next[key] };
            }
        });

        return result;
    };
}