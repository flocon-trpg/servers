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
import { useCompositeKeyMemo } from '../useCompositeKeyMemo';

export const useCharacterPieces = (boardKey: CompositeKey) => {
    const characters = useCharacters();
    const boardKeyMemo = useCompositeKeyMemo(boardKey);

    return React.useMemo(() => {
        if (characters == null) {
            return undefined;
        }
        return _(characters.toArray())
            .flatMap(([characterKey, character]) => {
                return dualKeyRecordToDualKeyMap<PieceState>(character.pieces)
                    .toArray()
                    .filter(([, piece]) => {
                        return compositeKeyEquals(boardKeyMemo, piece.boardKey);
                    })
                    .map(([pieceKeyAsDualKey, pieceValue]) => {
                        const pieceKey: CompositeKey = {
                            createdBy: pieceKeyAsDualKey.first,
                            id: pieceKeyAsDualKey.second,
                        };
                        return { characterKey, character, pieceKey, piece: pieceValue };
                    });
            })
            .sortBy(x => keyNames(x.characterKey, x.pieceKey))
            .value();
    }, [boardKeyMemo, characters]);
};
