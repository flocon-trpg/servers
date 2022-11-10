import { State, roomTemplate } from '@flocon-trpg/core';
import produce from 'immer';
import React from 'react';
import { useLatest } from 'react-use';
import { useSetRoomState } from './useSetRoomState';

type RoomState = State<typeof roomTemplate>;

type Result = (stateOrRecipe: RoomState | ((prevState: RoomState) => void)) => void;

export const useSetRoomStateWithImmer = (): Result => {
    const setRoomState = useSetRoomState();
    const setRoomStateRef = useLatest(setRoomState);
    return React.useMemo(() => {
        return (stateOrRecipe: RoomState | ((prevState: RoomState) => void)): void => {
            if (typeof stateOrRecipe === 'function') {
                setRoomStateRef.current(prevState => produce(prevState, stateOrRecipe));
                return;
            }
            setRoomStateRef.current(stateOrRecipe);
        };
    }, [setRoomStateRef]);
};
