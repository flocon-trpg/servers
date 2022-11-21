import { RoomClient } from '@flocon-trpg/sdk';
import { useReadonlyBehaviorStream } from './useReadonlyBehaviorEvent';

export const useRoomConnections = (roomClient: Pick<RoomClient<any, any>, 'roomConnections'>) => {
    return useReadonlyBehaviorStream(roomClient.roomConnections);
};
