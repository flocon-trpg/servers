import React from 'react';
import { useMyCharacters } from './useMyCharacters';

export const useIsMyCharacter = () => {
    const myCharacters = useMyCharacters();
    return React.useCallback(
        (characterId: string | undefined) => {
            if (characterId == null) {
                return false;
            }
            return myCharacters?.has(characterId) ?? false;
        },
        [myCharacters],
    );
};
