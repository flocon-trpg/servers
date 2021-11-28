import * as t from 'io-ts';
import { filePath } from '../../filePath/types';
import * as ReplaceOperation from '../../util/replaceOperation';
import * as TextOperation from '../../util/textOperation';
import { createOperation } from '../../util/createOperation';
import { Maybe, maybe } from '../../../maybe';

const numberDownOperation = t.type({ oldValue: t.number });
const numberUpOperation = t.type({ newValue: t.number });

export const state = t.type({
    $v: t.literal(2),
    $r: t.literal(1),

    backgroundImage: maybe(filePath),
    backgroundImageZoom: t.number,
    cellColumnCount: t.number,
    cellHeight: t.number,
    cellOffsetX: t.number,
    cellOffsetY: t.number,
    cellRowCount: t.number,
    cellWidth: t.number,
    name: t.string,
    ownerParticipantId: maybe(t.string),
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(2, 1, {
    backgroundImage: t.type({ oldValue: maybe(filePath) }),
    backgroundImageZoom: numberDownOperation,
    cellColumnCount: numberDownOperation,
    cellHeight: numberDownOperation,
    cellOffsetX: numberDownOperation,
    cellOffsetY: numberDownOperation,
    cellRowCount: numberDownOperation,
    cellWidth: numberDownOperation,
    name: TextOperation.downOperation,
    ownerParticipantId: t.type({ oldValue: maybe(t.string) }),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(2, 1, {
    backgroundImage: t.type({ newValue: maybe(filePath) }),
    backgroundImageZoom: numberUpOperation,
    cellColumnCount: numberUpOperation,
    cellHeight: numberUpOperation,
    cellOffsetX: numberUpOperation,
    cellOffsetY: numberUpOperation,
    cellRowCount: numberUpOperation,
    cellWidth: numberUpOperation,
    name: TextOperation.upOperation,
    ownerParticipantId: t.type({ newValue: maybe(t.string) }),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 2;
    $r: 1;

    backgroundImage?: ReplaceOperation.ReplaceValueTwoWayOperation<
        t.TypeOf<typeof filePath> | undefined
    >;
    backgroundImageZoom?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellColumnCount?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellHeight?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellOffsetX?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellOffsetY?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellRowCount?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellWidth?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    name?: TextOperation.TwoWayOperation;
    ownerParticipantId?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<string>>;
};
