import * as t from 'io-ts';
import { filePath } from '../../../filePath/v1';
import * as ReplaceOperation from '../../../util/replaceOperation';
import {
    Apply,
    ClientTransform,
    Compose,
    Diff,
    RequestedBy,
    Restore,
    ServerTransform,
} from '../../../util/type';
import { createOperation } from '../../../util/createOperation';
import { isIdRecord } from '../../../util/record';
import { Result } from '@kizahasi/result';
import { maybe } from '../../../../maybe';

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
    $version: 1;

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

export const toClientState = (source: State): State => {
    return source;
};

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return source;
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return source;
};

export const apply: Apply<State, UpOperation> = ({ state, operation }) => {
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

    return Result.ok(result);
};

export const applyBack: Apply<State, DownOperation> = ({ state, operation }) => {
    const result: State = {
        ...state,
    };

    if (operation.backgroundImage !== undefined) {
        result.backgroundImage = operation.backgroundImage.oldValue ?? undefined;
    }
    if (operation.backgroundImageZoom !== undefined) {
        result.backgroundImageZoom = operation.backgroundImageZoom.oldValue ?? undefined;
    }
    if (operation.cellColumnCount !== undefined) {
        result.cellColumnCount = operation.cellColumnCount.oldValue ?? undefined;
    }
    if (operation.cellHeight !== undefined) {
        result.cellHeight = operation.cellHeight.oldValue ?? undefined;
    }
    if (operation.cellOffsetX !== undefined) {
        result.cellOffsetX = operation.cellOffsetX.oldValue ?? undefined;
    }
    if (operation.cellOffsetY !== undefined) {
        result.cellOffsetY = operation.cellOffsetY.oldValue ?? undefined;
    }
    if (operation.cellRowCount !== undefined) {
        result.cellRowCount = operation.cellRowCount.oldValue ?? undefined;
    }
    if (operation.cellWidth !== undefined) {
        result.cellWidth = operation.cellWidth.oldValue ?? undefined;
    }
    if (operation.name !== undefined) {
        result.name = operation.name.oldValue;
    }

    return Result.ok(result);
};

export const composeDownOperation: Compose<DownOperation> = ({ first, second }) => {
    const valueProps: DownOperation = {
        $version: 1,

        backgroundImage: ReplaceOperation.composeDownOperation(
            first.backgroundImage,
            second.backgroundImage
        ),
        backgroundImageZoom: ReplaceOperation.composeDownOperation(
            first.backgroundImageZoom,
            second.backgroundImageZoom
        ),
        cellColumnCount: ReplaceOperation.composeDownOperation(
            first.cellColumnCount,
            second.cellColumnCount
        ),
        cellHeight: ReplaceOperation.composeDownOperation(first.cellHeight, second.cellHeight),
        cellOffsetX: ReplaceOperation.composeDownOperation(first.cellOffsetX, second.cellOffsetX),
        cellOffsetY: ReplaceOperation.composeDownOperation(first.cellOffsetY, second.cellOffsetY),
        cellRowCount: ReplaceOperation.composeDownOperation(
            first.cellRowCount,
            second.cellRowCount
        ),
        cellWidth: ReplaceOperation.composeDownOperation(first.cellWidth, second.cellWidth),
        name: ReplaceOperation.composeDownOperation(first.name, second.name),
    };
    return Result.ok(valueProps);
};

