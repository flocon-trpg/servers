import { keyNames, recordToArray } from '@flocon-trpg/utils';
import { flatten, sortBy } from 'es-toolkit';
import React from 'react';
import { useCharacters } from './useCharacters';

export const useCharacterPieces = (boardId: string) => {
    const characters = useCharacters();

    return React.useMemo(() => {
        if (characters == null) {
            return undefined;
        }
        const mapped = [...characters].map(([characterId, character]) => {
            return recordToArray(character.pieces ?? {})
                .filter(({ value }) => {
                    return value.boardId === boardId;
                })
                .map(({ value, key }) => {
                    return { characterId, character, pieceId: key, piece: value };
                });
        });
        const flattened = flatten(mapped);
        return sortBy(flattened, [x => keyNames(x.characterId, x.pieceId)]);
    }, [boardId, characters]);
};
