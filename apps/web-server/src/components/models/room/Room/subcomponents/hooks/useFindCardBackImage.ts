import {
    State,
    boardTemplate,
    cardImageValue,
    deckPieceCardTemplate,
    deckPieceTemplate,
} from '@flocon-trpg/core';
import { Result } from '@kizahasi/result';
import { z } from 'zod';
import { GetCardBackImageErrorType, getCardBackImage } from '../utils/getCardBackImage';
import { UseFindCardErrorType, useFindCard } from './useFindCard';

type DeckPieceState = State<typeof deckPieceTemplate>;
type BoardState = State<typeof boardTemplate>;
type CardGroups = BoardState['cardGroups'];
type CardImageValue = z.TypeOf<typeof cardImageValue>;
export type UseFindCardBackImageErrorType = UseFindCardErrorType | GetCardBackImageErrorType;

export const useFindCardBackImage = (
    state: DeckPieceState,
    cardGroups: CardGroups,
    index: number,
): Result<CardImageValue, UseFindCardBackImageErrorType> => {
    const targetCard = useFindCard(state, index);
    if (targetCard.isError) {
        return targetCard;
    }
    return getCardBackImage(targetCard.value.value, cardGroups);
};
