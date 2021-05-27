import { BoardState } from '@kizahasi/flocon-core';
import { recordToMap } from '@kizahasi/util';
import React from 'react';
import { useMe } from '../useMe';

export const useMyBoards = (): ReadonlyMap<string, BoardState> | undefined => {
    const { participant } = useMe();
    return React.useMemo(() => {
        if (participant == null) {
            return undefined;
        }
        return recordToMap(participant.boards);
    }, [participant]);
};