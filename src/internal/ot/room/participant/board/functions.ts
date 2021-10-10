import * as ReplaceOperation from '../../../util/replaceOperation';
import * as TextOperation from '../../../util/textOperation';
import {
    Apply,
    ClientTransform,
    Compose,
    Diff,
    RequestedBy,
    Restore,
    ServerTransform,
} from '../../../util/type';
import { isIdRecord } from '../../../util/record';
import { Result } from '@kizahasi/result';
import { DownOperation, State, TwoWayOperation, UpOperation } from './types';

export const toClientState = (source: State): State => {
    return source;
};

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        name: source.name == null ? undefined : TextOperation.toDownOperation(source.name),
    };
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return {
        ...source,
        name: source.name == null ? undefined : TextOperation.toUpOperation(source.name),
    };
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
        const applied = TextOperation.apply(state.name, operation.name);
        if (applied.isError) {
            return applied;
        }
        result.name = applied.value;
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
    if (operation.name != null) {
        const applied = TextOperation.applyBack(state.name, operation.name);
        if (applied.isError) {
            return applied;
        }
        result.name = applied.value;
    }

    return Result.ok(result);
};

export const composeDownOperation: Compose<DownOperation> = ({ first, second }) => {
    const name = TextOperation.composeDownOperation(first.name, second.name);
    if (name.isError) {
        return name;
    }
    const valueProps: DownOperation = {
        $v: 1,

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
        name: name.value,
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
        $v: 1,
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
        const restored = TextOperation.restore({
            nextState: nextState.name,
            downOperation: downOperation.name,
        });
        if (restored.isError) {
            return restored;
        }
        prevState.name = restored.value.prevState;
        twoWayOperation.name = restored.value.twoWayOperation;
    }

    return Result.ok({ prevState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const resultType: TwoWayOperation = { $v: 1 };
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
        resultType.name = TextOperation.diff({ prev: prevState.name, next: nextState.name });
    }
    if (isIdRecord(resultType)) {
        return undefined;
    }
    return resultType;
};

export const serverTransform =
    (requestedBy: RequestedBy): ServerTransform<State, TwoWayOperation, UpOperation> =>
    ({ prevState, currentState, clientOperation, serverOperation }) => {
        const twoWayOperation: TwoWayOperation = { $v: 1 };

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
        const name = TextOperation.serverTransform({
            first: serverOperation?.name,
            second: clientOperation.name,
            prevState: prevState.name,
        });
        if (name.isError) {
            return name;
        }
        twoWayOperation.name = name.value.secondPrime;

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
    const name = TextOperation.clientTransform({
        first: first.name,
        second: second.name,
    });
    if (name.isError) {
        return name;
    }

    const firstPrime: UpOperation = {
        $v: 1,
        backgroundImage: backgroundImage.firstPrime,
        backgroundImageZoom: backgroundImageZoom.firstPrime,
        cellColumnCount: cellColumnCount.firstPrime,
        cellHeight: cellHeight.firstPrime,
        cellOffsetX: cellOffsetX.firstPrime,
        cellOffsetY: cellOffsetY.firstPrime,
        cellRowCount: cellRowCount.firstPrime,
        cellWidth: cellWidth.firstPrime,
        name: name.value.firstPrime,
    };

    const secondPrime: UpOperation = {
        $v: 1,
        backgroundImage: backgroundImage.secondPrime,
        backgroundImageZoom: backgroundImageZoom.secondPrime,
        cellColumnCount: cellColumnCount.secondPrime,
        cellHeight: cellHeight.secondPrime,
        cellOffsetX: cellOffsetX.secondPrime,
        cellOffsetY: cellOffsetY.secondPrime,
        cellRowCount: cellRowCount.secondPrime,
        cellWidth: cellWidth.secondPrime,
        name: name.value.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
