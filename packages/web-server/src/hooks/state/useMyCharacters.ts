import { CharacterState } from '@flocon-trpg/core';
import { recordForEach } from '@flocon-trpg/utils';
import React from 'react';
import { useSelector } from '../../store';
import { useMyUserUid } from '../useMyUserUid';

export const useMyCharacters = (): ReadonlyMap<string, CharacterState> | undefined => {
    const myUserUid = useMyUserUid();
    const characters = useSelector(
        state => state.roomModule.roomState?.state?.participants?.[myUserUid ?? '']?.characters
    );
    return React.useMemo(() => {
        if (characters == null) {
            return undefined;
        }
        const result = new Map<string, CharacterState>();
        recordForEach<CharacterState>(characters, (value, key) => {
            result.set(key, value);
        });
        return result;
    }, [characters]);
};
