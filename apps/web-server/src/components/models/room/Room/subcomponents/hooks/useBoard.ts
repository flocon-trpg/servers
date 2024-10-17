import { State, boardTemplate } from '@flocon-trpg/core';
import { useRoomStateValueSelector } from '@/hooks/useRoomStateValueSelector';

type BoardState = State<typeof boardTemplate>;

export const useBoard = (boardId: string | undefined): BoardState | undefined => {
    return (
        useRoomStateValueSelector(
            state => {
                if (boardId == null) {
                    return undefined;
                }
                return state.boards?.[boardId];
            },
            [boardId],
        ) ?? undefined
    );
};
