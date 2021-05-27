import React from 'react';
import { useParticipants } from './useParticipants';
import { createStateMap, ReadonlyStateMap, recordToMap, __ } from '@kizahasi/util';
import { CharacterState } from '@kizahasi/flocon-core';

export const useCharacters = (): ReadonlyStateMap<CharacterState> | undefined => {
    const participants = useParticipants();
    return React.useMemo(() => {
        if (participants == null) {
            return undefined;
        }
        const source = __(participants).map(([key, value]) => {
            return { key, value: recordToMap(value.characters) };
        }).toMap(x => x);
        return createStateMap(source);
    }, [participants]);
};