import { z } from 'zod';
import { createObjectValueTemplate, createReplaceValueTemplate } from '../../generator';
import * as BoardPosition from '../boardPosition/types';

export const templateValue = {
    ...BoardPosition.templateValue,
    cellH: createReplaceValueTemplate(z.number()),
    cellW: createReplaceValueTemplate(z.number()),
    cellX: createReplaceValueTemplate(z.number()),
    cellY: createReplaceValueTemplate(z.number()),
    isCellMode: createReplaceValueTemplate(z.boolean()),
};

export const template = createObjectValueTemplate(templateValue, undefined, undefined);
