import React from 'react';
import { CompositeKey } from '@kizahasi/util';
import { BoardState } from '@kizahasi/flocon-core';
import _ from 'lodash';
import { useBoards } from './useBoards';
import { useCompositeKeyMemo } from '../useCompositeKeyMemo';

export const useBoard = (boardKey: CompositeKey): BoardState | undefined => {
    const boardKeyMemo = useCompositeKeyMemo(boardKey);
    const boards = useBoards();
    return React.useMemo(() => {
        if (boards == null) {
            return undefined;
        }
        return boards.get(boardKeyMemo);
    }, [boards, boardKeyMemo]);
};
