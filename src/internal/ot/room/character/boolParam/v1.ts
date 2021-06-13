import * as t from 'io-ts';
import * as ReplaceOperation from '../../../util/replaceOperation';
import { createOperation } from '../../../util/createOperation';
import { maybe, Maybe } from '@kizahasi/util';

export const state = t.type({
    $version: t.literal(1),

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
    $version: 1;

    isValuePrivate?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    value?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<boolean>>;
};
