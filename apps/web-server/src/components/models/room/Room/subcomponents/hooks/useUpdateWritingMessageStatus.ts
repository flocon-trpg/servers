import * as SDK from '@flocon-trpg/sdk-react';
import { useRoomClient } from '@/hooks/roomClientHooks';

export const useUpdateWritingMessageStatus = () => {
    const roomClient = useRoomClient();
    return SDK.useUpdateWritingMessageStatus(roomClient.value);
};
