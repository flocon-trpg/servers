import { recordToMap } from '@flocon-trpg/utils';
import React from 'react';
import { useRoomStateValue } from '@/hooks/useRoomStateValue';

export const useDicePieces = (boardId: string | undefined) => {
    const roomState = useRoomStateValue();
    const dicePieces = boardId == null ? undefined : roomState?.boards?.[boardId]?.dicePieces;
    return React.useMemo(() => {
        return dicePieces == null ? undefined : recordToMap(dicePieces);
    }, [dicePieces]);
};
