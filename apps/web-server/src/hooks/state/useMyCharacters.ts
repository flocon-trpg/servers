import { CharacterState } from '@flocon-trpg/core';
import React from 'react';
import { useMyUserUid } from '../useMyUserUid';
import { useCharacters } from './useCharacters';

export const useMyCharacters = (): ReadonlyMap<string, CharacterState> | undefined => {
    const myUserUid = useMyUserUid();
    const caracters = useCharacters();
    return React.useMemo(() => {
        if (caracters == null) {
            return undefined;
        }
        const result = new Map<string, CharacterState>();
        caracters.forEach((value, key) => {
            if (value.ownerParticipantId === myUserUid) {
                result.set(key, value);
            }
        });
        return result;
    }, [caracters, myUserUid]);
};
