import * as t from 'io-ts';
import * as TextOperation from '../../../../util/textOperation';
import * as ReplaceOperation from '../../../../util/replaceOperation';
import { createOperation } from '../../../../util/createOperation';

export const state = t.type({
    $r: t.literal(1),

    isValuePrivate: t.boolean,
    value: t.string,
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(1, 1, {
    isValuePrivate: t.type({ oldValue: t.boolean }),
    value: TextOperation.downOperation,
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(1, 1, {
    isValuePrivate: t.type({ newValue: t.boolean }),
    value: TextOperation.upOperation,
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 1;
    $r: 1;

    isValuePrivate?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    value?: TextOperation.TwoWayOperation;
};
