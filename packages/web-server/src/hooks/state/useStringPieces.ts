import React from 'react';
import { recordToArray } from '@flocon-trpg/utils';
import { PieceState } from '@flocon-trpg/core';
import { StringPieceValueElement, useStringPieceValues } from './useStringPieceValues';

export type StringPieceElement = {
    value: StringPieceValueElement;
    piece: PieceState;
};

export const useStringPieces = (
    boardId: string | boolean
): ReadonlyArray<StringPieceElement> | undefined => {
    const imagePieceValues = useStringPieceValues();
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
