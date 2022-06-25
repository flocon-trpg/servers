import { State, boardTemplate } from '@flocon-trpg/core';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { roomAtom } from '@/atoms/roomAtom/roomAtom';

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
