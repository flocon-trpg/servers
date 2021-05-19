import * as t from 'io-ts';
import { ResultModule } from '../../../../Result';
import { maybe } from '../../../../io-ts';
import * as ReplaceValueOperation from '../../util/replaceOperation';
import { filePath } from '../../../filePath/v1';
import { TransformerFactory } from '../../util/transformerFactory';
import { Apply, ToClientOperationParams } from '../../util/type';
import { operation } from '../../util/operation';
import { isIdRecord } from '../../util/record';

const stringDownOperation = t.type({ oldValue: t.string });
const stringUpOperation = t.type({ newValue: t.string });
const numberDownOperation = t.type({ oldValue: t.number });
const numberUpOperation = t.type({ newValue: t.number });

export const state = t.type({
    $version: t.literal(1),

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

export const downOperation = operation(1, {
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

export const upOperation = operation(1, {
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
    $version: 1;

    backgroundImage?: ReplaceValueOperation.ReplaceValueTwoWayOperation<t.TypeOf<typeof filePath> | null | undefined>;
    backgroundImageZoom?: ReplaceValueOperation.ReplaceValueTwoWayOperation<number>;
    cellColumnCount?: ReplaceValueOperation.ReplaceValueTwoWayOperation<number>;
    cellHeight?: ReplaceValueOperation.ReplaceValueTwoWayOperation<number>;
    cellOffsetX?: ReplaceValueOperation.ReplaceValueTwoWayOperation<number>;
    cellOffsetY?: ReplaceValueOperation.ReplaceValueTwoWayOperation<number>;
    cellRowCount?: ReplaceValueOperation.ReplaceValueTwoWayOperation<number>;
    cellWidth?: ReplaceValueOperation.ReplaceValueTwoWayOperation<number>;
    name?: ReplaceValueOperation.ReplaceValueTwoWayOperation<string>;
}

export const toClientState = (source: State): State => source;

export const toServerOperation = (source: TwoWayOperation): DownOperation => {
    return source;
};

export const toClientOperation = ({ diff }: ToClientOperationParams<State, TwoWayOperation>): UpOperation => {
    return diff;
};

export const apply: Apply<State, UpOperation | TwoWayOperation> = ({ state, operation }) => {
    const result: State = { ...state };
    if (operation.backgroundImage != null) {
        result.backgroundImage = operation.backgroundImage.newValue;
    }
    if (operation.backgroundImageZoom != null) {
        result.backgroundImageZoom = operation.backgroundImageZoom.newValue;
    }
    if (operation.cellColumnCount != null) {
        result.cellColumnCount = operation.cellColumnCount.newValue;
    }
    if (operation.cellHeight != null) {
        result.cellHeight = operation.cellHeight.newValue;
    }
    if (operation.cellOffsetX != null) {
        result.cellOffsetX = operation.cellOffsetX.newValue;
    }
    if (operation.cellOffsetY != null) {
        result.cellOffsetY = operation.cellOffsetY.newValue;
    }
    if (operation.cellRowCount != null) {
        result.cellRowCount = operation.cellRowCount.newValue;
    }
    if (operation.cellWidth != null) {
        result.cellWidth = operation.cellWidth.newValue;
    }
    if (operation.name != null) {
        result.name = operation.name.newValue;
    }
    return ResultModule.ok(result);
};

export const transformerFactory: TransformerFactory<string, State, State, DownOperation, UpOperation, TwoWayOperation> = ({
    composeLoose: ({ first, second }) => {
        const valueProps: DownOperation = {
            $version: 1,

            backgroundImage: ReplaceValueOperation.composeDownOperation(first.backgroundImage, second.backgroundImage),
            backgroundImageZoom: ReplaceValueOperation.composeDownOperation(first.backgroundImageZoom, second.backgroundImageZoom),
            cellColumnCount: ReplaceValueOperation.composeDownOperation(first.cellColumnCount, second.cellColumnCount),
            cellHeight: ReplaceValueOperation.composeDownOperation(first.cellHeight, second.cellHeight),
            cellOffsetX: ReplaceValueOperation.composeDownOperation(first.cellOffsetX, second.cellOffsetX),
            cellOffsetY: ReplaceValueOperation.composeDownOperation(first.cellOffsetY, second.cellOffsetY),
            cellRowCount: ReplaceValueOperation.composeDownOperation(first.cellRowCount, second.cellRowCount),
            cellWidth: ReplaceValueOperation.composeDownOperation(first.cellWidth, second.cellWidth),
            name: ReplaceValueOperation.composeDownOperation(first.name, second.name),
        };
        return ResultModule.ok(valueProps);
    },
    restore: ({ nextState, downOperation }) => {
        if (downOperation === undefined) {
            return ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
        }

        const prevState: State = {
            ...nextState,
        };
        const twoWayOperation: TwoWayOperation = { $version: 1 };

        if (downOperation.backgroundImage !== undefined) {
            prevState.backgroundImage = downOperation.backgroundImage.oldValue ?? undefined;
            twoWayOperation.backgroundImage = { oldValue: downOperation.backgroundImage.oldValue ?? undefined, newValue: nextState.backgroundImage ?? undefined };
        }
        if (downOperation.backgroundImageZoom !== undefined) {
            prevState.backgroundImageZoom = downOperation.backgroundImageZoom.oldValue;
            twoWayOperation.backgroundImageZoom = { ...downOperation.backgroundImageZoom, newValue: nextState.backgroundImageZoom };
        }
        if (downOperation.cellColumnCount !== undefined) {
            prevState.cellColumnCount = downOperation.cellColumnCount.oldValue;
            twoWayOperation.cellColumnCount = { ...downOperation.cellColumnCount, newValue: nextState.cellColumnCount };
        }
        if (downOperation.cellHeight !== undefined) {
            prevState.cellHeight = downOperation.cellHeight.oldValue;
            twoWayOperation.cellHeight = { ...downOperation.cellHeight, newValue: nextState.cellHeight };
        }
        if (downOperation.cellOffsetX !== undefined) {
            prevState.cellOffsetX = downOperation.cellOffsetX.oldValue;
            twoWayOperation.cellOffsetX = { ...downOperation.cellOffsetX, newValue: nextState.cellOffsetX };
        }
        if (downOperation.cellOffsetY !== undefined) {
            prevState.cellOffsetY = downOperation.cellOffsetY.oldValue;
            twoWayOperation.cellOffsetY = { ...downOperation.cellOffsetY, newValue: nextState.cellOffsetY };
        }
        if (downOperation.cellRowCount !== undefined) {
            prevState.cellRowCount = downOperation.cellRowCount.oldValue;
            twoWayOperation.cellRowCount = { ...downOperation.cellRowCount, newValue: nextState.cellRowCount };
        }
        if (downOperation.cellWidth !== undefined) {
            prevState.cellWidth = downOperation.cellWidth.oldValue;
            twoWayOperation.cellWidth = { ...downOperation.cellWidth, newValue: nextState.cellWidth };
        }
        if (downOperation.name !== undefined) {
            prevState.name = downOperation.name.oldValue;
            twoWayOperation.name = { ...downOperation.name, newValue: nextState.name };
        }

        return ResultModule.ok({ prevState, twoWayOperation });
    },
    transform: ({ prevState, clientOperation, serverOperation }) => {
        const twoWayOperation: TwoWayOperation = { $version: 1 };

        twoWayOperation.backgroundImage = ReplaceValueOperation.transform({
            first: serverOperation?.backgroundImage,
            second: clientOperation.backgroundImage,
            prevState: prevState.backgroundImage,
        });
        twoWayOperation.backgroundImageZoom = ReplaceValueOperation.transform({
            first: serverOperation?.backgroundImageZoom,
            second: clientOperation.backgroundImageZoom,
            prevState: prevState.backgroundImageZoom,
        });

        twoWayOperation.cellColumnCount = ReplaceValueOperation.transform({
            first: serverOperation?.cellColumnCount,
            second: clientOperation.cellColumnCount,
            prevState: prevState.cellColumnCount,
        });
        twoWayOperation.cellHeight = ReplaceValueOperation.transform({
            first: serverOperation?.cellHeight,
            second: clientOperation.cellHeight,
            prevState: prevState.cellHeight,
        });
        twoWayOperation.cellOffsetX = ReplaceValueOperation.transform({
            first: serverOperation?.cellOffsetX,
            second: clientOperation.cellOffsetX,
            prevState: prevState.cellOffsetX,
        });
        twoWayOperation.cellOffsetY = ReplaceValueOperation.transform({
            first: serverOperation?.cellOffsetY,
            second: clientOperation.cellOffsetY,
            prevState: prevState.cellOffsetY,
        });
        twoWayOperation.cellRowCount = ReplaceValueOperation.transform({
            first: serverOperation?.cellRowCount,
            second: clientOperation.cellRowCount,
            prevState: prevState.cellRowCount,
        });
        twoWayOperation.cellWidth = ReplaceValueOperation.transform({
            first: serverOperation?.cellWidth,
            second: clientOperation.cellWidth,
            prevState: prevState.cellWidth,
        });
        twoWayOperation.name = ReplaceValueOperation.transform({
            first: serverOperation?.name,
            second: clientOperation.name,
            prevState: prevState.name,
        });

        if (isIdRecord(twoWayOperation)) {
            return ResultModule.ok(undefined);
        }

        return ResultModule.ok(twoWayOperation);
    },
    diff: ({ prevState, nextState }) => {
        const resultType: TwoWayOperation = { $version: 1 };
        if (prevState.backgroundImage !== nextState.backgroundImage) {
            resultType.backgroundImage = { oldValue: prevState.backgroundImage, newValue: nextState.backgroundImage };
        }
        if (prevState.backgroundImageZoom !== nextState.backgroundImageZoom) {
            resultType.backgroundImageZoom = { oldValue: prevState.backgroundImageZoom, newValue: nextState.backgroundImageZoom };
        }
        if (prevState.cellColumnCount !== nextState.cellColumnCount) {
            resultType.cellColumnCount = { oldValue: prevState.cellColumnCount, newValue: nextState.cellColumnCount };
        }
        if (prevState.cellHeight !== nextState.cellHeight) {
            resultType.cellHeight = { oldValue: prevState.cellHeight, newValue: nextState.cellHeight };
        }
        if (prevState.cellOffsetX !== nextState.cellOffsetX) {
            resultType.cellOffsetX = { oldValue: prevState.cellOffsetX, newValue: nextState.cellOffsetX };
        }
        if (prevState.cellOffsetY !== nextState.cellOffsetY) {
            resultType.cellOffsetY = { oldValue: prevState.cellOffsetY, newValue: nextState.cellOffsetY };
        }
        if (prevState.cellRowCount !== nextState.cellRowCount) {
            resultType.cellRowCount = { oldValue: prevState.cellRowCount, newValue: nextState.cellRowCount };
        }
        if (prevState.cellWidth !== nextState.cellWidth) {
            resultType.cellWidth = { oldValue: prevState.cellWidth, newValue: nextState.cellWidth };
        }
        if (prevState.name !== nextState.name) {
            resultType.name = { oldValue: prevState.name, newValue: nextState.name };
        }
        if (isIdRecord(resultType)) {
            return undefined;
        }
        return resultType;
    },
    applyBack: ({ downOperation, nextState }) => {
        const result: State = {
            ...nextState,
        };

        if (downOperation.backgroundImage !== undefined) {
            result.backgroundImage = downOperation.backgroundImage.oldValue ?? undefined;
        }
        if (downOperation.backgroundImageZoom !== undefined) {
            result.backgroundImageZoom = downOperation.backgroundImageZoom.oldValue ?? undefined;
        }
        if (downOperation.cellColumnCount !== undefined) {
            result.cellColumnCount = downOperation.cellColumnCount.oldValue ?? undefined;
        }
        if (downOperation.cellHeight !== undefined) {
            result.cellHeight = downOperation.cellHeight.oldValue ?? undefined;
        }
        if (downOperation.cellOffsetX !== undefined) {
            result.cellOffsetX = downOperation.cellOffsetX.oldValue ?? undefined;
        }
        if (downOperation.cellOffsetY !== undefined) {
            result.cellOffsetY = downOperation.cellOffsetY.oldValue ?? undefined;
        }
        if (downOperation.cellRowCount !== undefined) {
            result.cellRowCount = downOperation.cellRowCount.oldValue ?? undefined;
        }
        if (downOperation.cellWidth !== undefined) {
            result.cellWidth = downOperation.cellWidth.oldValue ?? undefined;
        }
        if (downOperation.name !== undefined) {
            result.name = downOperation.name.oldValue;
        }

        return ResultModule.ok(result);
    },
    toServerState: ({ clientState }) => clientState,
    protectedValuePolicy: {
    }
});