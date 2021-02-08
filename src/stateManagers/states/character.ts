import produce from 'immer';
import { CharacterOperationFragment, CharacterOperationInput, CharactersOperationInput, CharacterValueStateFragment, PieceLocationOperationInput, PieceLocationValueState, ReplaceCharacterOperationInput, ReplacePieceLocationOperationInput, UpdateCharacterOperationInput, UpdatePieceLocationOperationInput } from '../../generated/graphql';
import { transform as transformReplace, transformNullable as transformNullableReplace } from './replaceValue';
import * as PieceLocation from './pieceLocation';
import * as $DualKeyMap from './dualKeyMap';
import * as $Map from './map';
import * as $UpdateMap from './updateMap';
import * as StrParam from './strParam';
import * as NumParam from './numParam';
import * as BoolParam from './boolParam';
import { OperationElement, replace, update } from './types';
import { createStateMap, ReadonlyStateMap, StateMap } from '../../@shared/StateMap';
import { __ } from '../../@shared/collection';
import { isStrIndex100, StrIndex100 } from '../../@shared/indexes';
import { TextUpOperationModule } from '../../utils/operations';
import { ReplaceNullableValueOperationModule, ReplaceValueOperationModule } from './utils/replaceValueOperation';

export type State = Omit<CharacterValueStateFragment, '__typename' | 'pieceLocations' | 'boolParams' | 'numParams' | 'numMaxParams' | 'strParams'> & {
    pieceLocations: ReadonlyStateMap<PieceLocation.State>;
    boolParams: ReadonlyMap<StrIndex100, BoolParam.State>;
    numParams: ReadonlyMap<StrIndex100, NumParam.State>;
    numMaxParams: ReadonlyMap<StrIndex100, NumParam.State>;
    strParams: ReadonlyMap<StrIndex100, StrParam.State>;
};
// ***Paramsは削除不可能な要素なので、***Paramsの要素をremoveしてはならない。diffなどでremoveが出てくるケースは問題ない。
export type PostOperation = Omit<CharacterOperationInput, 'pieceLocations' | 'boolParams' | 'numParams' | 'numMaxParams' | 'strParams'> & {
    pieceLocations: ReadonlyStateMap<OperationElement<PieceLocation.State, PieceLocation.PostOperation>>;
    boolParams: ReadonlyMap<StrIndex100, BoolParam.PostOperation>;
    numParams: ReadonlyMap<StrIndex100, NumParam.PostOperation>;
    numMaxParams: ReadonlyMap<StrIndex100, NumParam.PostOperation>;
    strParams: ReadonlyMap<StrIndex100, StrParam.PostOperation>;
};
export type WritablePostOperation = Omit<CharacterOperationInput, 'pieceLocations' | 'boolParams' | 'numParams' | 'numMaxParams' | 'strParams'> & {
    pieceLocations: StateMap<OperationElement<PieceLocation.State, PieceLocation.PostOperation>>;
    boolParams: Map<StrIndex100, BoolParam.PostOperation>;
    numParams: Map<StrIndex100, NumParam.PostOperation>;
    numMaxParams: Map<StrIndex100, NumParam.PostOperation>;
    strParams: Map<StrIndex100, StrParam.PostOperation>;
};
export type GetOperation = PostOperation;

export const createState = (source: CharacterValueStateFragment): State => {
    // サーバーから受け取る値なので、キーの検証はしていない。

    const pieceLocations = createStateMap<PieceLocation.State>();
    source.pieceLocations.forEach(pieceLocation => {
        pieceLocations.set({ id: pieceLocation.boardId, createdBy: pieceLocation.boardCreatedBy }, pieceLocation.value);
    });
    const boolParams = new Map<StrIndex100, BoolParam.State>();
    source.boolParams.forEach(boolParam => {
        const key = boolParam.key;
        if (!isStrIndex100(key)) {
            return;
        }
        boolParams.set(key, boolParam.value);
    });
    const numParams = new Map<StrIndex100, NumParam.State>();
    source.numParams.forEach(numParam => {
        const key = numParam.key;
        if (!isStrIndex100(key)) {
            return;
        }
        numParams.set(key, numParam.value);
    });
    const numMaxParams = new Map<StrIndex100, NumParam.State>();
    source.numMaxParams.forEach(numMaxParam => {
        const key = numMaxParam.key;
        if (!isStrIndex100(key)) {
            return;
        }
        numMaxParams.set(key, numMaxParam.value);
    });
    const strParams = new Map<StrIndex100, StrParam.State>();
    source.strParams.forEach(strParam => {
        const key = strParam.key;
        if (!isStrIndex100(key)) {
            return;
        }
        strParams.set(key, strParam.value);
    });

    return {
        ...source,
        pieceLocations,
        boolParams,
        numParams,
        numMaxParams,
        strParams,
    };
};

