import { recordToMap } from '@flocon-trpg/utils';
import React from 'react';
import { roomAtom } from '@/atoms/roomAtom/roomAtom';
import { useAtomSelector } from '@/hooks/useAtomSelector';

export const useImagePieces = (boardId: string | undefined) => {
    const imagePieces = useAtomSelector(
        roomAtom,
        state =>
            boardId == null ? undefined : state.roomState?.state?.boards?.[boardId]?.imagePieces,
        [boardId]
    );
    return React.useMemo(() => {
        return imagePieces == null ? undefined : recordToMap(imagePieces);
    }, [imagePieces]);
};
