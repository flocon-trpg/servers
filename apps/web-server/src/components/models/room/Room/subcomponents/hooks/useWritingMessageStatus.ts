import * as SDK from '@flocon-trpg/sdk-react';
import { useRoomClient } from '@/hooks/roomClientHooks';

export const useWritingMessageStatus = () => {
    const roomClient = useRoomClient();
    return SDK.useWritingMessageStatus(roomClient.value);
};