export const createGetOperation = (source: CharacterOperationInput | CharacterOperationFragment): GetOperation => {
    // サーバーから受け取る値なので、キーの検証はしていない。

    const pieceLocations = createStateMap<OperationElement<PieceLocation.State, PieceLocation.GetOperation>>();
    source.pieceLocations.replace.forEach(pieceLocation => {
        pieceLocations.set({ createdBy: pieceLocation.boardCreatedBy, id: pieceLocation.boardId }, { type: replace, newValue: pieceLocation.newValue ?? undefined });
    });
    source.pieceLocations.update.forEach(pieceLocation => {
        pieceLocations.set({ createdBy: pieceLocation.boardCreatedBy, id: pieceLocation.boardId }, { type: update, operation: pieceLocation.operation });
    });

    const boolParams = new Map<StrIndex100, BoolParam.GetOperation>();
    source.boolParams.update.forEach(boolParam => {
        const key = boolParam.key;
        if (!isStrIndex100(key)) {
            return;
        }
        boolParams.set(key, boolParam.operation);
    });

    const numParams = new Map<StrIndex100, NumParam.GetOperation>();
    source.numParams.update.forEach(numParam => {
        const key = numParam.key;
        if (!isStrIndex100(key)) {
            return;
        }
        numParams.set(key, numParam.operation);
    });

    const numMaxParams = new Map<StrIndex100, NumParam.GetOperation>();
    source.numMaxParams.update.forEach(numMaxParam => {
        const key = numMaxParam.key;
        if (!isStrIndex100(key)) {
            return;
        }
        numMaxParams.set(key, numMaxParam.operation);
    });

    const strParams = new Map<StrIndex100, StrParam.GetOperation>();
    source.strParams.update.forEach(strParam => {
        const key = strParam.key;
        if (!isStrIndex100(key)) {
            return;
        }
        strParams.set(key, StrParam.createGetOperation(strParam.operation));
    });

    const result: GetOperation = {
        ...source,
        pieceLocations,
        boolParams,
        numParams,
        numMaxParams,
        strParams,
    };

    return result;
};

export const createPostOperation = createGetOperation;

export const toGraphQLInput = (source: ReadonlyStateMap<OperationElement<State, PostOperation>>): CharactersOperationInput => {
    const charactersReplace: ReplaceCharacterOperationInput[] = [];
    const charactersUpdate: UpdateCharacterOperationInput[] = [];
    source.forEach((operation, key) => {
        switch (operation.type) {
            case replace: {
                if (operation.newValue === undefined) {
                    charactersReplace.push({ ...key, newValue: undefined });
                    return;
                }

                charactersReplace.push({
                    ...key,
                    newValue: {
                        ...operation.newValue,
                        pieceLocations: __(operation.newValue.pieceLocations).map(([key, value]) => ({
                            boardId: key.id,
                            boardCreatedBy: key.createdBy,
                            value,
                        })).toArray(),
                        boolParams: __(operation.newValue.boolParams).map(([key, value]) => ({
                            key,
                            value,
                        })).toArray(),
                        numParams: __(operation.newValue.numParams).map(([key, value]) => ({
                            key,
                            value,
                        })).toArray(),
                        numMaxParams: __(operation.newValue.numMaxParams).map(([key, value]) => ({
                            key,
                            value,
                        })).toArray(),
                        strParams: __(operation.newValue.strParams).map(([key, value]) => ({
                            key,
                            value,
                        })).toArray(),
                    },
                });
                return;
            }
            case update: {
                const next: UpdateCharacterOperationInput = {
                    ...key,
                    operation: {
                        ...operation.operation,
                        pieceLocations: PieceLocation.toGraphQLInput(operation.operation.pieceLocations),
                        boolParams: BoolParam.toGraphQLInput(operation.operation.boolParams),
                        numParams: NumParam.toGraphQLInput(operation.operation.numParams),
                        numMaxParams: NumParam.toGraphQLInput(operation.operation.numMaxParams),
                        strParams: StrParam.toGraphQLInput(operation.operation.strParams),
                    }
                };
                charactersUpdate.push(next);
                return;
            }
        }
    });
    return {
        replace: charactersReplace,
        update: charactersUpdate,
    };
};


