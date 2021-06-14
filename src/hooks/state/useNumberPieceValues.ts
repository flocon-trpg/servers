import React from 'react';
import { CompositeKey, recordForEach } from '@kizahasi/util';
import { NumberPieceValueState } from '@kizahasi/flocon-core';
import { useCharacters } from './useCharacters';

export type NumberPieceValueElement = {
    characterKey: CompositeKey;
    valueId: string;
    value: NumberPieceValueState;
}

export const useNumberPieceValues = (): ReadonlyArray<NumberPieceValueElement> | undefined => {
    const characters = useCharacters();
    return React.useMemo(() => {
        if (characters == null) {
            return undefined;
        }
        const result: NumberPieceValueElement[] = [];
        characters.forEach((character, characterKey) => {
            recordForEach(character.numberPieceValues, (value, key) => {
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