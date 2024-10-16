import { State, boardTemplate } from '@flocon-trpg/core';
import { recordToMap } from '@flocon-trpg/utils';
import React from 'react';
import { useRoomStateValueSelector } from '@/hooks/useRoomStateValueSelector';

type BoardState = State<typeof boardTemplate>;

export const useBoards = (): ReadonlyMap<string, BoardState> => {
    const record = useRoomStateValueSelector(state => state.boards);
    return React.useMemo(
        () => (record == null ? new Map<string, BoardState>() : recordToMap(record)),
        [record],
    );
};
