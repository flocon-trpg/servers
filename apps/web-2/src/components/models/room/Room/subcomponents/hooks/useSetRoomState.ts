import { State, roomTemplate } from '@flocon-trpg/core';
import { SetAction } from '../../../../../../utils/types';
import { useRoomState } from '@/hooks/useRoomState';

type Result = (setState: SetAction<State<typeof roomTemplate>>) => void;

const emptySetRoomState: Result = () => {
    throw new Error('setRoomState is not ready');
};

export const useSetRoomState = (): Result => {
    const roomState = useRoomState();
    if (roomState?.type !== 'joined') {
        return emptySetRoomState;
    }
    return roomState.setState;
};
