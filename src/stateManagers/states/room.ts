import { CharactersOperationInput, ReplaceCharacterOperationInput, RoomGetStateFragment, RoomOperationValueFragment, RoomOperationValueInput, RoomParameterNameType, UpdateCharacterOperationInput } from '../../generated/graphql';
import * as Bgm from './roomBgm';
import * as Board from './board';
import * as Character from './character';
import * as ParamName from './paramName';
import * as Participant from './participant';
import produce from 'immer';
import { appConsole } from '../../utils/appConsole';
import * as $DualKeyMap from './dualKeyMap';
import * as $Map from './map';
import { transform as transformReplace, transformNullable as transformNullableReplace } from './replaceValue';
import { createStateMap, ReadonlyStateMap, StateMap } from '../../@shared/StateMap';
import { OperationElement, replace, update } from './types';
import { isStrIndex100, isStrIndex5, StrIndex100, StrIndex5 } from '../../@shared/indexes';
import { CustomDualKeyMap } from '../../@shared/CustomDualKeyMap';
import { ReplaceValueOperationModule } from './utils/replaceValueOperation';

export type State = Omit<RoomGetStateFragment, '__typename' | 'revision' | 'boards' | 'characters' | 'participants' | 'bgms' | 'paramNames'> & {
    boards: ReadonlyStateMap<Board.State>;
    characters: ReadonlyStateMap<Character.State>;
    participants: ReadonlyMap<string, Participant.State>;
    bgms: ReadonlyMap<StrIndex5, Bgm.State>;
    paramNames: ParamName.ReadonlyStateMap<ParamName.State>;
};

export type GetOperation = Omit<RoomOperationValueFragment, '__typename' | 'boards' | 'characters' | 'bgms' | 'paramNames'> & {
    boards: ReadonlyStateMap<OperationElement<Board.State, Board.GetOperation>>;
    characters: ReadonlyStateMap<OperationElement<Character.State, Character.GetOperation>>;
    bgms: ReadonlyMap<StrIndex5, OperationElement<Bgm.State, Bgm.GetOperation>>;
    paramNames: ParamName.ReadonlyStateMap<OperationElement<ParamName.State, ParamName.GetOperation>>;
}

