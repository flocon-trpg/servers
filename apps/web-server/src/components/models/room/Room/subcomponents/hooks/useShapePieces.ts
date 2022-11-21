import { recordToMap } from '@flocon-trpg/utils';
import React from 'react';
import { useRoomStateValue } from '@/hooks/useRoomStateValue';

export const useShapePieces = (boardId: string | undefined) => {
    const roomState = useRoomStateValue();
    const shapePieces = boardId == null ? undefined : roomState?.boards?.[boardId]?.shapePieces;
    return React.useMemo(() => {
        return shapePieces == null ? undefined : recordToMap(shapePieces);
    }, [shapePieces]);
};
