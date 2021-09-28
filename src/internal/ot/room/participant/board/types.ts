import * as t from 'io-ts';
import { filePath } from '../../../filePath/types';
import * as ReplaceOperation from '../../../util/replaceOperation';
import { createOperation } from '../../../util/createOperation';
import { maybe } from '../../../../maybe';

const stringDownOperation = t.type({ oldValue: t.string });
const stringUpOperation = t.type({ newValue: t.string });
const numberDownOperation = t.type({ oldValue: t.number });
const numberUpOperation = t.type({ newValue: t.number });

export const state = t.type({
    $v: t.literal(1),

    backgroundImage: maybe(filePath),
    backgroundImageZoom: t.number,
    cellColumnCount: t.number,
    cellHeight: t.number,
    cellOffsetX: t.number,
    cellOffsetY: t.number,
    cellRowCount: t.number,
    cellWidth: t.number,
    name: t.string,
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(1, {
    backgroundImage: t.type({ oldValue: maybe(filePath) }),
    backgroundImageZoom: numberDownOperation,
    cellColumnCount: numberDownOperation,
    cellHeight: numberDownOperation,
    cellOffsetX: numberDownOperation,
    cellOffsetY: numberDownOperation,
    cellRowCount: numberDownOperation,
    cellWidth: numberDownOperation,
    name: stringDownOperation,
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(1, {
    backgroundImage: t.type({ newValue: maybe(filePath) }),
    backgroundImageZoom: numberUpOperation,
    cellColumnCount: numberUpOperation,
    cellHeight: numberUpOperation,
    cellOffsetX: numberUpOperation,
    cellOffsetY: numberUpOperation,
    cellRowCount: numberUpOperation,
    cellWidth: numberUpOperation,
    name: stringUpOperation,
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 1;

    backgroundImage?: ReplaceOperation.ReplaceValueTwoWayOperation<
        t.TypeOf<typeof filePath> | null | undefined
    >;
    backgroundImageZoom?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellColumnCount?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellHeight?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellOffsetX?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellOffsetY?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellRowCount?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    cellWidth?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
    name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
};
