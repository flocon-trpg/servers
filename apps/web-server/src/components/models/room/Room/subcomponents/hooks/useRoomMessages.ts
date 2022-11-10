import * as SDK from '@flocon-trpg/sdk-react';
import { Message } from '@flocon-trpg/web-server-utils';
import { CombinedError } from 'urql';
import { NotificationType } from '@/components/models/room/Room/subcomponents/components/Notification/Notification';
import { useRoomClient } from '@/hooks/roomClientHooks';

type ResultType = ReturnType<
    typeof SDK.useRoomMessages<NotificationType<CombinedError>, CombinedError>
>;

export const useRoomMessages = ({
    filter,
}: {
    filter?: (message: Message<NotificationType<CombinedError>>) => boolean;
}): ResultType => {
    const roomClient = useRoomClient();
    return SDK.useRoomMessages(roomClient.value, filter);
};
