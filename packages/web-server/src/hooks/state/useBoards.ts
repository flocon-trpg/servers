import React from 'react';
import { createStateMap, ReadonlyStateMap, dualKeyRecordForEach } from '@flocon-trpg/utils';
import { BoardState } from '@flocon-trpg/core';
import { useSelector } from '../../store';
import { useCreateStateMap } from '../useCreateStateMap';

export const useBoards = (): ReadonlyStateMap<BoardState> | undefined => {
    const participants = useSelector(state => state.roomModule.roomState?.state?.participants);
    return useCreateStateMap(participants ?? {}, x => x.boards);
};
