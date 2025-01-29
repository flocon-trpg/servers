import {
    createObjectValueTemplate,
    createRecordValueTemplate,
    createTextValueTemplate,
} from '../../generator/types';
import * as Card from './card/types';

export const FilePath = 'FilePath';

const templateValue = {
    cards: createRecordValueTemplate(Card.template),

    name: createTextValueTemplate(true),

    description: createTextValueTemplate(true),
};

export const template = createObjectValueTemplate(templateValue, 1, 1);
