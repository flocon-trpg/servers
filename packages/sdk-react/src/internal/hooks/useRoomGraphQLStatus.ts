import { RoomClient } from '@flocon-trpg/sdk';
import { useReadonlyBehaviorStream } from './useReadonlyBehaviorEvent';

export const useRoomGraphQLStatus = <TGraphQLError>(
    roomClient: Pick<RoomClient<any, TGraphQLError>, 'graphQLStatus'>
) => {
    return useReadonlyBehaviorStream(roomClient.graphQLStatus);
};
