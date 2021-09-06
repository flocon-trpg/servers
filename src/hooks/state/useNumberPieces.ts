import React from 'react';
import { CompositeKey, compositeKeyEquals, dualKeyRecordToDualKeyMap } from '@kizahasi/util';
import { PieceState } from '@kizahasi/flocon-core';
import { NumberPieceValueElement, useNumberPieceValues } from './useNumberPieceValues';
import { useBooleanOrCompositeKeyMemo } from '../useBooleanOrCompositeKeyMemo';

export type NumberPieceElement = {
    value: NumberPieceValueElement;
    pieceKey: CompositeKey;
    piece: PieceState;
};

export const useNumberPieces = (
    boardKey: CompositeKey | boolean
): ReadonlyArray<NumberPieceElement> | undefined => {
    const boardKeyMemo = useBooleanOrCompositeKeyMemo(boardKey);
    const numberPieceValues = useNumberPieceValues();
    return React.useMemo(() => {
        if (numberPieceValues == null) {
            return undefined;
        }
        return numberPieceValues.flatMap(element => {
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
                            pieceKey: { createdBy: pieceKey.first, id: pieceKey.second },
                            piece,
                        } as const)
                );
        });
    }, [numberPieceValues, boardKeyMemo]);
};
