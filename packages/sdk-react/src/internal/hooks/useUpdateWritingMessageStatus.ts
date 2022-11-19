import { RoomClient } from '@flocon-trpg/sdk';
import { useMemo } from 'react';

export const useUpdateWritingMessageStatus = (
    roomClient: Pick<RoomClient<any, any>, 'writingMessageStatus'>
) => {
    return useMemo(() => {
        return (...params: Parameters<typeof roomClient['writingMessageStatus']['update']>) =>
            roomClient.writingMessageStatus.update(...params);
    }, [roomClient.writingMessageStatus]);
};
