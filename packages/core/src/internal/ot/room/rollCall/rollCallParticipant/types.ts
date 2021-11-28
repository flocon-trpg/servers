import * as t from 'io-ts';
import { Maybe, maybe } from '../../../../maybe';
import { createOperation } from '../../../util/createOperation';
import * as ReplaceOperation from '../../../util/replaceOperation';

export const state = t.type({
    $v: t.literal(1),
    $r: t.literal(1),

    answeredAt: maybe(t.number),
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(1, 1, {
    answeredAt: t.type({ oldValue: maybe(t.number) }),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(1, 1, {
    answeredAt: t.type({ newValue: maybe(t.number) }),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 1;
    $r: 1;

    answeredAt?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<number>>;
};
