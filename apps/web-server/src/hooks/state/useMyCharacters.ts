import { State, characterTemplate } from '@flocon-trpg/core';
import React from 'react';
import { useMyUserUid } from '../useMyUserUid';
import { useCharacters } from './useCharacters';

type CharacterState = State<typeof characterTemplate>;

export const useMyCharacters = (): ReadonlyMap<string, CharacterState> | undefined => {
    const myUserUid = useMyUserUid();
    const characters = useCharacters();
    return React.useMemo(() => {
        if (characters == null) {
            return undefined;
        }
        const result = new Map<string, CharacterState>();
        characters.forEach((value, key) => {
            if (value.ownerParticipantId === myUserUid) {
                result.set(key, value);
            }
        });
        return result;
    }, [characters, myUserUid]);
};
