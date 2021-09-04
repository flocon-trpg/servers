import React from 'react';
import {
    CompositeKey,
    compositeKeyEquals,
    dualKeyRecordToDualKeyMap,
    keyNames,
} from '@kizahasi/util';
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
                    .find(([, piece]) => {
                        return compositeKeyEquals(
                            // hooksのdepsでエラーが出るのを防ぐため、boardKeyオブジェクトを再生成している
                            { createdBy: boardKey.createdBy, id: boardKey.id },
                            piece.boardKey
                        );
                    });
                if (piece == null) {
                    return null;
                }
                const [pieceKeyAsDualKey, pieceValue] = piece;
                const pieceKey: CompositeKey = {
                    createdBy: pieceKeyAsDualKey.first,
                    id: pieceKeyAsDualKey.second,
                };
                return { characterKey, character, pieceKey, piece: pieceValue };
            })
            .compact()
            .sortBy(x => keyNames(x.characterKey, x.pieceKey))
            .value();
    }, [boardKey.createdBy, boardKey.id, characters]);
};
