import React from 'react';
import { CompositeKey, compositeKeyEquals, dualKeyRecordToDualKeyMap } from '@flocon-trpg/utils';
import { PieceState } from '@flocon-trpg/core';
import { StringPieceValueElement, useStringPieceValues } from './useStringPieceValues';
import { useBooleanOrCompositeKeyMemo } from '../useBooleanOrCompositeKeyMemo';

export type StringPieceElement = {
    value: StringPieceValueElement;
    pieceBoardKey: CompositeKey;
    piece: PieceState;
};

export const useStringPieces = (
    boardKey: CompositeKey | boolean
): ReadonlyArray<StringPieceElement> | undefined => {
    const boardKeyMemo = useBooleanOrCompositeKeyMemo(boardKey);
    const numberPieceValues = useStringPieceValues();
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
                            pieceBoardKey: { createdBy: pieceKey.first, id: pieceKey.second },
                            piece,
                        } as const)
                );
        });
    }, [numberPieceValues, boardKeyMemo]);
};
