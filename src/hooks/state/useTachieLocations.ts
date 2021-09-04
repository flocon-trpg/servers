import React from 'react';
import { CompositeKey, compositeKeyEquals, dualKeyRecordToDualKeyMap } from '@kizahasi/util';
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
                ).find(([, tachieLocation]) => {
                    return compositeKeyEquals(
                        // hooksのdepsでエラーが出るのを防ぐため、boardKeyオブジェクトを再生成している
                        { createdBy: boardKey.createdBy, id: boardKey.id },
                        tachieLocation.boardKey
                    );
                });
                if (tachieLocation == null) {
                    return null;
                }
                const [tachieLocationKeyAsDualKey, tachieLocationValue] = tachieLocation;
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
            })
            .compact()
            .value();
    }, [boardKey.createdBy, boardKey.id, characters]);
};
