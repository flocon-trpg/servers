import * as t from 'io-ts';
import * as ReplaceOperation from '../../../util/replaceOperation';
import { createOperation } from '../../../util/createOperation';
import { Maybe, maybe } from '../../../../maybe';
import * as NullableTextOperation from '../../../util/nullableTextOperation';

export const state = t.type({
    $v: t.literal(2),
    $r: t.literal(1),

    isValuePrivate: t.boolean,
    value: maybe(t.number),
    overriddenParameterName: maybe(t.string),
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(2, 1, {
    isValuePrivate: t.type({ oldValue: t.boolean }),
    value: t.type({ oldValue: maybe(t.number) }),
    overriddenParameterName: NullableTextOperation.downOperation,
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(2, 1, {
    isValuePrivate: t.type({ newValue: t.boolean }),
    value: t.type({ newValue: maybe(t.number) }),
    overriddenParameterName: NullableTextOperation.upOperation,
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 2;
    $r: 1;

    isValuePrivate?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    value?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<number>>;
    overriddenParameterName?: NullableTextOperation.TwoWayOperation;
};
