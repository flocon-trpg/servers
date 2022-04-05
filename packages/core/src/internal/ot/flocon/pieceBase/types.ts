import * as t from 'io-ts';
import * as BoardPosition from '../boardPositionBase/types';
import { createObjectValueTemplate, createReplaceValueTemplate } from '../../generator';

export const templateValue = {
    ...BoardPosition.templateValue,
    cellH: createReplaceValueTemplate(t.number),
    cellW: createReplaceValueTemplate(t.number),
    cellX: createReplaceValueTemplate(t.number),
    cellY: createReplaceValueTemplate(t.number),
    isCellMode: createReplaceValueTemplate(t.boolean),
};

export const template = createObjectValueTemplate(templateValue, undefined, undefined);
