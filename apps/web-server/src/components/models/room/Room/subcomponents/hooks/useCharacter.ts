import { useAtomSelector } from '../../../../../../hooks/useAtomSelector';
import { roomAtom } from '../../../../../../atoms/roomAtom/roomAtom';
import { State, characterTemplate } from '@flocon-trpg/core';

type CharacterState = State<typeof characterTemplate>;

export const useCharacter = (characterId: string | undefined): CharacterState | undefined => {
    return useAtomSelector(
        roomAtom,
        state =>
            characterId == null ? undefined : state.roomState?.state?.characters?.[characterId],
        [characterId]
    );
};
