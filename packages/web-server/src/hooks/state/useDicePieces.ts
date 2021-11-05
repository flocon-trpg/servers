import React from 'react';
import { CompositeKey, compositeKeyEquals, dualKeyRecordToDualKeyMap } from '@flocon-trpg/utils';
import { PieceState } from '@flocon-trpg/core';
import { DicePieceValueElement, useDicePieceValues } from './useDicePieceValues';
import { useBooleanOrCompositeKeyMemo } from '../useBooleanOrCompositeKeyMemo';

export type DicePieceElement = {
    value: DicePieceValueElement;
    pieceBoardKey: CompositeKey;
    piece: PieceState;
};

export const useDicePieces = (
    boardKey: CompositeKey | boolean
): ReadonlyArray<DicePieceElement> | undefined => {
    const boardKeyMemo = useBooleanOrCompositeKeyMemo(boardKey);
    const dicePieceValues = useDicePieceValues();
    return React.useMemo(() => {
        if (dicePieceValues == null) {
            return undefined;
        }
        return dicePieceValues.flatMap(element => {
            return dualKeyRecordToDualKeyMap<PieceState>(element.value.pieces)
                .toArray()
                .filter(([, piece]) => {
                    if (boardKeyMemo === true || boardKeyMemo === false) {
                        return boardKeyMemo;
                    }
                    return compositeKeyEquals(boardKeyMemo, piece.boardKey);
                })
                .map(
                    ([pieceKey, piece]) =>
                        ({
                            value: element,
                            pieceBoardKey: { createdBy: pieceKey.first, id: pieceKey.second },
                            piece,
                        } as const)
                );
        });
    }, [dicePieceValues, boardKeyMemo]);
};
