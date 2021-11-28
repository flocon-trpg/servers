import React from 'react';
import { recordToArray } from '@flocon-trpg/utils';
import { PieceState } from '@flocon-trpg/core';
import { DicePieceValueElement, useDicePieceValues } from './useDicePieceValues';

export type DicePieceElement = {
    value: DicePieceValueElement;
    piece: PieceState;
};

export const useDicePieces = (
    boardId: string | boolean
): ReadonlyArray<DicePieceElement> | undefined => {
    const dicePieceValues = useDicePieceValues();
    return React.useMemo(() => {
        if (dicePieceValues == null) {
            return undefined;
        }
        return dicePieceValues.flatMap(element => {
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
    }, [boardId, dicePieceValues]);
};
