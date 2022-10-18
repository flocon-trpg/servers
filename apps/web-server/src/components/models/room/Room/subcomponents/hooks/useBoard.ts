import { State, boardTemplate } from '@flocon-trpg/core';
import { roomAtom } from '@/atoms/roomAtom/roomAtom';
import { useAtomSelector } from '@/hooks/useAtomSelector';

type BoardState = State<typeof boardTemplate>;

export const useBoard = (boardId: string | undefined): BoardState | undefined => {
    return useAtomSelector(
        roomAtom,
        state => {
            if (boardId == null) {
                return undefined;
            }
            return state.roomState?.state?.boards?.[boardId];
        },
        [boardId]
    );
};
