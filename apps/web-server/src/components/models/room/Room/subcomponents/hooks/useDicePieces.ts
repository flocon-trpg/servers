import React from 'react';
import { recordToMap } from '@flocon-trpg/utils';
import { useAtomSelector } from '../../../../../../hooks/useAtomSelector';
import { roomAtom } from '../../../../../../atoms/roomAtom/roomAtom';

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
