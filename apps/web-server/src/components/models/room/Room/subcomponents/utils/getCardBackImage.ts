import {
    State,
    boardTemplate,
    cardImageValue,
    deckPieceCardTemplate,
    deckPieceTemplate,
} from '@flocon-trpg/core';
import { Result } from '@kizahasi/result';
import { z } from 'zod';

type BoardState = State<typeof boardTemplate>;
type Card = State<typeof deckPieceCardTemplate>;
type CardGroups = BoardState['cardGroups'];
type CardImageValue = z.TypeOf<typeof cardImageValue>;
export const groupIdIsUndefined = 'groupIdIsUndefined';
export const cardGroupNotFound = 'cardGroupNotFound';
export type GetCardBackImageErrorType =
    | { type: typeof groupIdIsUndefined }
    | {
          type: typeof cardGroupNotFound;
      };

export const getCardBackImage = (
    card: Card,
    cardGroups: CardGroups,
): Result<CardImageValue, GetCardBackImageErrorType> => {
    const groupId = card.groupId;
    if (groupId == null) {
        return Result.error({ type: groupIdIsUndefined });
    }
    if (cardGroups == null) {
        return Result.error({ type: cardGroupNotFound });
    }
    const cardGroup = groupId == null ? undefined : cardGroups[groupId];
    if (cardGroup == null) {
        return Result.error({ type: cardGroupNotFound });
    }
    return Result.ok(cardGroup.back);
};
