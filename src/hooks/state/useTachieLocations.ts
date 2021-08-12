import React from 'react';
import { CompositeKey, dualKeyRecordToDualKeyMap } from '@kizahasi/util';
import { BoardLocationState } from '@kizahasi/flocon-core';
import { useCharacters } from './useCharacters';
import _ from 'lodash';

export const useTachieLocations = (boardKey: CompositeKey) => {
    const characters = useCharacters();

    return React.useMemo(() => {
        if (characters == null) {
            return undefined;
        }
        return _(characters.toArray())
            .map(([characterKey, character]) => {
                const tachieLocation = _(
                    dualKeyRecordToDualKeyMap<BoardLocationState>(
                        character.tachieLocations
                    ).toArray()
                ).find(([boardKey$]) => {
                    return (
                        boardKey.createdBy === boardKey$.first && boardKey.id === boardKey$.second
                    );
                });
                if (tachieLocation == null) {
                    return null;
                }
                if (tachieLocation == null) {
                    return null;
                }
                const [, tachieLocationValue] = tachieLocation;
                return { characterKey, character, tachieLocation: tachieLocationValue };
            })
            .compact()
            .value();
    }, [boardKey.createdBy, boardKey.id, characters]);
};
