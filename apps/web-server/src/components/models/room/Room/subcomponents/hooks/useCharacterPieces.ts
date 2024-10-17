import { keyNames, recordToArray } from '@flocon-trpg/utils';
import _ from 'lodash';
import React from 'react';
import { useCharacters } from './useCharacters';

export const useCharacterPieces = (boardId: string) => {
    const characters = useCharacters();

    return React.useMemo(() => {
        if (characters == null) {
            return undefined;
        }
        return _([...characters])
            .flatMap(([characterId, character]) => {
                return recordToArray(character.pieces ?? {})
                    .filter(({ value }) => {
                        return value.boardId === boardId;
                    })
                    .map(({ value, key }) => {
                        return { characterId, character, pieceId: key, piece: value };
                    });
            })
            .sortBy(x => keyNames(x.characterId, x.pieceId))
            .value();
    }, [boardId, characters]);
};
