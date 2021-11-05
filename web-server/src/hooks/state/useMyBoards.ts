import { BoardState } from '@kizahasi/flocon-core';
import { recordForEach } from '@kizahasi/util';
import React from 'react';
import { useSelector } from '../../store';
import { useMyUserUid } from '../useMyUserUid';

export const useMyBoards = (): ReadonlyMap<string, BoardState> | undefined => {
    const myUserUid = useMyUserUid();
    const boards = useSelector(
        state => state.roomModule.roomState?.state?.participants?.[myUserUid ?? '']?.boards
    );
    return React.useMemo(() => {
        if (boards == null) {
            return undefined;
        }
        const result = new Map<string, BoardState>();
        recordForEach<BoardState>(boards, (value, key) => {
            result.set(key, value);
        });
        return result;
    }, [boards]);
};
