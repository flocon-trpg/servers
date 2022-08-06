import React from 'react';
import { recordToMap } from '@flocon-trpg/utils';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { roomAtom } from '@/atoms/roomAtom/roomAtom';

export const useShapePieces = (boardId: string | undefined) => {
    const shapePieces = useAtomSelector(
        roomAtom,
        state =>
            boardId == null ? undefined : state.roomState?.state?.boards?.[boardId]?.shapePieces,
        [boardId]
    );
    return React.useMemo(() => {
        return shapePieces == null ? undefined : recordToMap(shapePieces);
    }, [shapePieces]);
};
