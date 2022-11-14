import React from 'react';
import { useLatest } from 'react-use';
import { CombinedError } from 'urql';
import { NotificationType } from '../components/models/room/Room/subcomponents/components/Notification/Notification';
import { useRoomClient } from './roomClientHooks';

export const useAddNotification = () => {
    const roomClient = useRoomClient();
    const roomClientRef = useLatest(roomClient);
    return React.useCallback(
        (message: NotificationType<CombinedError>) => {
            return roomClientRef.current.value.messages.addCustomMessage({
                value: message,
                createdAt: new Date().getTime(),
            });
        },
        [roomClientRef]
    );
};
