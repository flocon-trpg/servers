import { RoomClient } from '@flocon-trpg/sdk';
import { useReadonlyBehaviorStream } from './useReadonlyBehaviorEvent';

export const useWritingMessageStatus = (
    roomClient: Pick<RoomClient<any, any>, 'writingMessageStatus'>
) => {
    return useReadonlyBehaviorStream(roomClient.writingMessageStatus.value);
};
