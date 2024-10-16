import { recordToArray } from '@flocon-trpg/utils';
import React from 'react';
import { useCharacters } from './useCharacters';

export const usePortraitPieces = (boardId: string) => {
    const characters = useCharacters();

    return React.useMemo(() => {
        if (characters == null) {
            return undefined;
        }
        return [...characters].flatMap(([characterId, character]) => {
            return recordToArray(character.portraitPieces ?? {})
                .filter(({ value: portraitPiece }) => {
                    return boardId === portraitPiece.boardId;
                })
                .flatMap(({ key: pieceId, value: piece }) => {
                    return {
                        characterId,
                        character,
                        pieceId,
                        piece,
                    };
                });
        });
    }, [boardId, characters]);
};
