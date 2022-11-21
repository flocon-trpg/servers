import { useRoomState } from './useRoomState';

export const useRoomStateValue = () => {
    const roomState = useRoomState();
    if (roomState.type !== 'joined') {
        return null;
    }
    return roomState.state;
};
