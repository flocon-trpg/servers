import { RoomClient } from '@flocon-trpg/sdk';
import { useReadonlyBehaviorEvent } from './useReadonlyBehaviorEvent';

export const useRoomGraphQLStatus = <TGraphQLError>(
    roomClient: Pick<RoomClient<any, TGraphQLError>, 'graphQLStatus'>,
) => {
    return useReadonlyBehaviorEvent(roomClient.graphQLStatus);
};
