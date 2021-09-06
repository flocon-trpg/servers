import React from 'react';
import { CompositeKey, compositeKeyEquals, dualKeyRecordToDualKeyMap } from '@kizahasi/util';
import { PieceState } from '@kizahasi/flocon-core';
import { ImagePieceValueElement, useImagePieceValues } from './useImagePieceValues';
import { useBooleanOrCompositeKeyMemo } from '../useBooleanOrCompositeKeyMemo';

export type ImagePieceElement = {
    value: ImagePieceValueElement;
    pieceKey: CompositeKey;
    piece: PieceState;
};

export const useImagePieces = (
    boardKey: CompositeKey | boolean
): ReadonlyArray<ImagePieceElement> | undefined => {
    const boardKeyMemo = useBooleanOrCompositeKeyMemo(boardKey);
    const imagePieceValues = useImagePieceValues();
    return React.useMemo(() => {
        if (imagePieceValues == null) {
            return undefined;
        }
        return imagePieceValues.flatMap(element => {
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
    }, [imagePieceValues, boardKeyMemo]);
};
