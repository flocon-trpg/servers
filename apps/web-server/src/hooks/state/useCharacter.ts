import { CharacterState } from '@flocon-trpg/core';
import { useAtomSelector } from '../../atoms/useAtomSelector';
import { roomAtom } from '../../atoms/room/roomAtom';

export const useCharacter = (characterId: string | undefined): CharacterState | undefined => {
    return useAtomSelector(
        roomAtom,
        state =>
            characterId == null ? undefined : state.roomState?.state?.characters?.[characterId],
        [characterId]
    );
};
