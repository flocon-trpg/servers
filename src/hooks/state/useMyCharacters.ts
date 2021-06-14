import { CharacterState } from '@kizahasi/flocon-core';
import { dualKeyRecordForEach } from '@kizahasi/util';
import React from 'react';
import { useSelector } from '../../store';
import { useMe } from '../useMe';

export const useMyCharacters = (): ReadonlyMap<string, CharacterState> | undefined => {
    const { userUid: myUserUid } = useMe();
    const characters = useSelector(state => state.roomModule.roomState?.state?.characters);
    return React.useMemo(() => {
        if (characters == null) {
            return undefined;
        }
        const result = new Map<string, CharacterState>();
        dualKeyRecordForEach<CharacterState>(characters, (value, key) => {
            if (key.first !== myUserUid) {
                return;
            }
            result.set(key.second, value);
        });
        return result;
    }, [characters, myUserUid]);
};