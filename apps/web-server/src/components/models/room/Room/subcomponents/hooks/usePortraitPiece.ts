import React from 'react';
import { usePortraitPieces } from './usePortraitPieces';

export const usePortraitPiece = ({ boardId, pieceId }: { boardId: string; pieceId: string }) => {
    const portraitPieces = usePortraitPieces(boardId);
    return React.useMemo(() => {
        if (portraitPieces == null) {
            return undefined;
        }
        for (const piece of portraitPieces) {
            if (piece.pieceId === pieceId) {
                return piece;
            }
        }
        return undefined;
    }, [portraitPieces, pieceId]);
};
