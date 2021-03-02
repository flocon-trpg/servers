import produce from 'immer';
import { StrIndex100 } from '../../@shared/indexes';
import { BoolParamOperationInput, BoolParamsOperationInput, BoolParamValueState, UpdateBoolParamOperationInput } from '../../generated/graphql';
import { transform as transformReplace, transformNullable as transformNullableReplace } from './replaceValue';
import { ReplaceNullableValueOperationModule, ReplaceValueOperationModule } from './utils/replaceValueOperation';

export namespace BoolParam {
    export type State = Omit<BoolParamValueState, '__typename'>;
    export type PostOperation = BoolParamOperationInput;
    export type GetOperation = PostOperation;

    export const toGraphQLInput = (source: ReadonlyMap<StrIndex100, PostOperation>): BoolParamsOperationInput => {
        const updates: UpdateBoolParamOperationInput[] = [];
        for (const [key, value] of source) {
            updates.push({ key, operation: value });
        }
        return { update: updates };
    };

    export const applyOperation = ({ state, operation }: { state: State; operation: PostOperation | GetOperation }): State => {
        return produce(state, state => {
            if (operation.isValuePrivate != null) {
                state.isValuePrivate = operation.isValuePrivate.newValue;
            }
            if (operation.value != null) {
                state.value = operation.value.newValue;
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
        const result: PostOperation = { ...first };
        result.isValuePrivate = ReplaceValueOperationModule.compose(first.isValuePrivate, second.isValuePrivate);
        result.value = ReplaceNullableValueOperationModule.compose(first.value, second.value);
        return result;
    };

    export const transform = ({
        first,
        second
    }: {
        first: GetOperation;
        second: PostOperation;
    }): { firstPrime: GetOperation; secondPrime: PostOperation } => {
        const firstPrime: PostOperation = {};
        const secondPrime: PostOperation = {};

        firstPrime.isValuePrivate = transformReplace({ first: first.isValuePrivate, second: second.isValuePrivate }).firstPrime;
        secondPrime.isValuePrivate = transformReplace({ first: first.isValuePrivate, second: second.isValuePrivate }).secondPrime;

        firstPrime.value = transformNullableReplace({ first: first.value, second: second.value }).firstPrime;
        secondPrime.value = transformNullableReplace({ first: first.value, second: second.value }).secondPrime;

        return { firstPrime, secondPrime };
    };

    export const diff = ({
        prev,
        next
    }: {
        prev: State;
        next: State;
    }): GetOperation => {
        const result: GetOperation = {};

        if (prev.isValuePrivate != next.isValuePrivate) {
            result.isValuePrivate = { newValue: next.isValuePrivate };
        }
        if (prev.value != next.value) {
            result.value = { newValue: next.value };
        }

        return result;
    };
}