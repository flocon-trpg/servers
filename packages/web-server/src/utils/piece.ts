import { BoardState, PieceState } from '@flocon-trpg/core';

export namespace Piece {
    export const getPosition = ({
        state,
        cellWidth,
        cellHeight,
        cellOffsetX,
        cellOffsetY,
    }: {
        state: PieceState;
        cellWidth: number;
        cellHeight: number;
        cellOffsetX: number;
        cellOffsetY: number;
    }): { x: number; y: number; w: number; h: number } => {
        return {
            x: state.isCellMode ? state.cellX * cellWidth + cellOffsetX : state.x,
            y: state.isCellMode ? state.cellY * cellHeight + cellOffsetY : state.y,
            w: state.isCellMode ? state.cellW * cellWidth : state.w,
            h: state.isCellMode ? state.cellH * cellHeight : state.h,
        };
    };

    export const isCursorOnIcon = ({
        state,
        cellWidth,
        cellHeight,
        cursorPosition,
        cellOffsetX,
        cellOffsetY,
    }: {
        state: PieceState;
        cellWidth: number;
        cellHeight: number;
        cursorPosition: { x: number; y: number };
        cellOffsetX: number;
        cellOffsetY: number;
    }): boolean => {
        const { x, y, w, h } = getPosition({
            state,
            cellWidth,
            cellHeight,
            cellOffsetX,
            cellOffsetY,
        });
        return (
            x <= cursorPosition.x &&
            cursorPosition.x <= x + w &&
            y <= cursorPosition.y &&
            cursorPosition.y <= y + h
        );
    };

    // x,yはoffsetとzoomが0のときの値。
    export const getCellPosition = ({
        board,
        x,
        y,
    }: {
        board: BoardState;
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
            cellX: Math.round((x - board.cellOffsetX) / board.cellWidth),
            cellY: Math.round((y - board.cellOffsetY) / board.cellHeight),
        };
    };

    export const getCellSize = ({
        board,
        w,
        h,
    }: {
        board: BoardState;
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
}
