import * as t from 'io-ts';
import { Maybe, maybe } from '../../../../../io-ts';
import { createParamTransformerFactory } from '../../../util/paramRecordOperation';
import { Apply, ToClientOperationParams } from '../../../util/type';
import * as ReplaceOperation from '../../../util/replaceOperation';
import { ResultModule } from '../../../../../Result';
import { operation } from '../../../util/operation';

export const state = t.type({
    $version: t.literal(1),

    isValuePrivate: t.boolean,
    value: maybe(t.boolean),
});

export type State = t.TypeOf<typeof state>;

export const downOperation = operation(1, {
    isValuePrivate: t.type({ oldValue: t.boolean }),
    value: t.type({ oldValue: maybe(t.boolean) }),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = operation(1, {
    isValuePrivate: t.type({ newValue: t.boolean }),
    value: t.type({ newValue: maybe(t.boolean) }),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $version: 1;

    isValuePrivate?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    value?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<boolean>>;
}

export const toClientState = (createdByMe: boolean) => (source: State): State => {
    return {
        ...source,
        value: source.isValuePrivate && !createdByMe ? undefined : source.value,
    };
};

export const toServerOperation = (source: TwoWayOperation): DownOperation => {
    return source;
};

export const toClientOperation = (createdByMe: boolean) => ({ prevState, nextState, diff }: ToClientOperationParams<State, TwoWayOperation>): UpOperation => {
    return {
        ...diff,
        value: ReplaceOperation.toPrivateClientOperation({
            oldValue: {
                value: prevState.value,
                isValuePrivate: prevState.isValuePrivate,
            },
            newValue: {
                value: nextState.value,
                isValuePrivate: nextState.isValuePrivate,
            },
            defaultState: undefined,
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
        result.value = operation.value.newValue;
    }
    return ResultModule.ok(result);
};

export const createTransformerFactory = (createdByMe: boolean) => createParamTransformerFactory<boolean>(createdByMe);