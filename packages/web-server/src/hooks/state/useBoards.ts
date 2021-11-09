import { ReadonlyStateMap } from '@flocon-trpg/utils';
import { BoardState } from '@flocon-trpg/core';
import { useCreateStateMap } from '../useCreateStateMap';
import { roomAtom } from '../../atoms/room/roomAtom';
import { useAtomSelector } from '../../atoms/useAtomSelector';

export const useBoards = (): ReadonlyStateMap<BoardState> | undefined => {
    const participants = useAtomSelector(roomAtom, state => state.roomState?.state?.participants);
    return useCreateStateMap(participants ?? {}, x => x.boards);
};
