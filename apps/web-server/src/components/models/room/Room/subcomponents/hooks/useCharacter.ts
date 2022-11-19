import { State, characterTemplate } from '@flocon-trpg/core';
import { useRoomStateValueSelector } from '@/hooks/useRoomStateValueSelector';

type CharacterState = State<typeof characterTemplate>;

export const useCharacter = (characterId: string | undefined): CharacterState | undefined => {
    return (
        useRoomStateValueSelector(
            state => {
                if (characterId == null) {
                    return undefined;
                }
                return state.characters?.[characterId];
            },
            [characterId]
        ) ?? undefined
    );
};
