import React from 'react';
import { useParticipants } from './useParticipants';
import { createStateMap, ReadonlyStateMap, recordToMap } from '@kizahasi/util';
import { CharacterState } from '@kizahasi/flocon-core';

export const useCharacters = (): ReadonlyStateMap<CharacterState> | undefined => {
    const participants = useParticipants();
    return React.useMemo(() => {
        if (participants == null) {
            return undefined;
        }
        const source = new Map<string, Map<string, CharacterState>>();
        [...participants].forEach(([key, value]) => {
            source.set(key, recordToMap(value.characters));
        });
        return createStateMap(source);
    }, [participants]);
};