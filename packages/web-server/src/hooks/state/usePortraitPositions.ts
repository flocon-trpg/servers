import React from 'react';
import { recordToArray } from '@flocon-trpg/utils';
import { useCharacters } from './useCharacters';

export const usePortraitPositions = (boardId: string) => {
    const characters = useCharacters();

    return React.useMemo(() => {
        if (characters == null) {
            return undefined;
        }
        return [...characters].flatMap(([characterId, character]) => {
            return recordToArray(character.portraitPositions)
                .filter(({ value: portraitPosition }) => {
                    return boardId === portraitPosition.boardId;
                })
                .flatMap(({ key: boardPositionId, value: boardPosition }) => {
                    return {
                        characterId,
                        character,
                        boardPositionId,
                        boardPosition,
                    };
                });
        });
    }, [boardId, characters]);
};
