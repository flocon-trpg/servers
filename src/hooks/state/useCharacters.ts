import React from 'react';
import { recordToMap } from '../../@shared/utils';
import * as Character from '../../@shared/ot/room/participant/character/v1';
import { createStateMap, ReadonlyStateMap } from '../../@shared/StateMap';
import { useParticipants } from './useParticipants';
import { __ } from '../../@shared/collection';

export const useCharacters = (): ReadonlyStateMap<Character.State> | undefined => {
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