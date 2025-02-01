import { State, deckPieceTemplate, indexObjectsToArray } from '@flocon-trpg/core';
import React from 'react';

type DeckPieceState = State<typeof deckPieceTemplate>;

export const useCardArray = (state: DeckPieceState) => {
    return React.useMemo(() => {
        return indexObjectsToArray(state.cards ?? {});
    }, [state?.cards]);
};
