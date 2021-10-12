import * as t from 'io-ts';
import * as ReplaceOperation from '../../util/replaceOperation';
import { filePath } from '../../filePath/types';
import { createOperation } from '../../util/createOperation';

export const state = t.type({
    $v: t.literal(1),
    $r: t.literal(1),

    isPaused: t.boolean,
    files: t.array(filePath),
    volume: t.number,
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(1, 1, {
    isPaused: t.type({ oldValue: t.boolean }),
    files: t.type({ oldValue: t.array(filePath) }),
    volume: t.type({ oldValue: t.number }),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(1, 1, {
    isPaused: t.type({ newValue: t.boolean }),
    files: t.type({ newValue: t.array(filePath) }),
    volume: t.type({ newValue: t.number }),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 1;
    $r: 1;

    isPaused?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    files?: ReplaceOperation.ReplaceValueTwoWayOperation<t.TypeOf<typeof filePath>[]>;
    volume?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
};
