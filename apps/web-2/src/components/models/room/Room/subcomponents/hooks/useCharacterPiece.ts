import React from 'react';
import { useCharacterPieces } from './useCharacterPieces';

export const useCharacterPiece = ({ boardId, pieceId }: { boardId: string; pieceId: string }) => {
    const characterPieces = useCharacterPieces(boardId);
    return React.useMemo(() => {
        if (characterPieces == null) {
            return undefined;
        }
        for (const piece of characterPieces) {
            if (piece.pieceId === pieceId) {
                return piece;
            }
        }
        return undefined;
    }, [characterPieces, pieceId]);
};
