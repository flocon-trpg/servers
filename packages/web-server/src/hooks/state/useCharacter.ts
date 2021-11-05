import React from 'react';
import { CompositeKey } from '@flocon-trpg/utils';
import { CharacterState } from '@flocon-trpg/core';
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
