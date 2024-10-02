import { RoomClient } from '@flocon-trpg/sdk';
import { useReadonlyBehaviorEvent } from './useReadonlyBehaviorEvent';

export const useWritingMessageStatus = (
    roomClient: Pick<RoomClient<any, any>, 'writingMessageStatus'>,
) => {
    return useReadonlyBehaviorEvent(roomClient.writingMessageStatus.value);
};
