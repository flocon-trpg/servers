import React from 'react';
import { CompositeKey } from '@kizahasi/util';
import { BoardState } from '@kizahasi/flocon-core';
import _ from 'lodash';
import { useBoards } from './useBoards';

export const useBoard = (boardKey: CompositeKey): BoardState | undefined => {
    const boards = useBoards();
    return React.useMemo(() => {
        if (boards == null) {
            return undefined;
        }
        return boards.get({ createdBy: boardKey.createdBy, id: boardKey.id });
    }, [boards, boardKey.createdBy, boardKey.id]);
};
