import { State } from '@flocon-trpg/core';
import { atom, useAtom } from 'jotai';
import { roomAtom } from '../atoms/room/roomAtom';

const emptyOperateAsState = (state: State | ((prevState: State) => State)): void => {
    throw new Error('useOperateAsState is not ready');
};

const operateAsStateAtom = atom(get => get(roomAtom).roomState?.operateAsState);

export const useOperateAsState = () => {
    const [result] = useAtom(operateAsStateAtom);
    return result ?? emptyOperateAsState;
};
