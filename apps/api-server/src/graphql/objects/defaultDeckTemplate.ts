import {
    State,
    arrayToIndexObjects,
    deckTemplateCardTemplate,
    deckTemplateTemplate,
} from '@flocon-trpg/core';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DefaultDeckTemplate {
    @Field({
        description:
            'DeckTemplateのState。@flocon-trpg/coreのstate(deckTemplateTemplate).parse(...)でdecodeできる。',
    })
    public valueJson!: string;
}

const createPlayingCard = ({
    $index,
    key,
    name,
    imageName,
    description,
}: {
    $index: number;
    key: string;
    name: string;
    imageName: string;
    description?: string;
}): { key: string; value: State<typeof deckTemplateCardTemplate> } => ({
    key,
    value: {
        $v: 1,
        $r: 1,
        $index,
        face: {
            $v: 1,
            $r: 1,
            type: 'FilePath',
            filePath: {
                $v: 1,
                $r: 1,
                sourceType: 'Default',
                path: `/assets/playing-card/${imageName}.png`,
            },
        },
        back: {
            $v: 1,
            $r: 1,
            type: 'FilePath',
            filePath: {
                $v: 1,
                $r: 1,
                sourceType: 'Default',
                path: `/assets/playing-card/back.png`,
            },
        },
        name,
        description,
    },
});

function* createPlayingCards() {
    const suits = [
        { name: 'spade', initial: 's' },
        { name: 'heart', initial: 'h' },
        { name: 'diamond', initial: 'd' },
        { name: 'club', initial: 'c' },
    ];
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];
    let $index = -1;
    for (const suit of suits) {
        for (const number of numbers) {
            $index++;
            yield createPlayingCard({
                $index,
                name: `${suit.name} ${number}`,
                key: `${suit.initial}${number}`,
                imageName: `${suit.initial}${number}`,
            });
        }
    }

    $index++;
    yield createPlayingCard({
        $index,
        name: 'joker',
        key: 'joker',
        imageName: 'joker',
    });

    $index++;
    yield createPlayingCard({
        $index,
        name: 'joker(2)',
        key: 'joker-2',
        imageName: 'joker-2',
    });
}

const playingCardTemplate: State<typeof deckTemplateTemplate> = {
    $v: 1,
    $r: 1,
    cards: arrayToIndexObjects([...createPlayingCards()]),
    name: 'トランプ',
    description: undefined,
    back: undefined,
};

export const defaultDeckTemplates: DefaultDeckTemplate[] = [
    { valueJson: JSON.stringify(playingCardTemplate) },
];
