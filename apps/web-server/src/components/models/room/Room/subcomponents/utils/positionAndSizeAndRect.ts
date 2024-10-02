import {
    OmitVersion,
    State,
    boardPositionTemplate,
    boardTemplate,
    pieceTemplate,
} from '@flocon-trpg/core';

type BoardState = OmitVersion<State<typeof boardTemplate>>;
export type CellConfig = Pick<
    BoardState,
    'cellHeight' | 'cellOffsetX' | 'cellOffsetY' | 'cellWidth'
>;
type BoardPositionState = OmitVersion<State<typeof boardPositionTemplate>>;
type PieceState = OmitVersion<State<typeof pieceTemplate>>;

export type Vector2 = {
    x: number;
    y: number;
};

export type PixelPosition = Vector2;

export type PixelSize = {
    w: number;
    h: number;
};

export type DragEndResult = {
    readonly newPosition?: PixelPosition;
    readonly newSize?: PixelSize;
};

export type PixelRect = PixelPosition & PixelSize;

export type CellPosition = {
    cellX: number;
    cellY: number;
};

export type CellSize = {
    cellW: number;
    cellH: number;
};

export type CellRect = CellPosition & CellSize;

export type CompositeRect = PixelRect & CellRect;

export const toPixelRect = ({
    cellRect,
    cellConfig,
}: {
    cellRect: CellRect;
    cellConfig: CellConfig;
}): PixelRect => {
    return {
        x: cellRect.cellX * cellConfig.cellWidth + cellConfig.cellOffsetX,
        y: cellRect.cellY * cellConfig.cellHeight + cellConfig.cellOffsetY,
        w: cellRect.cellW * cellConfig.cellWidth,
        h: cellRect.cellH * cellConfig.cellHeight,
    };
};

export const stateToPixelRect = ({
    state,
    cellConfig,
}: {
    state: PieceState | BoardPositionState;
    cellConfig: CellConfig;
}): PixelRect => {
    if ('isCellMode' in state && state.isCellMode === true) {
        return toPixelRect({
            cellRect: state,
            cellConfig,
        });
    }
    return {
        x: state.x,
        y: state.y,
        w: state.w,
        h: state.h,
    };
};

export const isCursorOnPixelRect = ({
    pixelRect,
    cursorPosition,
}: {
    pixelRect: PixelRect;
    cursorPosition: { x: number; y: number };
}): boolean => {
    const { x, y, w, h } = pixelRect;
    return (
        x <= cursorPosition.x &&
        cursorPosition.x <= x + w &&
        y <= cursorPosition.y &&
        cursorPosition.y <= y + h
    );
};

export const isCursorOnState = ({
    state,
    cellConfig,
    cursorPosition,
}: {
    state: PieceState | BoardPositionState;
    cellConfig: CellConfig;
    cursorPosition: { x: number; y: number };
}): boolean => {
    const pixelRect = stateToPixelRect({
        state,
        cellConfig,
    });
    return isCursorOnPixelRect({ pixelRect, cursorPosition });
};

// x,yはoffsetとzoomが0のときの値。
export const toCellPosition = ({
    cellConfig,
    pixelPosition,
}: {
    cellConfig: CellConfig;
    pixelPosition: PixelPosition;
}): CellPosition => {
    const defaultResult = { cellX: 0, cellY: 0 };
    if (cellConfig.cellWidth == null || cellConfig.cellWidth <= 0) {
        return defaultResult;
    }
    if (cellConfig.cellHeight == null || cellConfig.cellHeight <= 0) {
        return defaultResult;
    }
    return {
        cellX: Math.round((pixelPosition.x - cellConfig.cellOffsetX) / cellConfig.cellWidth),
        cellY: Math.round((pixelPosition.y - cellConfig.cellOffsetY) / cellConfig.cellHeight),
    };
};

export const toCellSize = ({
    cellConfig,
    pixelSize,
}: {
    cellConfig: CellConfig;
    pixelSize: PixelSize;
}): CellSize => {
    const defaultResult = { cellW: 1, cellH: 1 };
    if (cellConfig.cellWidth == null || cellConfig.cellWidth <= 0) {
        return defaultResult;
    }
    if (cellConfig.cellHeight == null || cellConfig.cellHeight <= 0) {
        return defaultResult;
    }
    return {
        cellW: Math.round(pixelSize.w / cellConfig.cellWidth),
        cellH: Math.round(pixelSize.h / cellConfig.cellHeight),
    };
};

export const toCellRect = ({
    cellConfig,
    pixelRect,
}: {
    cellConfig: CellConfig;
    pixelRect: PixelRect;
}): CellRect => {
    return {
        ...toCellPosition({ cellConfig: cellConfig, pixelPosition: pixelRect }),
        ...toCellSize({ cellConfig: cellConfig, pixelSize: pixelRect }),
    };
};

export const pixelRectToCompositeRect = (
    params: Parameters<typeof toCellRect>[0],
): CompositeRect => {
    return {
        ...toCellRect(params),
        x: params.pixelRect.x,
        y: params.pixelRect.y,
        w: params.pixelRect.w,
        h: params.pixelRect.h,
    };
};

export const cellRectToCompositeRect = (
    params: Parameters<typeof toPixelRect>[0],
): CompositeRect => {
    return {
        ...toPixelRect(params),
        cellH: params.cellRect.cellH,
        cellW: params.cellRect.cellW,
        cellX: params.cellRect.cellX,
        cellY: params.cellRect.cellY,
    };
};

export const applyCompositeRect = ({
    state,
    operation,
}: {
    state: CompositeRect;
    operation: CompositeRect;
}): void => {
    for (const key of ['x', 'y', 'w', 'h', 'cellX', 'cellY', 'cellW', 'cellH'] as const) {
        state[key] = operation[key];
    }
};
