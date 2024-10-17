import * as SDK from '@flocon-trpg/sdk-react';
import { useRoomClient } from '@/hooks/roomClientHooks';

export const useRoomMessageQueryStatus = () => {
    const roomClient = useRoomClient();
    return SDK.useRoomMessageQueryStatus(roomClient.value);
};
