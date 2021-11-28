import React from 'react';
import { useMyCharacters } from './useMyCharacters';

export const useIsMyCharacter = () => {
    const myCharacter = useMyCharacters();
    return React.useCallback(
        (characterId: string | undefined) => {
            if (characterId == null) {
                return false;
            }
            return myCharacter?.has(characterId) ?? false;
        },
        [myCharacter]
    );
};
