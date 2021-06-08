import React from 'react';
import { CompositeKey, recordForEach } from '@kizahasi/util';
import { DicePieceValueState } from '@kizahasi/flocon-core';
import { useCharacters } from './useCharacters';

export type DicePieceValueElement = {
    characterKey: CompositeKey;
    valueId: string;
    value: DicePieceValueState;
}

export const useDicePieceValues = (): ReadonlyArray<DicePieceValueElement> | undefined => {
    const characters = useCharacters();
    return React.useMemo(() => {
        if (characters == null) {
            return undefined;
        }
        const result: DicePieceValueElement[] = [];
        characters.forEach((character, characterKey) => {
            recordForEach(character.dicePieceValues, (value, key) => {
                result.push({
                    characterKey,
                    valueId: key,
                    value,
                });
            });
        });
        return result;
    }, [characters]);
};