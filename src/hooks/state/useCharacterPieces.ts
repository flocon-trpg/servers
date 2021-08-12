import React from 'react';
import { CompositeKey, dualKeyRecordToDualKeyMap, keyNames } from '@kizahasi/util';
import { PieceState } from '@kizahasi/flocon-core';
import { useCharacters } from './useCharacters';
import _ from 'lodash';

export const useCharacterPieces = (boardKey: CompositeKey) => {
    const characters = useCharacters();

    return React.useMemo(() => {
        if (characters == null) {
            return undefined;
        }
        return _(characters.toArray())
            .map(([characterKey, character]) => {
                const piece = dualKeyRecordToDualKeyMap<PieceState>(character.pieces)
                    .toArray()
                    .find(([boardKey$]) => {
                        return (
                            boardKey.createdBy === boardKey$.first &&
                            boardKey.id === boardKey$.second
                        );
                    });
                if (piece == null) {
                    return null;
                }
                const [pieceKey, pieceValue] = piece;
                return { characterKey, character, pieceKey, piece: pieceValue };
            })
            .compact()
            .sortBy(x => keyNames(x.characterKey, x.pieceKey))
            .value();
    }, [boardKey.createdBy, boardKey.id, characters]);
};
