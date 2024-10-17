import { recordToMap } from '@flocon-trpg/utils';
import React from 'react';
import { useRoomStateValue } from '@/hooks/useRoomStateValue';

export const useStringPieces = (boardId: string | undefined) => {
    const roomState = useRoomStateValue();
    const stringPieces = boardId == null ? undefined : roomState?.boards?.[boardId]?.stringPieces;
    return React.useMemo(() => {
        return stringPieces == null ? undefined : recordToMap(stringPieces);
    }, [stringPieces]);
};
