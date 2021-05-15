import React from 'react';
import { Room } from '../stateManagers/states/room';
import { useSelector } from '../store';
import * as RoomModule from '../@shared/ot/room/v1';

const emptyOperate = (operation: RoomModule.UpOperation): void => {
    throw 'useOperate is not ready';
};

export const useOperate = () => {
    return useSelector(state => state.roomModule.roomState?.operate) ?? emptyOperate;
};