import * as t from 'io-ts';
import * as TextOperation from '../../../util/textOperation';
import * as ReplaceOperation from '../../../util/replaceOperation';
import { ParamRecordTransformerFactory } from '../../../util/transformerFactory';
import { ApplyError, ComposeAndTransformError, PositiveInt } from '../../../../../textOperation';
import { ResultModule } from '../../../../../Result';
import { undefinedForAll } from '../../../../../utils';
import { Apply, ToClientOperationParams } from '../../../util/type';

export const state = t.type({ isValuePrivate: t.boolean, value: t.string });

export type State = t.TypeOf<typeof state>;

export const downOperation = t.partial({
    isValuePrivate: t.type({ oldValue: t.boolean }),
    value: TextOperation.downOperation,
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = t.partial({
    isValuePrivate: t.type({ newValue: t.boolean }),
    value: TextOperation.upOperation,
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    isValuePrivate?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    value?: TextOperation.TwoWayOperation;
}

export const toClientState = (createdByMe: boolean) => (source: State): State => {
    return {
        ...source,
        value: source.isValuePrivate && !createdByMe ? '' : source.value,
    };
};

export const toServerOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        value: source.value == null ? undefined : TextOperation.toDownOperation(source.value),
    };
};

export const toClientOperation = (createdByMe: boolean) => ({ prevState, nextState, diff }: ToClientOperationParams<State, TwoWayOperation>): UpOperation => {
    return {
        ...diff,
        value: TextOperation.toPrivateClientOperation({
            oldValue: {
                value: prevState.value,
                isValuePrivate: prevState.isValuePrivate,
            },
            newValue: {
                value: nextState.value,
                isValuePrivate: nextState.isValuePrivate,
            },
            diff: diff.value,
            createdByMe,
        })
    };
};

export const apply: Apply<State, UpOperation | TwoWayOperation> = ({ state, operation }) => {
    const result: State = { ...state };
    if (operation.isValuePrivate != null) {
        result.isValuePrivate = operation.isValuePrivate.newValue;
    }
    if (operation.value != null) {
        const valueResult = TextOperation.apply(state.value, operation.value);
        if (valueResult.isError) {
            return valueResult;
        }
        result.value = valueResult.value;
    }
    return ResultModule.ok(result);
};

export const createTransformerFactory = (createdByMe: boolean): ParamRecordTransformerFactory<string, State, State, DownOperation, UpOperation, TwoWayOperation, ApplyError<PositiveInt> | ComposeAndTransformError> => ({
    composeLoose: ({ first, second }) => {
        const value = TextOperation.composeDownOperation(first.value, second.value);
        if (value.isError) {
            return value;
        }
        const valueProps: DownOperation = {
            isValuePrivate: ReplaceOperation.composeDownOperation(first.isValuePrivate, second.isValuePrivate),
            value: value.value,
        };
        return ResultModule.ok(valueProps);
    },
    restore: ({ nextState, downOperation }) => {
        if (downOperation === undefined) {
            return ResultModule.ok({ prevState: nextState, nextState, twoWayOperation: undefined });
        }

        const prevState: State = { ...nextState };
        const twoWayOperation: TwoWayOperation = {};

        if (downOperation.isValuePrivate !== undefined) {
            prevState.isValuePrivate = downOperation.isValuePrivate.oldValue;
            twoWayOperation.isValuePrivate = { ...downOperation.isValuePrivate, newValue: nextState.isValuePrivate };
        }
        if (downOperation.value !== undefined) {
            const restored = TextOperation.restore({ nextState: nextState.value, downOperation: downOperation.value });
            if (restored.isError) {
                return restored;
            }
            prevState.value = restored.value.prevState;
            twoWayOperation.value = restored.value.twoWayOperation;
        }

        return ResultModule.ok({ prevState, nextState, twoWayOperation });
    },
    transform: ({ prevState, currentState, clientOperation, serverOperation }) => {
        const twoWayOperation: TwoWayOperation = {};

        if (createdByMe) {
            twoWayOperation.isValuePrivate = ReplaceOperation.transform({
                first: serverOperation?.isValuePrivate,
                second: clientOperation.isValuePrivate,
                prevState: prevState.isValuePrivate,
            });
        }
        if (createdByMe || !currentState.isValuePrivate) {
            const transformed = TextOperation.transform({ first: serverOperation?.value, second: clientOperation.value, prevState: prevState.value });
            if (transformed.isError) {
                return transformed;
            }
            twoWayOperation.value = transformed.value.secondPrime;
        }

        if (undefinedForAll(twoWayOperation)) {
            return ResultModule.ok(undefined);
        }

        return ResultModule.ok(twoWayOperation);
    },
    diff: ({ prevState, nextState }) => {
        const resultType: TwoWayOperation = {};
        if (prevState.isValuePrivate !== nextState.isValuePrivate) {
            resultType.isValuePrivate = { oldValue: prevState.isValuePrivate, newValue: nextState.isValuePrivate };
        }
        if (prevState.value !== nextState.value) {
            resultType.value = TextOperation.diff({ prev: prevState.value, next: nextState.value });
        }
        if (undefinedForAll(resultType)) {
            return undefined;
        }
        return { ...resultType };
    },
    applyBack: ({ downOperation, nextState }) => {
        const result = { ...nextState };

        if (downOperation.isValuePrivate !== undefined) {
            result.isValuePrivate = downOperation.isValuePrivate.oldValue;
        }
        if (downOperation.value !== undefined) {
            const prevValue = TextOperation.applyBack(nextState.value, downOperation.value);
            if (prevValue.isError) {
                return prevValue;
            }
            result.value = prevValue.value;
        }

        return ResultModule.ok(result);
    },
    toServerState: ({ clientState }) => clientState,
    createDefaultState: () => ({ isValuePrivate: false, value: '' }),
});