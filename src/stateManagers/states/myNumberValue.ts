import produce from 'immer';
import { __ } from '../../@shared/collection';
import { createStateMap, ReadonlyStateMap } from '../../@shared/StateMap';
import { MyNumberValueOperation, MyNumberValueOperationInput, MyNumberValuesOperationInput, MyNumberValueStateValueFragment, ReplaceMyNumberValueOperationInput, UpdateMyNumberValueOperationInput } from '../../generated/graphql';
import { Piece } from './piece';
import { OperationElement, replace, update } from './types';
import * as $DualKeyMap from './dualKeyMap';
import { ReplaceNullableValueOperationModule, ReplaceValueOperationModule } from './utils/replaceValueOperation';
import { transform as transformReplace, transformNullable as transformNullableReplace } from './replaceValue';

export namespace MyNumberValue {
    export type State = Omit<MyNumberValueStateValueFragment, '__typename' | 'pieces'> & {
        pieces: ReadonlyStateMap<Piece.State>;
    };
    export type PostOperation = Omit<MyNumberValueOperationInput, 'pieces'> & {
        pieces: ReadonlyStateMap<OperationElement<Piece.State, Piece.PostOperation>>;
    };
    export type GetOperation = PostOperation;

    export const stringify = (source: State): string => {
        const range: string | null = (() => {
            if (source.valueRangeMin == null && source.valueRangeMax == null) {
                return null;
            }
            return `範囲: ${source.valueRangeMin ?? '？'}～${source.valueRangeMax ?? '？'}`;
        })();
        return `${source.value ?? '？'} ${range == null ? '' : `(${range})`} ${(source.value != null && source.isValuePrivate) ? '(値は非公開)' : ''}`;
    };

    export const createState = (source: MyNumberValueStateValueFragment): State => {
        const pieces = createStateMap<Piece.State>();
        source.pieces.forEach(piece => {
            pieces.set({createdBy: piece.boardCreatedBy, id: piece.boardId }, piece.value);
        });

        return {
            ...source,
            pieces,
        };
    };

    export const createGetOperation = (source: MyNumberValueOperationInput | MyNumberValueOperation): GetOperation => {
        // サーバーから受け取る値なので、キーの検証はしていない。

        const pieces = createStateMap<OperationElement<Piece.State, Piece.GetOperation>>();
        source.pieces.replace.forEach(piece => {
            pieces.set({ createdBy: piece.boardCreatedBy, id: piece.boardId }, { type: replace, newValue: piece.newValue ?? undefined });
        });
        source.pieces.update.forEach(piece => {
            pieces.set({ createdBy: piece.boardCreatedBy, id: piece.boardId }, { type: update, operation: piece.operation });
        });

        const result: GetOperation = {
            ...source,
            pieces,
        };

        return result;
    };

    export const createPostOperation = createGetOperation;

    export const toGraphQLInput = (source: ReadonlyMap<string, OperationElement<State, PostOperation>>): MyNumberValuesOperationInput => {
        const myNumberValuesReplace: ReplaceMyNumberValueOperationInput[] = [];
        const myNumberValuesUpdate: UpdateMyNumberValueOperationInput[] = [];
        source.forEach((operation, key) => {
            switch (operation.type) {
                case replace: {
                    if (operation.newValue === undefined) {
                        myNumberValuesReplace.push({ stateId: key, newValue: undefined });
                        return;
                    }

                    myNumberValuesReplace.push({
                        stateId: key,
                        newValue: {
                            ...operation.newValue,
                            pieces: __(operation.newValue.pieces).map(([key, value]) => ({
                                boardId: key.id,
                                boardCreatedBy: key.createdBy,
                                value,
                            })).toArray(),
                        },
                    });
                    return;
                }
                case update: {
                    const next: UpdateMyNumberValueOperationInput = {
                        stateId: key,
                        operation: {
                            ...operation.operation,
                            pieces: Piece.toGraphQLInput(operation.operation.pieces),
                        }
                    };
                    myNumberValuesUpdate.push(next);
                    return;
                }
            }
        });
        return {
            replace: myNumberValuesReplace,
            update: myNumberValuesUpdate,
        };
    };

