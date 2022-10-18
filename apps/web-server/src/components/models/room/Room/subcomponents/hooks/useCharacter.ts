import { State, characterTemplate } from '@flocon-trpg/core';
import { roomAtom } from '@/atoms/roomAtom/roomAtom';
import { useAtomSelector } from '@/hooks/useAtomSelector';

type CharacterState = State<typeof characterTemplate>;

export const useCharacter = (characterId: string | undefined): CharacterState | undefined => {
    return useAtomSelector(
        roomAtom,
        state =>
            characterId == null ? undefined : state.roomState?.state?.characters?.[characterId],
        [characterId]
    );
};
