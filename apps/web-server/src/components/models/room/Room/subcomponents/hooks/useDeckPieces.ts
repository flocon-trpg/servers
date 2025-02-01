import { recordToMap } from '@flocon-trpg/utils';
import React from 'react';
import { useRoomStateValue } from '@/hooks/useRoomStateValue';

export const useDeckPieces = (boardId: string | undefined) => {
    const roomState = useRoomStateValue();
    const deckPieces = boardId == null ? undefined : roomState?.boards?.[boardId]?.deckPieces;
    return React.useMemo(() => {
        return deckPieces == null ? undefined : recordToMap(deckPieces);
    }, [deckPieces]);
};
