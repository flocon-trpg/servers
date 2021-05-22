import React from 'react';
import { recordToMap } from '../../@shared/utils';
import * as Board from '../../@shared/ot/room/participant/board/v1';
import { useMe } from '../useMe';

export const useMyBoards = (): ReadonlyMap<string, Board.State> | undefined => {
    const { participant } = useMe();
    return React.useMemo(() => {
        if (participant == null) {
            return undefined;
        }
        return recordToMap(participant.boards);
    }, [participant]);
};