import { createObjectValueTemplate, createRecordValueTemplate } from '../../../generator/types';
import * as Card from '../board/deckPiece/card/types';

const board = createObjectValueTemplate(
    {
        cards: createRecordValueTemplate(Card.statTemplate),
    },
    1,
    1,
);

const templateValue = {
    boards: createRecordValueTemplate(board),
};

export const template = createObjectValueTemplate(templateValue, 1, 1);
