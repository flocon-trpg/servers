import React from 'react';
import { recordToMap } from '@flocon-trpg/utils';
import { useAtomSelector } from '../../atoms/useAtomSelector';
import { roomAtom } from '../../atoms/room/roomAtom';

export const useStringPieces = (boardId: string | undefined) => {
    const stringPieces = useAtomSelector(
        roomAtom,
        state =>
            boardId == null ? undefined : state.roomState?.state?.boards?.[boardId]?.stringPieces,
        [boardId]
    );
    return React.useMemo(() => {
        return stringPieces == null ? undefined : recordToMap(stringPieces);
    }, [stringPieces]);
};
