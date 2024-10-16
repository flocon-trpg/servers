import { recordToMap } from '@flocon-trpg/utils';
import React from 'react';
import { useRoomStateValue } from '@/hooks/useRoomStateValue';

export const useImagePieces = (boardId: string | undefined) => {
    const roomState = useRoomStateValue();
    const imagePieces = boardId == null ? undefined : roomState?.boards?.[boardId]?.imagePieces;
    return React.useMemo(() => {
        return imagePieces == null ? undefined : recordToMap(imagePieces);
    }, [imagePieces]);
};
