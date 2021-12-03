import { BoardState } from '@flocon-trpg/core';
import { useAtomSelector } from '../../atoms/useAtomSelector';
import { roomAtom } from '../../atoms/room/roomAtom';

export const useBoard = (boardId: string): BoardState | undefined => {
    return useAtomSelector(roomAtom, state => state.roomState?.state?.boards?.[boardId], [boardId]);
};
