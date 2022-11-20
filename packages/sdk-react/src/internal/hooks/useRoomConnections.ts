import { RoomClient } from '@flocon-trpg/sdk';
import { useReadonlyBehaviorEvent } from './useReadonlyBehaviorEvent';

export const useRoomConnections = (roomClient: Pick<RoomClient<any, any>, 'roomConnections'>) => {
    return useReadonlyBehaviorEvent(roomClient.roomConnections);
};
