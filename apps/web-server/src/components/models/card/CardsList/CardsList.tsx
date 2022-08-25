/** @jsxImportSource @emotion/react */
import { State, deckTemplateTemplate } from '@flocon-trpg/core';
import { recordToArray } from '@flocon-trpg/utils';
import React from 'react';
import { Card } from '../Card/Card';

type DeckTemplateState = State<typeof deckTemplateTemplate>;
type CardsState = NonNullable<DeckTemplateState['cards']>;

export type Props = {
    cards: CardsState;
    onChange: (newValue: CardsState) => void;
};

export const CardsList: React.FC<Props> = ({ cards, onChange }) => {
    const onChangeRef = React.useRef(onChange);
    const cardsArray = React.useMemo(() => {
        return recordToArray(cards).map(card => (
            <Card
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
