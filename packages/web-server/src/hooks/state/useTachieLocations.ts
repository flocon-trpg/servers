import React from 'react';
import { CompositeKey, compositeKeyEquals, dualKeyRecordToDualKeyMap } from '@flocon-trpg/utils';
import { BoardLocationState } from '@flocon-trpg/core';
import { useCharacters } from './useCharacters';
import _ from 'lodash';
import { useCompositeKeyMemo } from '../useCompositeKeyMemo';

export const useTachieLocations = (boardKey: CompositeKey) => {
    const characters = useCharacters();
    const boardKeyMemo = useCompositeKeyMemo(boardKey);

    return React.useMemo(() => {
        if (characters == null) {
            return undefined;
        }
        return characters.toArray().flatMap(([characterKey, character]) => {
            return dualKeyRecordToDualKeyMap<BoardLocationState>(character.tachieLocations)
                .toArray()
                .filter(([, tachieLocation]) => {
                    return compositeKeyEquals(boardKeyMemo, tachieLocation.boardKey);
                })
                .flatMap(([tachieLocationKeyAsDualKey, tachieLocationValue]) => {
                    const tachieLocationKey: CompositeKey = {
                        createdBy: tachieLocationKeyAsDualKey.first,
                        id: tachieLocationKeyAsDualKey.second,
                    };
                    return {
                        characterKey,
                        character,
                        tachieLocationKey,
                        tachieLocation: tachieLocationValue,
                    };
                });
        });
    }, [boardKeyMemo, characters]);
};