export const restore: Restore<State, DownOperation, TwoWayOperation> = ({
    nextState,
    downOperation,
}) => {
    if (downOperation === undefined) {
        return Result.ok({ prevState: nextState, twoWayOperation: undefined });
    }

    const prevState: State = {
        ...nextState,
    };
    const twoWayOperation: TwoWayOperation = {
        $version: 1,
    };

    if (downOperation.backgroundImage !== undefined) {
        prevState.backgroundImage = downOperation.backgroundImage.oldValue ?? undefined;
        twoWayOperation.backgroundImage = {
            oldValue: downOperation.backgroundImage.oldValue ?? undefined,
            newValue: nextState.backgroundImage ?? undefined,
        };
    }
    if (downOperation.backgroundImageZoom !== undefined) {
        prevState.backgroundImageZoom = downOperation.backgroundImageZoom.oldValue;
        twoWayOperation.backgroundImageZoom = {
            ...downOperation.backgroundImageZoom,
            newValue: nextState.backgroundImageZoom,
        };
    }
    if (downOperation.cellColumnCount !== undefined) {
        prevState.cellColumnCount = downOperation.cellColumnCount.oldValue;
        twoWayOperation.cellColumnCount = {
            ...downOperation.cellColumnCount,
            newValue: nextState.cellColumnCount,
        };
    }
    if (downOperation.cellHeight !== undefined) {
        prevState.cellHeight = downOperation.cellHeight.oldValue;
        twoWayOperation.cellHeight = {
            ...downOperation.cellHeight,
            newValue: nextState.cellHeight,
        };
    }
    if (downOperation.cellOffsetX !== undefined) {
        prevState.cellOffsetX = downOperation.cellOffsetX.oldValue;
        twoWayOperation.cellOffsetX = {
            ...downOperation.cellOffsetX,
            newValue: nextState.cellOffsetX,
        };
    }
    if (downOperation.cellOffsetY !== undefined) {
        prevState.cellOffsetY = downOperation.cellOffsetY.oldValue;
        twoWayOperation.cellOffsetY = {
            ...downOperation.cellOffsetY,
            newValue: nextState.cellOffsetY,
        };
    }
    if (downOperation.cellRowCount !== undefined) {
        prevState.cellRowCount = downOperation.cellRowCount.oldValue;
        twoWayOperation.cellRowCount = {
            ...downOperation.cellRowCount,
            newValue: nextState.cellRowCount,
        };
    }
    if (downOperation.cellWidth !== undefined) {
        prevState.cellWidth = downOperation.cellWidth.oldValue;
        twoWayOperation.cellWidth = {
            ...downOperation.cellWidth,
            newValue: nextState.cellWidth,
        };
    }
    if (downOperation.name !== undefined) {
        prevState.name = downOperation.name.oldValue;
        twoWayOperation.name = {
            ...downOperation.name,
            newValue: nextState.name,
        };
    }

    return Result.ok({ prevState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const resultType: TwoWayOperation = { $version: 1 };
    if (prevState.backgroundImage !== nextState.backgroundImage) {
        resultType.backgroundImage = {
            oldValue: prevState.backgroundImage,
            newValue: nextState.backgroundImage,
        };
    }
    if (prevState.backgroundImageZoom !== nextState.backgroundImageZoom) {
        resultType.backgroundImageZoom = {
            oldValue: prevState.backgroundImageZoom,
            newValue: nextState.backgroundImageZoom,
        };
    }
    if (prevState.cellColumnCount !== nextState.cellColumnCount) {
        resultType.cellColumnCount = {
            oldValue: prevState.cellColumnCount,
            newValue: nextState.cellColumnCount,
        };
    }
    if (prevState.cellHeight !== nextState.cellHeight) {
        resultType.cellHeight = {
            oldValue: prevState.cellHeight,
            newValue: nextState.cellHeight,
        };
    }
    if (prevState.cellOffsetX !== nextState.cellOffsetX) {
        resultType.cellOffsetX = {
            oldValue: prevState.cellOffsetX,
            newValue: nextState.cellOffsetX,
        };
    }
    if (prevState.cellOffsetY !== nextState.cellOffsetY) {
        resultType.cellOffsetY = {
            oldValue: prevState.cellOffsetY,
            newValue: nextState.cellOffsetY,
        };
    }
    if (prevState.cellRowCount !== nextState.cellRowCount) {
        resultType.cellRowCount = {
            oldValue: prevState.cellRowCount,
            newValue: nextState.cellRowCount,
        };
    }
    if (prevState.cellWidth !== nextState.cellWidth) {
        resultType.cellWidth = {
            oldValue: prevState.cellWidth,
            newValue: nextState.cellWidth,
        };
    }
    if (prevState.name !== nextState.name) {
        resultType.name = {
            oldValue: prevState.name,
            newValue: nextState.name,
        };
    }
    if (isIdRecord(resultType)) {
        return undefined;
    }
    return resultType;
};

export const serverTransform =
    (requestedBy: RequestedBy): ServerTransform<State, TwoWayOperation, UpOperation> =>
    ({ prevState, currentState, clientOperation, serverOperation }) => {
        const twoWayOperation: TwoWayOperation = { $version: 1 };

        twoWayOperation.backgroundImage = ReplaceOperation.serverTransform({
            first: serverOperation?.backgroundImage,
            second: clientOperation.backgroundImage,
            prevState: prevState.backgroundImage,
        });
        twoWayOperation.backgroundImageZoom = ReplaceOperation.serverTransform({
            first: serverOperation?.backgroundImageZoom,
            second: clientOperation.backgroundImageZoom,
            prevState: prevState.backgroundImageZoom,
        });
        twoWayOperation.cellColumnCount = ReplaceOperation.serverTransform({
            first: serverOperation?.cellColumnCount,
            second: clientOperation.cellColumnCount,
            prevState: prevState.cellColumnCount,
        });
        twoWayOperation.cellHeight = ReplaceOperation.serverTransform({
            first: serverOperation?.cellHeight,
            second: clientOperation.cellHeight,
            prevState: prevState.cellHeight,
        });
        twoWayOperation.cellOffsetX = ReplaceOperation.serverTransform({
            first: serverOperation?.cellOffsetX,
            second: clientOperation.cellOffsetX,
            prevState: prevState.cellOffsetX,
        });
        twoWayOperation.cellOffsetY = ReplaceOperation.serverTransform({
            first: serverOperation?.cellOffsetY,
            second: clientOperation.cellOffsetY,
            prevState: prevState.cellOffsetY,
        });
        twoWayOperation.cellRowCount = ReplaceOperation.serverTransform({
            first: serverOperation?.cellRowCount,
            second: clientOperation.cellRowCount,
            prevState: prevState.cellRowCount,
        });
        twoWayOperation.cellWidth = ReplaceOperation.serverTransform({
            first: serverOperation?.cellWidth,
            second: clientOperation.cellWidth,
            prevState: prevState.cellWidth,
        });
        twoWayOperation.name = ReplaceOperation.serverTransform({
            first: serverOperation?.name,
            second: clientOperation.name,
            prevState: prevState.name,
        });

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
    const backgroundImage = ReplaceOperation.clientTransform({
        first: first.backgroundImage,
        second: second.backgroundImage,
    });
    const backgroundImageZoom = ReplaceOperation.clientTransform({
        first: first.backgroundImageZoom,
        second: second.backgroundImageZoom,
    });
    const cellColumnCount = ReplaceOperation.clientTransform({
        first: first.cellColumnCount,
        second: second.cellColumnCount,
    });
    const cellHeight = ReplaceOperation.clientTransform({
        first: first.cellHeight,
        second: second.cellHeight,
    });
    const cellOffsetX = ReplaceOperation.clientTransform({
        first: first.cellOffsetX,
        second: second.cellOffsetX,
    });
    const cellOffsetY = ReplaceOperation.clientTransform({
        first: first.cellOffsetY,
        second: second.cellOffsetY,
    });
    const cellRowCount = ReplaceOperation.clientTransform({
        first: first.cellRowCount,
        second: second.cellRowCount,
    });
    const cellWidth = ReplaceOperation.clientTransform({
        first: first.cellWidth,
        second: second.cellWidth,
    });
    const name = ReplaceOperation.clientTransform({
        first: first.name,
        second: second.name,
    });

    const firstPrime: UpOperation = {
        $version: 1,
        backgroundImage: backgroundImage.firstPrime,
        backgroundImageZoom: backgroundImageZoom.firstPrime,
        cellColumnCount: cellColumnCount.firstPrime,
        cellHeight: cellHeight.firstPrime,
        cellOffsetX: cellOffsetX.firstPrime,
        cellOffsetY: cellOffsetY.firstPrime,
        cellRowCount: cellRowCount.firstPrime,
        cellWidth: cellWidth.firstPrime,
        name: name.firstPrime,
    };

    const secondPrime: UpOperation = {
        $version: 1,
        backgroundImage: backgroundImage.secondPrime,
        backgroundImageZoom: backgroundImageZoom.secondPrime,
        cellColumnCount: cellColumnCount.secondPrime,
        cellHeight: cellHeight.secondPrime,
        cellOffsetX: cellOffsetX.secondPrime,
        cellOffsetY: cellOffsetY.secondPrime,
        cellRowCount: cellRowCount.secondPrime,
        cellWidth: cellWidth.secondPrime,
        name: name.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
