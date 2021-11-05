import React from 'react';
import { CompositeKey } from '@flocon-trpg/utils';
import { BoardState } from '@flocon-trpg/core';
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
