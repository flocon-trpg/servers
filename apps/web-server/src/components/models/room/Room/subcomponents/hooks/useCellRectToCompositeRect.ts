import { usePersistentMemo } from '../../../../../../hooks/usePersistentMemo';
import { CellRect, CompositeRect, cellRectToCompositeRect } from '../utils/positionAndSizeAndRect';
import { useCellConfig } from './useCellConfig';

export const useCellRectToCompositeRect = ({
    boardId,
    cellRect,
}: {
    boardId: string | undefined;
    cellRect: CellRect | undefined;
}): CompositeRect | undefined => {
    const cellConfig = useCellConfig(boardId);

    return usePersistentMemo(() => {
        if (cellConfig == null || cellRect?.cellX == null) {
            return undefined;
        }
        return cellRectToCompositeRect({
            cellConfig,
            cellRect: {
                cellH: cellRect.cellH,
                cellW: cellRect.cellW,
                cellX: cellRect.cellX,
                cellY: cellRect.cellY,
            },
        });
    }, [cellConfig, cellRect?.cellH, cellRect?.cellW, cellRect?.cellX, cellRect?.cellY]);
};
