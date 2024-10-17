import { State, characterTemplate, strIndex10Array } from '@flocon-trpg/core';
import { recordToMap } from '@flocon-trpg/utils';
import React from 'react';
import { CharacterTagFilter } from '@/atoms/roomConfigAtom/types/characterTagFilter';
import { useRoomStateValueSelector } from '@/hooks/useRoomStateValueSelector';

type CharacterState = State<typeof characterTemplate>;

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
    const charactersRecord = useRoomStateValueSelector(state => state.characters);
    return React.useMemo(() => {
        if (charactersRecord == null) {
            return new Map<string, CharacterState>();
        }
        if (filter == null) {
            return recordToMap(charactersRecord);
        }

        const map = recordToMap(charactersRecord);
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
    }, [charactersRecord, filter]);
};
