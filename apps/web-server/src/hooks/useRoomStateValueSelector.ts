import { State, roomTemplate } from '@flocon-trpg/core';
import React from 'react';
import { useLatest } from 'react-use';
import { useRoomStateValue } from './useRoomStateValue';

type RoomState = State<typeof roomTemplate>;

export const useRoomStateValueSelector = <T>(
    selector: (state: RoomState) => T,
    deps?: React.DependencyList
) => {
    const roomState = useRoomStateValue();
    const selectorRef = useLatest(selector);
    return React.useMemo(() => {
        if (roomState == null) {
            return roomState;
        }
        return selectorRef.current(roomState);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomState, selectorRef, ...(deps ?? [])]);
};
