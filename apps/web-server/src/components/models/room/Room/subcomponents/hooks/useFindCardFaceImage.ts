import { State, boardTemplate, cardImageValue, deckPieceTemplate } from '@flocon-trpg/core';
import { Result } from '@kizahasi/result';
import React from 'react';
import { z } from 'zod';
import { UseFindCardErrorType, useFindCard } from './useFindCard';

type DeckPieceState = State<typeof deckPieceTemplate>;
type CardImageValue = z.TypeOf<typeof cardImageValue>;
type UseFindCardFaceImageErrorType = UseFindCardErrorType;

export const useFindCardFaceImage = (
    state: DeckPieceState,
    index: number,
): Result<CardImageValue, UseFindCardFaceImageErrorType> => {
    const targetCard = useFindCard(state, index);
    if (targetCard.isError) {
        return targetCard;
    }
    const face: CardImageValue = targetCard.value.value.face ?? {
        $v: 1,
        $r: 1,
        type: 'FilePath',
        filePath: {
            $v: 1,
            $r: 1,
            // TODO: 後で設定する
            path: 'https://dummyimage.com/300x200',
            sourceType: 'Default',
        },
    };
    return Result.ok(face);
};
