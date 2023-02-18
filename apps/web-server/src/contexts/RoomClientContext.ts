import { RoomClient } from '@flocon-trpg/sdk';
import { createContext } from 'react';
import { CombinedError } from 'urql';
import { NotificationType } from '@/components/models/room/Room/subcomponents/components/Notification/Notification';

export type RoomClientContextValue = {
    value: RoomClient<NotificationType<CombinedError>, CombinedError>;
    recreate: () => void;
    isMock: boolean;
    roomId: string;
};

export const RoomClientContext = createContext<RoomClientContextValue | null>(null);
