import React from 'react';
import { useParticipants } from './useParticipants';
import { createStateMap, ReadonlyStateMap, recordToMap } from '@kizahasi/util';
import { BoardState } from '@kizahasi/flocon-core';
import _ from 'lodash';

export const useBoards = (): ReadonlyStateMap<BoardState> | undefined => {
    const participants = useParticipants();
    return React.useMemo(() => {
        if (participants == null) {
            return undefined;
        }
        const source = new Map<string, Map<string, BoardState>>();
        [...participants].forEach(([key, value]) => {
            source.set(key, recordToMap(value.boards));
        });
        return createStateMap(source);
    }, [participants]);
};