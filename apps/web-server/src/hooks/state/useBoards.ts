import { useAtomSelector } from '../../atoms/useAtomSelector';
import { roomAtom } from '../../atoms/room/roomAtom';
import React from 'react';
import { BoardState } from '@flocon-trpg/core';
import { recordToMap } from '@flocon-trpg/utils';

export const useBoards = (): ReadonlyMap<string, BoardState> => {
    const record = useAtomSelector(roomAtom, state => state.roomState?.state?.boards);
    return React.useMemo(
        () => (record == null ? new Map<string, BoardState>() : recordToMap(record)),
        [record]
    );
};