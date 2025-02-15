import {
    State,
    boardTemplate,
    deckPieceCardTemplate,
    deckTemplateCardTemplate,
} from '@flocon-trpg/core';
import classNames from 'classnames';
import { produce } from 'immer';
import React from 'react';
import { useGetCardBackImage } from '../../room/Room/subcomponents/hooks/useGetCardBackImage';
import { CardDescription } from './subcomponents/components/CardDescriptionView/CardDescriptionView';
import { CardImageView } from './subcomponents/components/CardImageView/CardImageView';
import { CardName } from './subcomponents/components/CardNameView/CardNameView';
import { Table } from '@/components/ui/Table/Table';
import { flex, flexColumn } from '@/styles/className';

type DeckTemplateCardState = State<typeof deckTemplateCardTemplate>;
type DeckPieceCardState = State<typeof deckPieceCardTemplate>;
type BoardState = State<typeof boardTemplate>;
type CardGroups = BoardState['cardGroups'];

export type DeckTemplateCardViewProps = {
    card: DeckTemplateCardState;
    /** nullishの場合は読み取り専用モードになります。 */
    onChange?: (newValue: DeckTemplateCardState) => void;
};

export const DeckTemplateEditorView: React.FC<DeckTemplateCardViewProps> = ({ card, onChange }) => {
    return (
        <div className={classNames(flex, flexColumn)}>
            <CardImageView
                type="template"
                image={card.face}
                onChange={image => {
                    const newCard = produce(card, card => {
                        card.face = image;
                    });
                    onChange && onChange(newCard);
                }}
            />
            <CardImageView
                type="template"
                image={card.back}
                onChange={image => {
                    const newCard = produce(card, card => {
                        card.back = image;
                    });
                    onChange && onChange(newCard);
                }}
            />

            <Table>
                <CardName
                    name={card.name}
                    onChange={newValue => {
                        const newCard = produce(card, card => {
                            card.name = newValue;
                        });
                        onChange && onChange(newCard);
                    }}
                />
                <CardDescription
                    description={card.description}
                    onChange={newValue => {
                        const newCard = produce(card, card => {
                            card.description = newValue;
                        });
                        onChange && onChange(newCard);
                    }}
                />
            </Table>
        </div>
    );
};

export type DeckPieceCardViewProps = {
    card: DeckPieceCardState;
    cardGroups: CardGroups;
    /** nullishの場合は読み取り専用モードになります。 */
    onChange?: (newValue: DeckPieceCardState) => void;
};

export const DeckPieceCardView: React.FC<DeckPieceCardViewProps> = ({
    card,
    cardGroups,
    onChange,
}) => {
    const back = useGetCardBackImage(card, cardGroups);
    return (
        <div className={classNames(flex, flexColumn)}>
            <div>
                {
                    'もしカードが表になっていないときは、そのカードの表面の画像を変更することはできません。'
                }
            </div>
            <CardImageView
                type="piece"
                image={card.face}
                onChange={image => {
                    const newCard = produce(card, card => {
                        card.face = image;
                    });
                    onChange && onChange(newCard);
                }}
            />
            <CardImageView
                type="piece"
                image={back.value}
                // TODO: 画像を変更するボタンを追加するか、変更する方法の説明を追加する
                onChange={null}
            />

            <Table>
                <CardName
                    name={card.name}
                    onChange={newValue => {
                        const newCard = produce(card, card => {
                            card.name = newValue;
                        });
                        onChange && onChange(newCard);
                    }}
                />
                <CardDescription
                    description={card.description}
                    onChange={newValue => {
                        const newCard = produce(card, card => {
                            card.description = newValue;
                        });
                        onChange && onChange(newCard);
                    }}
                />
            </Table>
        </div>
    );
};
