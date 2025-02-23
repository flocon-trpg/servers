import { State, deckPieceCardTemplate, deckPieceTemplate } from '@flocon-trpg/core';
import { Result } from '@kizahasi/result';
import { useCardArray } from './useCardArray';

type DeckPieceState = State<typeof deckPieceTemplate>;
type Card = State<typeof deckPieceCardTemplate>;
export const invalidIndexObject = 'invalidIndexObject';
export const indexOutOfRange = 'indexOutOfRange';
export type UseFindCardErrorType =
    | {
          type: typeof invalidIndexObject;
          message: string;
      }
    | {
          type: typeof indexOutOfRange;
          index: number;
          cardsLength: number;
      };

export const useFindCard = (
    state: DeckPieceState,
    index: number,
): Result<{ key: string; value: Card }, UseFindCardErrorType> => {
    const cards = useCardArray(state);
    if (cards.isError) {
        return Result.error({
            type: invalidIndexObject,
            message: cards.error,
        });
    }
    const targetCard = cards.value[index];
    if (targetCard == null) {
        return Result.error({
            type: indexOutOfRange,
            index,
            cardsLength: cards.value.length,
        });
    }
    return Result.ok(targetCard);
};
