import { UpOperation, roomTemplate } from '@flocon-trpg/core';
import { useRoomState } from '@/hooks/useRoomState';

const emptyOperate = (operation: UpOperation<typeof roomTemplate>): void => {
    throw new Error('useSetRoomStateByApply is not ready');
};

export const useSetRoomStateByApply = () => {
    const roomState = useRoomState();
    if (roomState.type !== 'joined') {
        return emptyOperate;
    }
    return roomState.setStateByApply;
};
