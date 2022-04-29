import { State, boardTemplate } from '@flocon-trpg/core';
import { useAtomSelector } from '../../atoms/useAtomSelector';
import { roomAtom } from '../../atoms/room/roomAtom';

type BoardState = State<typeof boardTemplate>;

export const useBoard = (boardId: string): BoardState | undefined => {
    return useAtomSelector(roomAtom, state => state.roomState?.state?.boards?.[boardId], [boardId]);
};
