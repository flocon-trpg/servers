import * as SDK from '@flocon-trpg/sdk-react';
import { useRoomClient } from './roomClientHooks';

export const useRoomGraphQLStatus = () => {
    const roomClient = useRoomClient();
    return SDK.useRoomGraphQLStatus(roomClient.value);
};
