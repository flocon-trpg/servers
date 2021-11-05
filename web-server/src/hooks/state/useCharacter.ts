import React from 'react';
import { CompositeKey } from '@kizahasi/util';
import { CharacterState } from '@kizahasi/flocon-core';
import _ from 'lodash';
import { useCharacters } from './useCharacters';

export const useCharacter = (
    characterKey: CompositeKey | undefined
): CharacterState | undefined => {
    const characters = useCharacters();
    return React.useMemo(() => {
        if (characters == null || characterKey?.createdBy == null || characterKey.id == null) {
            return undefined;
        }
        return characters.get({ createdBy: characterKey.createdBy, id: characterKey.id });
    }, [characters, characterKey?.createdBy, characterKey?.id]);
};
