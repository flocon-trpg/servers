import { State, roomTemplate } from '@flocon-trpg/core';
import { atom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import { roomAtom } from '../atoms/roomAtom/roomAtom';
import { SetAction } from '../utils/types';

const emptySetRoomState = (setState: SetAction<State<typeof roomTemplate>>): void => {
    throw new Error('setRoomState is not ready');
};

const setStateAtom = atom(get => get(roomAtom).roomState?.setState);

export const useSetRoomState = (): typeof emptySetRoomState => {
    return useAtomValue(setStateAtom) ?? emptySetRoomState;
};
