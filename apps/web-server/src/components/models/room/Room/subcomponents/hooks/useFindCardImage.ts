import { State, boardTemplate, cardImageValue, deckPieceTemplate } from '@flocon-trpg/core';
import { Result } from '@kizahasi/result';
import React from 'react';
import { z } from 'zod';
import { useMyUserUid } from '../../../../../../hooks/useMyUserUid';
import { UseFindCardErrorType, useFindCard } from './useFindCard';
import { UseFindCardBackImageErrorType, useFindCardBackImage } from './useFindCardBackImage';
import { useFindCardFaceImage } from './useFindCardFaceImage';

type DeckPieceState = State<typeof deckPieceTemplate>;
type BoardState = State<typeof boardTemplate>;
type CardGroups = BoardState['cardGroups'];
type CardImageValue = z.TypeOf<typeof cardImageValue>;
export type UseFindCardImageErrorType = UseFindCardErrorType;

export const useFindCardImage = (
    state: DeckPieceState,
    cardGroups: CardGroups,
    index: number,
): Result<{ key: string; value: CardImageValue }, UseFindCardBackImageErrorType> => {
    const myUserUid = useMyUserUid();
    const targetCard = useFindCard(state, index);
    const face = useFindCardFaceImage(state, index);
    const back = useFindCardBackImage(state, cardGroups, index);

    return React.useMemo(() => {
        if (targetCard.isError) {
            return targetCard;
        }
        const isTopCardFace =
            targetCard.value.value.revealStatus.type === 'face' ||
            (myUserUid != null && state.revealedTo.includes(myUserUid));
        const imageResult = isTopCardFace ? face : back;
        if (imageResult.isError) {
            return imageResult;
        }
        return Result.ok({ key: targetCard.value.key, value: imageResult.value });
    }, [targetCard, myUserUid, state.revealedTo, face, back]);
};
