import { RoomClient } from '@flocon-trpg/sdk';
import { useReadonlyBehaviorEvent } from './useReadonlyBehaviorEvent';

export const useRoomState = <TGraphQLError>(
    roomClient: Pick<RoomClient<any, TGraphQLError>, 'roomState'>
) => {
    return useReadonlyBehaviorEvent(roomClient.roomState);
};
