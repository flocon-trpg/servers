import { UpOperation, roomTemplate } from '@flocon-trpg/core';
import { useRoomState } from '@/hooks/useRoomState';

type Result = (operation: UpOperation<typeof roomTemplate>) => void;

const emptyOperate: Result = () => {
    throw new Error('useSetRoomStateByApply is not ready');
};

export const useSetRoomStateByApply = (): Result => {
    const roomState = useRoomState();
    if (roomState.type !== 'joined') {
        return emptyOperate;
    }
    return roomState.setStateByApply;
};
