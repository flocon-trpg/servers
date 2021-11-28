import * as t from 'io-ts';
import * as TextOperation from '../../../util/textOperation';
import * as NullableTextOperation from '../../../util/nullableTextOperation';
import * as ReplaceOperation from '../../../util/replaceOperation';
import { createOperation } from '../../../util/createOperation';
import { maybe } from '../../../../maybe';

export const state = t.type({
    $v: t.literal(2),
    $r: t.literal(1),

    isValuePrivate: t.boolean,
    value: t.string,
    overriddenParameterName: maybe(t.string),
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(2, 1, {
    isValuePrivate: t.type({ oldValue: t.boolean }),
    value: TextOperation.downOperation,
    overriddenParameterName: NullableTextOperation.downOperation,
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(2, 1, {
    isValuePrivate: t.type({ newValue: t.boolean }),
    value: TextOperation.upOperation,
    overriddenParameterName: NullableTextOperation.upOperation,
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 2;
    $r: 1;

    isValuePrivate?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    value?: TextOperation.TwoWayOperation;
    overriddenParameterName?: NullableTextOperation.TwoWayOperation;
};
