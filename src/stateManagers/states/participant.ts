import { ParticipantOperation, ParticipantOperationInput, ParticipantsOperationInput, ParticipantValueStateFragment, UpdateParticipantOperationInput } from '../../generated/graphql';
import produce from 'immer';
import * as $Map from './map';
import { OperationElement, OperationElement as OperationElementCore, replace, update } from './types';
import { ReplaceNullableValueOperationModule, ReplaceValueOperationModule } from './utils/replaceValueOperation';
import { MyNumberValue } from './myNumberValue';
import { transform as transformReplace, transformNullable as transformNullableReplace } from './replaceValue';

export namespace Participant {
    export type State = Omit<ParticipantValueStateFragment, '__typename' | 'myNumberValues'> & {
        myNumberValues: ReadonlyMap<string, MyNumberValue.State>;
    }

    export type PostOperation = Omit<ParticipantOperationInput, '__typename' | 'myNumberValues'> & {
        myNumberValues: ReadonlyMap<string, OperationElementCore<MyNumberValue.State, MyNumberValue.PostOperation>>;
    }

    export type GetOperation = Omit<ParticipantOperation, '__typename' | 'myNumberValues'> & {
        myNumberValues: ReadonlyMap<string, OperationElementCore<MyNumberValue.State, MyNumberValue.GetOperation>>;
    }

    export const createState = (source: ParticipantValueStateFragment): State => {
        const myNumberValues = new Map<string, MyNumberValue.State>();
        source.myNumberValues.forEach(myNumberValue => {
            myNumberValues.set(myNumberValue.stateId, MyNumberValue.createState(myNumberValue.value));
        });

        return {
            ...source,
            myNumberValues
        };
    };

    export const createGetOperation = (source: ParticipantOperationInput): GetOperation => {
        // サーバーから受け取る値なので、キーの検証はしていない。

        const myNumberValues = new Map<string, OperationElement<MyNumberValue.State, MyNumberValue.PostOperation>>();
        source.myNumberValues.replace.forEach(myNumberValue => {
            myNumberValues.set(myNumberValue.stateId, { type: replace, newValue: myNumberValue.newValue == null ? undefined : MyNumberValue.createState(myNumberValue.newValue) });
        });
        source.myNumberValues.update.forEach(myNumberValue => {
            myNumberValues.set(myNumberValue.stateId, { type: update, operation: MyNumberValue.createPostOperation(myNumberValue.operation) });
        });

        const result: GetOperation = {
            ...source,
            myNumberValues,
        };

        return result;
    };

    export const createPostOperation = (source: ParticipantOperationInput): PostOperation => {
        return createGetOperation(source);
    };

    export const toGraphQLInput = (source: ReadonlyMap<string, PostOperation>): ParticipantsOperationInput => {
        // replaceはParticipantsOperationInputに存在しないため、updateのみを処理している
        const charactersUpdate: UpdateParticipantOperationInput[] = [];
        source.forEach((operation, key) => {
            const next: UpdateParticipantOperationInput = {
                userUid: key,
                operation: {
                    ...operation,
                    myNumberValues: MyNumberValue.toGraphQLInput(operation.myNumberValues),
                }
            };
            charactersUpdate.push(next);
        });
        return {
            update: charactersUpdate,
        };
    };

    export const applyPostOperation = ({
        state,
        operation
    }: {
        state: State;
        operation: PostOperation;
    }) => {
        const myNumberValues = $Map.apply({
            state: state.myNumberValues,
            operation: operation.myNumberValues,
            inner: MyNumberValue.applyOperation,
        });

        return produce(state, draft => {
            draft.myNumberValues = myNumberValues;
        });
    };

    export const applyGetOperation = ({
        state,
        operation
    }: {
        state: State;
        operation: GetOperation;
    }) => {
        return produce(applyPostOperation({ state, operation }), draft => {
            if (operation.name != null) {
                draft.name = operation.name.newValue;
            }
            if (operation.role != null) {
                draft.role = operation.role.newValue;
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

        const myNumberValues = $Map.compose({
            state: state.myNumberValues,
            first: first.myNumberValues,
            second: second.myNumberValues,
            innerApply: MyNumberValue.applyOperation,
            innerCompose: ({ state, first, second }) => {
                if (state === undefined) {
                    throw 'myNumberValue state not found';
                }
                return MyNumberValue.compose({ state, first, second });
            },
            innerDiff: MyNumberValue.diff,
        });
        result.myNumberValues = myNumberValues;
        return result;
    };

    export const getFirstTransform = ({
        first,
        second
    }: {
        first: GetOperation;
        second: PostOperation;
    }): { firstPrime: GetOperation; secondPrime: PostOperation } => {
        const myNumberValues = $Map.transform({
            first: first.myNumberValues,
            second: second.myNumberValues,
            inner: MyNumberValue.transform,
            diff: MyNumberValue.diff
        });

        const firstPrime: GetOperation = {
            myNumberValues: myNumberValues.firstPrime,
        };
        const secondPrime: PostOperation = {
            myNumberValues: myNumberValues.secondPrime,
        };

        firstPrime.role = transformNullableReplace({ first: first.role, second: undefined }).firstPrime;

        firstPrime.name = transformReplace({ first: first.name, second: undefined }).firstPrime;

        return { firstPrime, secondPrime };
    };

    export const postFirstTransform = ({
        first,
        second
    }: {
        first: PostOperation;
        second: GetOperation;
    }): { firstPrime: PostOperation; secondPrime: GetOperation } => {
        const myNumberValues = $Map.transform({
            first: first.myNumberValues,
            second: second.myNumberValues,
            inner: MyNumberValue.transform,
            diff: MyNumberValue.diff
        });

        const firstPrime: PostOperation = {
            myNumberValues: myNumberValues.firstPrime,
        };
        const secondPrime: GetOperation = {
            myNumberValues: myNumberValues.secondPrime,
        };

        secondPrime.role = transformNullableReplace({ first: undefined, second: second.role }).secondPrime;

        secondPrime.name = transformReplace({ first: undefined, second: second.name }).secondPrime;

        return { firstPrime, secondPrime };
    };

    export const diff = ({
        prev,
        next
    }: {
        prev: State;
        next: State;
    }): GetOperation => {
        const myNumberValues = $Map.diff({
            prev: prev.myNumberValues,
            next: next.myNumberValues,
            inner: MyNumberValue.diff
        });

        const result: GetOperation = {
            myNumberValues,
        };

        if (prev.role != next.role) {
            result.role = { newValue: next.role };
        }
        if (prev.name != next.name) {
            result.name = { newValue: next.name };
        }

        return result;
    };
}