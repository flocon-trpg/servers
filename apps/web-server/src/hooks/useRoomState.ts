import * as SDK from '@flocon-trpg/sdk-react';
import { useRoomClient } from './roomClientHooks';

export const useRoomState = () => {
    const roomClient = useRoomClient();
    return SDK.useRoomState(roomClient.value);
};
