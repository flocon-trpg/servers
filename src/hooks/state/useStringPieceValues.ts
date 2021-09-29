import React from 'react';
import { CompositeKey, keyNames, recordForEach } from '@kizahasi/util';
import { StringPieceValueState } from '@kizahasi/flocon-core';
import { useCharacters } from './useCharacters';
import _ from 'lodash';

export type StringPieceValueElement = {
    characterKey: CompositeKey;
    valueId: string;
    value: StringPieceValueState;
};

export const useStringPieceValues = (): ReadonlyArray<StringPieceValueElement> | undefined => {
    const characters = useCharacters();
    return React.useMemo(() => {
        if (characters == null) {
            return undefined;
        }
        const result: StringPieceValueElement[] = [];
        characters.forEach((character, characterKey) => {
            recordForEach(character.stringPieceValues, (value, key) => {
                result.push({
                    characterKey,
                    valueId: key,
                    value,
                });
            });
        });
        return _(result)
            .sortBy(x => keyNames(x.characterKey, x.valueId))
            .value();
    }, [characters]);
};
