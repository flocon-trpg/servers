import { BoardState } from '@kizahasi/flocon-core';
import { dualKeyRecordForEach } from '@kizahasi/util';
import React from 'react';
import { useSelector } from '../../store';
import { useMyUserUid } from '../useMyUserUid';

export const useMyBoards = (): ReadonlyMap<string, BoardState> | undefined => {
    const myUserUid = useMyUserUid();
    const boards = useSelector(state => state.roomModule.roomState?.state?.boards);
    return React.useMemo(() => {
        if (boards == null) {
            return undefined;
        }
        const result = new Map<string, BoardState>();
        dualKeyRecordForEach<BoardState>(boards, (value, key) => {
            if (key.first !== myUserUid) {
                return;
            }
            result.set(key.second, value);
        });
        return result;
    }, [boards, myUserUid]);
};
