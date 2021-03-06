import produce from 'immer';
import { CharacterOperationFragment, CharacterOperationInput, CharactersOperationInput, CharacterValueStateFragment, ReplaceCharacterOperationInput, UpdateCharacterOperationInput } from '../../generated/graphql';
import { transform as transformReplace, transformNullable as transformNullableReplace } from './replaceValue';
import * as $DualKeyMap from './dualKeyMap';
import * as $UpdateMap from './paramMap';
import { OperationElement, replace, update } from './types';
import { createStateMap, ReadonlyStateMap, StateMap } from '../../@shared/StateMap';
import { __ } from '../../@shared/collection';
import { isStrIndex100, StrIndex100 } from '../../@shared/indexes';
import { TextUpOperationModule } from '../../utils/operations';
import { ReplaceNullableValueOperationModule, ReplaceValueOperationModule } from './utils/replaceValueOperation';
import { BoolParam } from './boolParam';
import { NumParam } from './numParam';
import { Piece } from './piece';
import { StrParam } from './strParam';

export namespace Character {
    export type State = Omit<CharacterValueStateFragment, '__typename' | 'pieces' | 'boolParams' | 'numParams' | 'numMaxParams' | 'strParams'> & {
        pieces: ReadonlyStateMap<Piece.State>;
        boolParams: ReadonlyMap<StrIndex100, BoolParam.State>;
        numParams: ReadonlyMap<StrIndex100, NumParam.State>;
        numMaxParams: ReadonlyMap<StrIndex100, NumParam.State>;
        strParams: ReadonlyMap<StrIndex100, StrParam.State>;
    };
    // ***Paramsは削除不可能な要素なので、***Paramsの要素をremoveしてはならない。diffなどでremoveが出てくるケースは問題ない。
    export type PostOperation = Omit<CharacterOperationInput, 'pieces' | 'boolParams' | 'numParams' | 'numMaxParams' | 'strParams'> & {
        pieces: ReadonlyStateMap<OperationElement<Piece.State, Piece.PostOperation>>;
        boolParams: ReadonlyMap<StrIndex100, BoolParam.PostOperation>;
        numParams: ReadonlyMap<StrIndex100, NumParam.PostOperation>;
        numMaxParams: ReadonlyMap<StrIndex100, NumParam.PostOperation>;
        strParams: ReadonlyMap<StrIndex100, StrParam.PostOperation>;
    };
    export type WritablePostOperation = Omit<CharacterOperationInput, 'pieces' | 'boolParams' | 'numParams' | 'numMaxParams' | 'strParams'> & {
        pieces: StateMap<OperationElement<Piece.State, Piece.PostOperation>>;
        boolParams: Map<StrIndex100, BoolParam.PostOperation>;
        numParams: Map<StrIndex100, NumParam.PostOperation>;
        numMaxParams: Map<StrIndex100, NumParam.PostOperation>;
        strParams: Map<StrIndex100, StrParam.PostOperation>;
    };
    export type GetOperation = PostOperation;

    export const createState = (source: CharacterValueStateFragment): State => {
        // サーバーから受け取る値なので、キーの検証はしていない。

        const pieces = createStateMap<Piece.State>();
        source.pieces.forEach(piece => {
            pieces.set({ id: piece.boardId, createdBy: piece.boardCreatedBy }, piece.value);
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
            pieces: pieces,
            boolParams,
            numParams,
            numMaxParams,
            strParams,
        };
    };

    export const createGetOperation = (source: CharacterOperationInput | CharacterOperationFragment): GetOperation => {
        // サーバーから受け取る値なので、キーの検証はしていない。

        const pieces = createStateMap<OperationElement<Piece.State, Piece.GetOperation>>();
        source.pieces.replace.forEach(piece => {
            pieces.set({ createdBy: piece.boardCreatedBy, id: piece.boardId }, { type: replace, newValue: piece.newValue ?? undefined });
        });
        source.pieces.update.forEach(piece => {
            pieces.set({ createdBy: piece.boardCreatedBy, id: piece.boardId }, { type: update, operation: piece.operation });
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
            pieces,
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
                            image: operation.newValue.image,
                            isPrivate: operation.newValue.isPrivate,
                            name: operation.newValue.name,
                            pieces: __(operation.newValue.pieces).map(([key, value]) => ({
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
                            pieces: Piece.toGraphQLInput(operation.operation.pieces),
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
        const pieces = $DualKeyMap.apply({
            state: state.pieces.dualKeyMap,
            operation: operation.pieces.dualKeyMap,
            inner: Piece.applyOperation,
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
            state.pieces = state.pieces.wrap(pieces);
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
        state,
        first,
        second,
    }: {
        state: State;
        first: PostOperation;
        second: PostOperation;
    }): PostOperation => {
        // wrapするのはfirstとsecondのどちらでも問題ない。ここでは適当にfirstにしている。

        const result: PostOperation = { ...first };

        const pieces = $DualKeyMap.compose({
            state: state.pieces.dualKeyMap,
            first: first.pieces.dualKeyMap,
            second: second.pieces.dualKeyMap,
            innerApply: Piece.applyOperation,
            innerCompose: Piece.compose,
            innerDiff: Piece.diff,
        });
        result.pieces = first.pieces.wrap(pieces);

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
        const pieces = $DualKeyMap.transform({
            first: first.pieces.dualKeyMap,
            second: second.pieces.dualKeyMap,
            inner: Piece.transform,
            diff: Piece.diff
        });

        // wrapの呼び出し元はfirstとsecondのどちらでもいい
        const firstPrime: Omit<GetOperation, 'boolParams' | 'numParams' | 'numMaxParams' | 'strParams'> = {
            pieces: first.pieces.wrap(pieces.firstPrime),
        };
        const secondPrime: Omit<PostOperation, 'boolParams' | 'numParams' | 'numMaxParams' | 'strParams'> = {
            pieces: second.pieces.wrap(pieces.secondPrime),
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
        const pieces = $DualKeyMap.diff({
            prev: prev.pieces.dualKeyMap,
            next: next.pieces.dualKeyMap,
            inner: Piece.diff
        });

        // wrapの呼び出し元はprevとnextのどちらでもいい
        const result: Omit<PostOperation, 'boolParams' | 'numParams' | 'numMaxParams' | 'strParams'> = {
            pieces: prev.pieces.wrap(pieces),
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
}