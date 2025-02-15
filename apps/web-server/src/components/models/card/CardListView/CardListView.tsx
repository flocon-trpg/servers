/** @jsxImportSource @emotion/react */
import {
    State,
    boardTemplate,
    deckPieceCardTemplate,
    deckTemplateCardTemplate,
} from '@flocon-trpg/core';
import { recordToArray } from '@flocon-trpg/utils';
import React from 'react';
import { DeckPieceCardView, DeckTemplateEditorView } from '../Card/CardView';
type DeckTemplateCardsState = Record<string, State<typeof deckTemplateCardTemplate> | undefined>;
type DeckPieceCardsState = Record<string, State<typeof deckPieceCardTemplate> | undefined>;
type BoardState = State<typeof boardTemplate>;
type CardGroups = BoardState['cardGroups'];

export type DeckTemplateCardListViewProps = {
    cards: DeckTemplateCardsState;
    onChange: (newValue: DeckTemplateCardsState) => void;
};

export const DeckTemplateCardListView: React.FC<DeckTemplateCardListViewProps> = ({
    cards,
    onChange,
}) => {
    const onChangeRef = React.useRef(onChange);
    const cardsArray = React.useMemo(() => {
        return recordToArray(cards).map(card => (
            <DeckTemplateEditorView
                key={card.key}
                card={card.value}
                onChange={newValue => {
                    onChangeRef.current({ ...cards, [card.key]: newValue });
                }}
            />
        ));
    }, [cards]);

    return <div>{cardsArray}</div>;
};

export type DeckPieceCardListViewProps = {
    cards: DeckPieceCardsState;
    cardGroups: CardGroups;
    onChange: (newValue: DeckPieceCardsState) => void;
};

export const DeckPieceCardListView: React.FC<DeckPieceCardListViewProps> = ({
    cards,
    cardGroups,
    onChange,
}) => {
    const onChangeRef = React.useRef(onChange);
    const cardsArray = React.useMemo(() => {
        return recordToArray(cards).map(card => (
            <DeckPieceCardView
                key={card.key}
                card={card.value}
                cardGroups={cardGroups}
                onChange={newValue => {
                    onChangeRef.current({ ...cards, [card.key]: newValue });
                }}
            />
        ));
    }, [cardGroups, cards]);

    return <div>{cardsArray}</div>;
};
