import { useAtomSelector } from '../../atoms/useAtomSelector';
import { roomAtom } from '../../atoms/room/roomAtom';
import React from 'react';
import { recordToMap } from '@flocon-trpg/utils';
import { CharacterState, strIndex10Array } from '@flocon-trpg/core';
import { CharacterTagFilter } from '../../atoms/roomConfig/types/characterTagFilter';

const hasAnyTag = (character: CharacterState): boolean => {
    return (
        character.hasTag1 ||
        character.hasTag2 ||
        character.hasTag3 ||
        character.hasTag4 ||
        character.hasTag5 ||
        character.hasTag6 ||
        character.hasTag7 ||
        character.hasTag8 ||
        character.hasTag9 ||
        character.hasTag10
    );
};

export const useCharacters = (filter?: CharacterTagFilter): ReadonlyMap<string, CharacterState> => {
    const recordOrMap = useAtomSelector(
        roomAtom,
        state => {
            const characters = state.roomState?.state?.characters;

            if (characters == null || filter == null) {
                return characters;
            }

            const map = recordToMap(characters);
            [...map].forEach(([key, value]) => {
                if (filter.showNoTag && !hasAnyTag(value)) {
                    return;
                }
                for (const index of strIndex10Array) {
                    if (filter[`showTag${index}`] && value[`hasTag${index}`]) {
                        return;
                    }
                }
                map.delete(key);
            });
            return map;
        },
        [filter]
    );
    return React.useMemo(() => {
        if (recordOrMap == null) {
            return new Map<string, CharacterState>();
        }
        if (recordOrMap instanceof Map) {
            return recordOrMap;
        }
        return recordToMap(recordOrMap);
    }, [recordOrMap]);
};
