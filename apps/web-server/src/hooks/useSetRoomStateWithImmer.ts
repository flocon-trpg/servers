import { State, roomTemplate } from '@flocon-trpg/core';
import produce from 'immer';
import { atom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import React from 'react';
import { roomAtom } from '../atoms/room/roomAtom';

type RoomState = State<typeof roomTemplate>;

type Result = (stateOrRecipe: RoomState | ((prevState: RoomState) => void)) => void;

const emptySetRoomStateWithImmer: Result = (): void => {
    throw new Error('setRoomStateWithImmer is not ready');
};

const setStateAtom = atom(get => get(roomAtom).roomState?.setState);

export const useSetRoomStateWithImmer = (): Result => {
    const setRoomStateCore = useAtomValue(setStateAtom);
    return React.useMemo(() => {
        if (setRoomStateCore == null) {
            return emptySetRoomStateWithImmer;
        }
        return (stateOrRecipe: RoomState | ((prevState: RoomState) => void)): void => {
            if (typeof stateOrRecipe === 'function') {
                setRoomStateCore(prevState => produce(prevState, stateOrRecipe));
                return;
            }
            setRoomStateCore(stateOrRecipe);
        };
    }, [setRoomStateCore]);
};