export const applyOperation = ({ state, operation }: { state: State; operation: PostOperation | GetOperation }): State => {
    const pieceLocations = $DualKeyMap.apply({
        state: state.pieceLocations.dualKeyMap,
        operation: operation.pieceLocations.dualKeyMap,
        inner: PieceLocation.applyOperation,
    });

    const boolParams = $UpdateMap.apply({
        state: state.boolParams,
        operation: operation.boolParams,
        inner: BoolParam.applyOperation,
        create: operation => {
            return {
                isValuePrivate: operation.isValuePrivate?.newValue ?? false,
                value: operation.value?.newValue,
            };
        },
    });
    const numParams = $UpdateMap.apply({
        state: state.numParams,
        operation: operation.numParams,
        inner: NumParam.applyOperation,
        create: operation => {
            return {
                isValuePrivate: operation.isValuePrivate?.newValue ?? false,
                value: operation.value?.newValue,
            };
        },
    });
    const numMaxParams = $UpdateMap.apply({
        state: state.numMaxParams,
        operation: operation.numMaxParams,
        inner: NumParam.applyOperation,
        create: operation => {
            return {
                isValuePrivate: operation.isValuePrivate?.newValue ?? false,
                value: operation.value?.newValue,
            };
        },
    });
    const strParams = $UpdateMap.apply({
        state: state.strParams,
        operation: operation.strParams,
        inner: StrParam.applyOperation,
        create: operation => {
            return {
                isValuePrivate: operation.isValuePrivate?.newValue ?? false,
                value: TextUpOperationModule.apply('', operation.value),
            };
        },
    });

    return produce(state, state => {
        state.pieceLocations = state.pieceLocations.wrap(pieceLocations);
        state.boolParams = boolParams;
        state.numParams = numParams;
        state.numMaxParams = numMaxParams;
        state.strParams = strParams;

        if (operation.image != null) {
            state.image = operation.image.newValue;
        }
        if (operation.isPrivate != null) {
            state.isPrivate = operation.isPrivate.newValue;
        }
        if (operation.name != null) {
            state.name = operation.name.newValue;
        }
    });
};

