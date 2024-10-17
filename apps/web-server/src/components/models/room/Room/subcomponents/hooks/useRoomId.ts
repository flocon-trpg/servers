import { useRoomClient } from '@/hooks/roomClientHooks';

export const useRoomId = () => {
    const roomClient = useRoomClient();
    return roomClient.roomId;
};
