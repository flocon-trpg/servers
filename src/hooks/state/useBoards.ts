import React from 'react';
import { createStateMap, ReadonlyStateMap, dualKeyRecordForEach } from '@kizahasi/util';
import { BoardState } from '@kizahasi/flocon-core';
import _ from 'lodash';
import { useSelector } from '../../store';

export const useBoards = (): ReadonlyStateMap<BoardState> | undefined => {
    const boards = useSelector(state => state.roomModule.roomState?.state?.boards);
    return React.useMemo(() => {
        if (boards == null) {
            return undefined;
        }
        const result = createStateMap<BoardState>();
        dualKeyRecordForEach<BoardState>(boards, (value, key) => {
            result.set({ createdBy: key.first, id: key.second }, value);
        });
        return result;
    }, [boards]);
};
