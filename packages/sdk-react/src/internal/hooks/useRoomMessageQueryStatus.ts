import { RoomClient } from '@flocon-trpg/sdk';
import { useReadonlyBehaviorEvent } from './useReadonlyBehaviorEvent';

export const useRoomMessageQueryStatus = <TCustomMessage, TGraphQLError>(
    roomClient: Pick<RoomClient<TCustomMessage, TGraphQLError>, 'messages'>,
) => {
    return useReadonlyBehaviorEvent(roomClient.messages.queryStatus);
};
