import { useAtomSelector } from '@/hooks/useAtomSelector';
import { roomAtom } from '@/atoms/roomAtom/roomAtom';
import React from 'react';
import { State, boardTemplate } from '@flocon-trpg/core';
import { recordToMap } from '@flocon-trpg/utils';

type BoardState = State<typeof boardTemplate>;

export const useBoards = (): ReadonlyMap<string, BoardState> => {
    const record = useAtomSelector(roomAtom, state => state.roomState?.state?.boards);
    return React.useMemo(
        () => (record == null ? new Map<string, BoardState>() : recordToMap(record)),
        [record]
    );
};
