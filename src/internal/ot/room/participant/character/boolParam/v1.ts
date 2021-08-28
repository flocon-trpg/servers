import * as t from 'io-ts';
import * as ReplaceOperation from '../../../../util/replaceOperation';
import { createOperation } from '../../../../util/createOperation';
import { Maybe, maybe } from '../../../../../maybe';

export const state = t.type({
    $v: t.literal(1),

    isValuePrivate: t.boolean,
    value: maybe(t.boolean),
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(1, {
    isValuePrivate: t.type({ oldValue: t.boolean }),
    value: t.type({ oldValue: maybe(t.boolean) }),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(1, {
    isValuePrivate: t.type({ newValue: t.boolean }),
    value: t.type({ newValue: maybe(t.boolean) }),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 1;

    isValuePrivate?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    value?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<boolean>>;
};
