import React from 'react';
import { CellConfig } from '../utils/positionAndSizeAndRect';
import { useBoard } from './useBoard';

export const useCellConfig = (boardId: string | undefined): CellConfig | undefined => {
    const board = useBoard(boardId);

    return React.useMemo(() => {
        if (board?.cellHeight == null) {
            return undefined;
        }
        return {
            cellHeight: board.cellHeight,
            cellOffsetX: board.cellOffsetX,
            cellOffsetY: board.cellOffsetY,
            cellWidth: board.cellWidth,
        };
    }, [board?.cellHeight, board?.cellOffsetX, board?.cellOffsetY, board?.cellWidth]);
};