export type PostOperation = Omit<RoomOperationValueInput, 'boards' | 'characters' | 'bgms' | 'paramNames'> & {
    boards: ReadonlyStateMap<OperationElement<Board.State, Board.PostOperation>>;
    characters: ReadonlyStateMap<OperationElement<Character.State, Character.PostOperation>>;
    bgms: ReadonlyMap<StrIndex5, OperationElement<Bgm.State, Bgm.PostOperation>>;
    paramNames: ParamName.ReadonlyStateMap<OperationElement<ParamName.State, ParamName.PostOperation>>;
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
    const participants = new Map<string, Participant.State>();
    source.participants.forEach(participant => {
        participants.set(participant.userUid, participant);
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
    return {
        ...source,
        boards,
        characters,
        participants,
        bgms,
        paramNames,
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

    return {
        ...source,
        boards,
        characters,
        bgms,
        paramNames,
    };
};

// addの場合、boardsの代わりにaddBoardsなどを用いてもいい。boards以外も同様。これらにより、createdByの入力を省略できる。
export type PostOperationSetup = Omit<PostOperation, 'boards' | 'characters' | 'bgms' | 'paramNames'> & {
    boards: StateMap<OperationElement<Board.State, Board.PostOperation>>;
    /** boardsへのaddを簡単に行うためのプロパティ */
    addBoards: Map<string, Board.State>;
    characters: StateMap<OperationElement<Character.State, Character.PostOperation>>;
    /** charactersへのaddを簡単に行うためのプロパティ */
    addCharacters: Map<string, Character.State>;
    bgms: Map<StrIndex5, OperationElement<Bgm.State, Bgm.PostOperation>>;
    paramNames: ParamName.StateMap<OperationElement<ParamName.State, ParamName.PostOperation>>;
}

export const createPostOperationSetup = (): PostOperationSetup => {
    return {
        boards: createStateMap(),
        addBoards: new Map(),
        characters: createStateMap(),
        addCharacters: new Map(),
        bgms: new Map(),
        paramNames: ParamName.createStateMap(),
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
    };
};

export const applyPostOperation = ({
    state,
    operation
}: {
    state: State;
    operation: PostOperation;
}): State => {
    return produce(state, draft => {
        draft.boards = state.boards.wrap(
            $DualKeyMap.apply({
                state: state.boards.dualKeyMap,
                operation: operation.boards.dualKeyMap,
                inner: Board.applyOperation
            }));
        draft.characters = state.characters.wrap(
            $DualKeyMap.apply({
                state: state.characters.dualKeyMap,
                operation: operation.characters.dualKeyMap,
                inner: Character.applyOperation
            }));
        draft.bgms = $Map.apply({
            state: state.bgms,
            operation: operation.bgms,
            inner: Bgm.applyOperation
        });
        draft.paramNames = state.paramNames.wrap(
            $DualKeyMap.apply({
                state: state.paramNames.dualKeyMap,
                operation: operation.paramNames.dualKeyMap,
                inner: ParamName.applyOperation
            }));

        if (operation.name != null) {
            draft.name = operation.name.newValue;
        }
    });
};

export const applyGetOperation = (params: {
    state: State;
    operation: GetOperation;
}): State => {
    return applyPostOperation(params);
};

export const compose = ({
    first,
    second
}: {
    first: PostOperation;
    second: PostOperation;
}): PostOperation => {
    const result: PostOperation = { ...first };

    result.boards = result.boards.wrap(
        $DualKeyMap.compose({
            first: first.boards.dualKeyMap,
            second: second.boards.dualKeyMap,
            innerApply: Board.applyOperation,
            innerCompose: Board.compose,
        }));

    result.characters = result.characters.wrap(
        $DualKeyMap.compose({
            first: first.characters.dualKeyMap,
            second: second.characters.dualKeyMap,
            innerApply: Character.applyOperation,
            innerCompose: Character.compose,
        }));

    result.bgms = $Map.compose({
        first: first.bgms,
        second: second.bgms,
        innerApply: Bgm.applyOperation,
        innerCompose: Bgm.compose,
    });

    result.paramNames = result.paramNames.wrap(
        $DualKeyMap.compose({
            first: first.paramNames.dualKeyMap,
            second: second.paramNames.dualKeyMap,
            innerApply: ParamName.applyOperation,
            innerCompose: ParamName.compose,
        }));

    result.name = ReplaceValueOperationModule.compose(first.name, second.name);

    return result;
};

const transformBase = ({
    first,
    second
}: {
    first: GetOperation;
    second: PostOperation;
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
    const paramNames = $DualKeyMap.transform({
        first: first.paramNames.dualKeyMap,
        second: second.paramNames.dualKeyMap,
        inner: ParamName.transform,
        diff: ParamName.diff
    });

    const firstPrime: Omit<GetOperation, 'characters'> = {
        boards: first.boards.wrap(boards.firstPrime),
        bgms: bgms.firstPrime,
        paramNames: first.paramNames.wrap(paramNames.firstPrime),

    };
    const secondPrime: Omit<PostOperation, 'characters'> = {
        boards: first.boards.wrap(boards.secondPrime),
        bgms: bgms.secondPrime,
        paramNames: first.paramNames.wrap(paramNames.secondPrime),
    };

    firstPrime.name = transformReplace({ first: first.name, second: second.name }).firstPrime;
    secondPrime.name = transformReplace({ first: first.name, second: second.name }).secondPrime;

    return { firstPrime, secondPrime };
};

export const transform = ({
    first,
    second
}: {
    first: GetOperation;
    second: PostOperation;
}): { firstPrime: GetOperation; secondPrime: PostOperation } => {
    const base = transformBase({ first, second });
    const characters = $DualKeyMap.transform({
        first: first.characters.dualKeyMap,
        second: second.characters.dualKeyMap,
        inner: Character.transform,
        diff: Character.diff
    });

    const firstPrime: GetOperation = {
        ...base.firstPrime,
        characters: first.characters.wrap(characters.firstPrime),

    };
    const secondPrime: PostOperation = {
        ...base.secondPrime,
        characters: first.characters.wrap(characters.secondPrime),
    };

    return { firstPrime, secondPrime };
};

export const diff = ({
    prev,
    next
}: {
    prev: State;
    next: State;
}): PostOperation => {
    const boards = $DualKeyMap.diff({ prev: prev.boards.dualKeyMap, next: next.boards.dualKeyMap, inner: Board.diff });
    const characters = $DualKeyMap.diff({ prev: prev.characters.dualKeyMap, next: next.characters.dualKeyMap, inner: Character.diff });
    const bgms = $Map.diff({ prev: prev.bgms, next: next.bgms, inner: Bgm.diff });
    const paramNames = $DualKeyMap.diff({ prev: prev.paramNames.dualKeyMap, next: next.paramNames.dualKeyMap, inner: ParamName.diff });
    const result: PostOperation = {
        // wrapするのはprevとnextのどちらでも構わない。ここでは適当にprevとしている。
        boards: prev.boards.wrap(boards),
        characters: prev.characters.wrap(characters),
        bgms,
        paramNames: prev.paramNames.wrap(paramNames),
    };

    if (prev.name !== next.name) {
        result.name = { newValue: next.name };
    }

    return result;
};