    export const applyOperation = ({ state, operation }: { state: State; operation: PostOperation | GetOperation }): State => {
        const pieces = $DualKeyMap.apply({
            state: state.pieces.dualKeyMap,
            operation: operation.pieces.dualKeyMap,
            inner: Piece.applyOperation,
        });
        return produce(state, state => {
            state.pieces = state.pieces.wrap(pieces);
            if (operation.isValuePrivate != null) {
                state.isValuePrivate = operation.isValuePrivate.newValue;
            }
            if (operation.value != null) {
                state.value = operation.value.newValue;
            }
            if (operation.valueRangeMax != null) {
                state.valueRangeMax = operation.valueRangeMax.newValue;
            }
            if (operation.valueRangeMin != null) {
                state.valueRangeMin = operation.valueRangeMin.newValue;
            }
        });
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

        result.isValuePrivate = ReplaceValueOperationModule.compose(first.isValuePrivate, second.isValuePrivate);
        result.value = ReplaceValueOperationModule.compose(first.value, second.value);
        result.valueRangeMax = ReplaceNullableValueOperationModule.compose(first.valueRangeMax, second.valueRangeMax);
        result.valueRangeMin = ReplaceNullableValueOperationModule.compose(first.valueRangeMin, second.valueRangeMin);
        return result;
    };

    export const transform = ({
        first,
        second
    }: {
        first: GetOperation;
        second: PostOperation;
    }): { firstPrime: GetOperation; secondPrime: PostOperation } => {
        const pieces = $DualKeyMap.transform({
            first: first.pieces.dualKeyMap,
            second: second.pieces.dualKeyMap,
            inner: Piece.transform,
            diff: Piece.diff
        });

        // wrapの呼び出し元はfirstとsecondのどちらでもいい
        const firstPrime: GetOperation = {
            pieces: first.pieces.wrap(pieces.firstPrime),
        };
        const secondPrime: PostOperation = {
            pieces: second.pieces.wrap(pieces.secondPrime),
        };

        firstPrime.isValuePrivate = transformReplace({ first: first.isValuePrivate, second: second.isValuePrivate }).firstPrime;
        secondPrime.isValuePrivate = transformReplace({ first: first.isValuePrivate, second: second.isValuePrivate }).secondPrime;

        firstPrime.value = transformReplace({ first: first.value, second: second.value }).firstPrime;
        secondPrime.value = transformReplace({ first: first.value, second: second.value }).secondPrime;

        firstPrime.valueRangeMax = transformNullableReplace({ first: first.valueRangeMax, second: second.valueRangeMax }).firstPrime;
        secondPrime.valueRangeMax = transformNullableReplace({ first: first.valueRangeMax, second: second.valueRangeMax }).secondPrime;

        firstPrime.valueRangeMin = transformNullableReplace({ first: first.valueRangeMin, second: second.valueRangeMin }).firstPrime;
        secondPrime.valueRangeMin = transformNullableReplace({ first: first.valueRangeMin, second: second.valueRangeMin }).secondPrime;

        return { firstPrime, secondPrime };
    };

    export const diff = ({
        prev,
        next
    }: {
        prev: State;
        next: State;
    }): GetOperation => {
        const pieces = $DualKeyMap.diff({
            prev: prev.pieces.dualKeyMap,
            next: next.pieces.dualKeyMap,
            inner: Piece.diff
        });

        // wrapの呼び出し元はprevとnextのどちらでもいい
        const result: GetOperation = {
            pieces: prev.pieces.wrap(pieces),
        };

        if (prev.isValuePrivate != next.isValuePrivate) {
            result.isValuePrivate = { newValue: next.isValuePrivate };
        }
        if (prev.value != next.value) {
            result.value = { newValue: next.value ?? 0 };
        }
        if (prev.valueRangeMax != next.valueRangeMax) {
            result.valueRangeMax = { newValue: next.valueRangeMax };
        }
        if (prev.valueRangeMin != next.valueRangeMin) {
            result.valueRangeMin = { newValue: next.valueRangeMin };
        }

        return result;
    };
}