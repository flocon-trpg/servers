import { State } from '@kizahasi/flocon-core';
import { useSelector } from '../store';

const emptyOperateAsState = (state: State): void => {
    throw new Error('useOperateAsState is not ready');
};

export const useOperateAsState = () => {
    return useSelector(state => state.roomModule.roomState?.operateAsState) ?? emptyOperateAsState;
};
