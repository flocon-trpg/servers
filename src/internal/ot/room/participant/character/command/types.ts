import * as t from 'io-ts';
import * as TextOperation from '../../../../util/textOperation';
import { createOperation } from '../../../../util/createOperation';
import * as ReplaceOperation from '../../../../util/replaceOperation';

export const state = t.type({
    $v: t.literal(1),

    name: t.string,
    value: t.string,
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(1, {
    name: t.type({ oldValue: t.string }),
    value: TextOperation.downOperation,
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(1, {
    name: t.type({ newValue: t.string }),
    value: TextOperation.upOperation,
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 1;

    name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    value?: TextOperation.TwoWayOperation;
};
