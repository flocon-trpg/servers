import React from 'react';
import { createStateMap, dualKeyRecordForEach, ReadonlyStateMap } from '@kizahasi/util';
import { CharacterState } from '@kizahasi/flocon-core';
import { useSelector } from '../../store';

export const useCharacters = (): ReadonlyStateMap<CharacterState> | undefined => {
    const characters = useSelector(state => state.roomModule.roomState?.state?.characters);
    return React.useMemo(() => {
        if (characters == null) {
            return undefined;
        }
        const result = createStateMap<CharacterState>();
        dualKeyRecordForEach<CharacterState>(characters, (value, key) => {
            result.set({ createdBy: key.first, id: key.second }, value);
        });
        return result;
    }, [characters]);
};
