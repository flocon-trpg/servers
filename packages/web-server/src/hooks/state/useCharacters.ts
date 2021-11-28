import { useAtomSelector } from '../../atoms/useAtomSelector';
import { roomAtom } from '../../atoms/room/roomAtom';
import React from 'react';
import { recordToMap } from '@flocon-trpg/utils';
import { CharacterState } from '@flocon-trpg/core';

export const useCharacters = (): ReadonlyMap<string, CharacterState> => {
    const record = useAtomSelector(roomAtom, state => state.roomState?.state?.characters);
    return React.useMemo(
        () => (record == null ? new Map<string, CharacterState>() : recordToMap(record)),
        [record]
    );
};
