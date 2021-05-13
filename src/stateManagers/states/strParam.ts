import produce from 'immer';
import { StrIndex100 } from '../../@shared/indexes';
import { TextTwoWayOperation, TextUpOperation } from '../../@shared/textOperation';
import { undefinedForAll } from '../../@shared/utils';
import { StrParamOperation, StrParamOperationInput, StrParamsOperationInput, StrParamValueState, UpdateStrParamOperationInput } from '../../generated/graphql';
import { TextUpOperationModule } from '../../utils/operations';
import { transform as transformReplace } from './replaceValue';
import { ReplaceValueOperationModule } from './utils/replaceValueOperation';

export namespace StrParam {
    export type State = Omit<StrParamValueState, '__typename'>;
    export type PostOperation = Omit<StrParamOperationInput, 'value'> & {
        value?: TextUpOperation.Operation;
    };
    export type GetOperation = PostOperation;

    export const createGetOperation = (source: StrParamOperation): GetOperation => {
        const result: GetOperation = {
            ...source,
            value: TextUpOperationModule.ofUnit(source.value),
        };

        return result;
    };

    export const createPostOperation = createGetOperation;

    export const toGraphQLInput = (source: ReadonlyMap<StrIndex100, PostOperation>): StrParamsOperationInput => {
        const updates: UpdateStrParamOperationInput[] = [];
        for (const [key, value] of source) {
            updates.push({
                key,
                operation: {
                    ...value,
                    value: value.value === undefined ? undefined : TextUpOperationModule.toUnit(value.value),
                }
            });
        }
        return { update: updates };
    };

    export const applyOperation = ({ state, operation }: { state: State; operation: PostOperation | GetOperation }): State => {
        return produce(state, state => {
            if (operation.isValuePrivate != null) {
                state.isValuePrivate = operation.isValuePrivate.newValue;
            }
            if (operation.value != null) {
                state.value = TextUpOperationModule.apply(state.value, operation.value);
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
        result.value = TextUpOperationModule.compose({ first: first.value, second: second.value });

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

        const value = TextUpOperationModule.transform({
            first: first.value,
            second: second.value,
        });
        firstPrime.value = value.firstPrime;
        secondPrime.value = value.secondPrime;

        return { firstPrime, secondPrime };
    };

    export const diff = ({
        prev,
        next
    }: {
        prev: State;
        next: State;
    }): GetOperation | undefined => {
        const result: GetOperation = {};

        if (prev.isValuePrivate != next.isValuePrivate) {
            result.isValuePrivate = { newValue: next.isValuePrivate };
        }
        if (prev.value != next.value) {
            result.value = TextUpOperationModule.diff({ first: prev.value, second: next.value });
        }

        if (undefinedForAll(result)) {
            return undefined;
        }

        return result;
    };
}