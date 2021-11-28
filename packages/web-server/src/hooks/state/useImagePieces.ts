import React from 'react';
import { PieceState } from '@flocon-trpg/core';
import { ImagePieceValueElement, useImagePieceValues } from './useImagePieceValues';
import { recordToArray } from '@flocon-trpg/utils';

export type ImagePieceElement = {
    value: ImagePieceValueElement;
    piece: PieceState;
};

export const useImagePieces = (
    boardId: string | boolean
): ReadonlyArray<ImagePieceElement> | undefined => {
    const imagePieceValues = useImagePieceValues();
    return React.useMemo(() => {
        if (imagePieceValues == null) {
            return undefined;
        }
        return imagePieceValues.flatMap(element => {
            return recordToArray(element.value.pieces)
                .filter(({ value: piece }) => {
                    if (boardId === true || boardId === false) {
                        return boardId;
                    }
                    return boardId === piece.boardId;
                })
                .map(
                    ({ value: piece }) =>
                        ({
                            value: element,
                            piece,
                        } as const)
                );
        });
    }, [boardId, imagePieceValues]);
};
