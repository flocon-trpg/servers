import { UpOperation } from '@kizahasi/flocon-core';
import { useSelector } from '../store';

const emptyOperate = (operation: UpOperation): void => {
    throw new Error('useOperate is not ready');
};

export const useOperate = () => {
    return useSelector(state => state.roomModule.roomState?.operate) ?? emptyOperate;
};
