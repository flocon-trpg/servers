import React from 'react';
import { recordToMap } from '@flocon-trpg/utils';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { roomAtom } from '@/atoms/roomAtom/roomAtom';

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
