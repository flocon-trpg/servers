import { PiecePositionWithCell } from './types';

export const applyPiecePositionWithCell = ({
    state,
    operation,
}: {
    state: PiecePositionWithCell;
    operation: PiecePositionWithCell;
}): void => {
    for (const key of ['x', 'y', 'w', 'h', 'cellX', 'cellY', 'cellW', 'cellH'] as const) {
        state[key] = operation[key];
    }
};
