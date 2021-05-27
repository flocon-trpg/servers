import { UpOperation } from '@kizahasi/flocon-core';
import React from 'react';
import { Room } from '../stateManagers/states/room';
import { useSelector } from '../store';

const emptyOperate = (operation: UpOperation): void => {
    throw 'useOperate is not ready';
};

export const useOperate = () => {
    return useSelector(state => state.roomModule.roomState?.operate) ?? emptyOperate;
};