import { Board } from '../../stateManagers/states/board';


export const getCellPosition = ({
    board,
    x,
    y,
}: {
    board: Board.State;
    x: number;
    y: number;
}): { cellX: number; cellY: number } => {
    const defaultResult = { cellX: 0, cellY: 0 };
    if (board.cellWidth == null || board.cellWidth <= 0) {
        return defaultResult;
    }
    if (board.cellHeight == null || board.cellHeight <= 0) {
        return defaultResult;
    }
    return {
        cellX: Math.round(x / board.cellWidth),
        cellY: Math.round(y / board.cellHeight),
    };
};

export const getCellSize = ({
    board,
    w,
    h,
}: {
    board: Board.State;
    w: number;
    h: number;
}): { cellW: number; cellH: number } => {
    const defaultResult = { cellW: 1, cellH: 1 };
    if (board.cellWidth == null || board.cellWidth <= 0) {
        return defaultResult;
    }
    if (board.cellHeight == null || board.cellHeight <= 0) {
        return defaultResult;
    }
    return {
        cellW: Math.round(w / board.cellWidth),
        cellH: Math.round(h / board.cellHeight),
    };
};