import * as t from 'io-ts';
import { createObjectValueTemplate, createReplaceValueTemplate } from '../../generator';
import * as BoardPosition from '../boardPosition/types';

export const templateValue = {
    ...BoardPosition.templateValue,
    cellH: createReplaceValueTemplate(t.number),
    cellW: createReplaceValueTemplate(t.number),
    cellX: createReplaceValueTemplate(t.number),
    cellY: createReplaceValueTemplate(t.number),
    isCellMode: createReplaceValueTemplate(t.boolean),
};

export const template = createObjectValueTemplate(templateValue, undefined, undefined);
