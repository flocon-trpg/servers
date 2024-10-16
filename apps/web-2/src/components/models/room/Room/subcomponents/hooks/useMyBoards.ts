import { State, boardTemplate } from '@flocon-trpg/core';
import React from 'react';
import { useMyUserUid } from '../../../../../../hooks/useMyUserUid';
import { useBoards } from './useBoards';

type BoardState = State<typeof boardTemplate>;

export const useMyBoards = (): ReadonlyMap<string, BoardState> | undefined => {
    const myUserUid = useMyUserUid();
    const boards = useBoards();
    return React.useMemo(() => {
        if (boards == null) {
            return undefined;
        }
        const result = new Map<string, BoardState>();
        boards.forEach((value, key) => {
            if (value.ownerParticipantId === myUserUid) {
                result.set(key, value);
            }
        });
        return result;
    }, [boards, myUserUid]);
};
