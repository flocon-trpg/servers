import { recordToMap } from '@flocon-trpg/utils';
import React from 'react';
import { roomAtom } from '@/atoms/roomAtom/roomAtom';
import { useAtomSelector } from '@/hooks/useAtomSelector';

export const useDicePieces = (boardId: string | undefined) => {
    const dicePieces = useAtomSelector(
        roomAtom,
        state =>
            boardId == null ? undefined : state.roomState?.state?.boards?.[boardId]?.dicePieces,
        [boardId]
    );
    return React.useMemo(() => {
        return dicePieces == null ? undefined : recordToMap(dicePieces);
    }, [dicePieces]);
};
