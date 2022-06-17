import { usePersistentMemo } from '@/hooks/usePersistentMemo';
import {
    CompositeRect,
    PixelRect,
    pixelRectToCompositeRect,
} from '../utils/positionAndSizeAndRect';
import { useCellConfig } from './useCellConfig';

export const usePixelRectToCompositeRect = ({
    boardId,
    pixelRect,
}: {
    boardId: string | undefined;
    pixelRect: PixelRect | undefined;
}): CompositeRect | undefined => {
    const cellConfig = useCellConfig(boardId);

    return usePersistentMemo(() => {
        if (cellConfig == null || pixelRect?.x == null) {
            return undefined;
        }
        return pixelRectToCompositeRect({
            cellConfig,
            pixelRect: {
                x: pixelRect.x,
                y: pixelRect.y,
                w: pixelRect.w,
                h: pixelRect.h,
            },
        });
    }, [cellConfig, pixelRect?.h, pixelRect?.w, pixelRect?.x, pixelRect?.y]);
};
