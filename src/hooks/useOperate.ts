import React from 'react';
import { Room } from '../stateManagers/states/room';
import { useSelector } from '../store';

const emptyOperate = (operation: Room.PostOperationSetup): void => {
    throw 'useOperate is not ready';
};

export const useOperate = () => {
    return useSelector(state => state.roomModule.roomState?.operate) ?? emptyOperate;
};