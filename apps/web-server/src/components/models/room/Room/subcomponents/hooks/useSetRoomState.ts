import { State, roomTemplate } from '@flocon-trpg/core';
import { SetAction } from '../../../../../../utils/types';
import { useRoomState } from '@/hooks/useRoomState';

const emptySetRoomState = (setState: SetAction<State<typeof roomTemplate>>): void => {
    throw new Error('setRoomState is not ready');
};

export const useSetRoomState = (): typeof emptySetRoomState => {
    const roomState = useRoomState();
    if (roomState?.type !== 'joined') {
        return emptySetRoomState;
    }
    return roomState.setState;
};
