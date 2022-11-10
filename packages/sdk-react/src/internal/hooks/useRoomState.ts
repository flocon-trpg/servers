import { RoomClient } from '@flocon-trpg/sdk';
import { useReadonlyBehaviorStream } from './useReadonlyBehaviorEvent';

export const useRoomState = <TGraphQLError>(
    roomClient: Pick<RoomClient<any, TGraphQLError>, 'roomState'>
) => {
    return useReadonlyBehaviorStream(roomClient.roomState);
};