export const compose = ({
    first,
    second
}: {
    first: PostOperation;
    second: PostOperation;
}): PostOperation => {
    // wrapするのはfirstとsecondのどちらでも問題ない。ここでは適当にfirstにしている。

    const result: PostOperation = { ...first };

    const pieceLocations = $DualKeyMap.compose({
        first: first.pieceLocations.dualKeyMap,
        second: second.pieceLocations.dualKeyMap,
        innerApply: PieceLocation.applyOperation,
        innerCompose: PieceLocation.compose,
    });
    result.pieceLocations = first.pieceLocations.wrap(pieceLocations);

    result.boolParams = $UpdateMap.compose({
        first: first.boolParams,
        second: second.boolParams,
        innerCompose: BoolParam.compose,
    });

    result.numParams = $UpdateMap.compose({
        first: first.numParams,
        second: second.numParams,
        innerCompose: NumParam.compose,
    });

    result.numMaxParams = $UpdateMap.compose({
        first: first.numMaxParams,
        second: second.numMaxParams,
        innerCompose: NumParam.compose,
    });

    result.strParams = $UpdateMap.compose({
        first: first.strParams,
        second: second.strParams,
        innerCompose: StrParam.compose,
    });

    result.image = ReplaceNullableValueOperationModule.compose(first.image, second.image);
    result.isPrivate = ReplaceValueOperationModule.compose(first.isPrivate, second.isPrivate);
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
    const pieceLocations = $DualKeyMap.transform({
        first: first.pieceLocations.dualKeyMap,
        second: second.pieceLocations.dualKeyMap,
        inner: PieceLocation.transform,
        diff: PieceLocation.diff
    });

    // wrapの呼び出し元はfirstとsecondのどちらでもいい
    const firstPrime: Omit<GetOperation, 'boolParams' | 'numParams' | 'numMaxParams' | 'strParams'> = {
        pieceLocations: first.pieceLocations.wrap(pieceLocations.firstPrime),
    };
    const secondPrime: Omit<PostOperation, 'boolParams' | 'numParams' | 'numMaxParams' | 'strParams'> = {
        pieceLocations: second.pieceLocations.wrap(pieceLocations.secondPrime),
    };

    firstPrime.image = transformNullableReplace({ first: first.image, second: second.image }).firstPrime;
    secondPrime.image = transformNullableReplace({ first: first.image, second: second.image }).secondPrime;

    firstPrime.isPrivate = transformReplace({ first: first.isPrivate, second: second.isPrivate }).firstPrime;
    secondPrime.isPrivate = transformReplace({ first: first.isPrivate, second: second.isPrivate }).secondPrime;

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

    const boolParams = $UpdateMap.transform({
        first: first.boolParams,
        second: second.boolParams,
        inner: BoolParam.transform,
    });
    const numParams = $UpdateMap.transform({
        first: first.numParams,
        second: second.numParams,
        inner: NumParam.transform,
    });
    const numMaxParams = $UpdateMap.transform({
        first: first.numMaxParams,
        second: second.numMaxParams,
        inner: NumParam.transform,
    });
    const strParams = $UpdateMap.transform({
        first: first.strParams,
        second: second.strParams,
        inner: StrParam.transform,
    });

    // wrapの呼び出し元はfirstとsecondのどちらでもいい
    const firstPrime: PostOperation = {
        ...base.firstPrime,
        boolParams: boolParams.firstPrime,
        numParams: numParams.firstPrime,
        numMaxParams: numMaxParams.firstPrime,
        strParams: strParams.firstPrime,
    };
    const secondPrime: PostOperation = {
        ...base.secondPrime,
        boolParams: boolParams.secondPrime,
        numParams: numParams.secondPrime,
        numMaxParams: numMaxParams.secondPrime,
        strParams: strParams.secondPrime,
    };

    return { firstPrime, secondPrime };
};

const diffBase = ({
    prev,
    next
}: {
    prev: State;
    next: State;
}) => {
    const pieceLocations = $DualKeyMap.diff({
        prev: prev.pieceLocations.dualKeyMap,
        next: next.pieceLocations.dualKeyMap,
        inner: PieceLocation.diff
    });

    // wrapの呼び出し元はprevとnextのどちらでもいい
    const result: Omit<PostOperation, 'boolParams' | 'numParams' | 'numMaxParams' | 'strParams'> = {
        pieceLocations: prev.pieceLocations.wrap(pieceLocations),
    };

    if (prev.image != next.image) {
        result.image = { newValue: next.image };
    }
    if (prev.isPrivate != next.isPrivate) {
        result.isPrivate = { newValue: next.isPrivate };
    }
    if (prev.name != next.name) {
        result.name = { newValue: next.name };
    }

    return result;
};

export const diff = ({
    prev,
    next
}: {
    prev: State;
    next: State;
}): PostOperation => {
    const boolParams = $UpdateMap.diff({
        prev: prev.boolParams,
        next: next.boolParams,
        inner: ({ prev, next }) => BoolParam.diff({
            prev: prev ?? { isValuePrivate: false },
            next: next ?? { isValuePrivate: false },
        })
    });
    const numParams = $UpdateMap.diff({
        prev: prev.numParams,
        next: next.numParams,
        inner: ({ prev, next }) => NumParam.diff({
            prev: prev ?? { isValuePrivate: false },
            next: next ?? { isValuePrivate: false },
        })
    });
    const numMaxParams = $UpdateMap.diff({
        prev: prev.numMaxParams,
        next: next.numMaxParams,
        inner: ({ prev, next }) => NumParam.diff({
            prev: prev ?? { isValuePrivate: false },
            next: next ?? { isValuePrivate: false },
        })
    });
    const strParams = $UpdateMap.diff({
        prev: prev.strParams,
        next: next.strParams,
        inner: ({ prev, next }) => StrParam.diff({
            prev: prev ?? { isValuePrivate: false, value: '' },
            next: next ?? { isValuePrivate: false, value: '' },
        })
    });

    return {
        ...diffBase({ prev, next }),
        boolParams,
        numParams,
        numMaxParams,
        strParams,
    };
};