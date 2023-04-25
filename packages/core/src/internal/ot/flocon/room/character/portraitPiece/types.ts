import { z } from 'zod';
import { createObjectValueTemplate, createReplaceValueTemplate } from '../../../../generator/types';
import * as BoardPositionBase from '../../../boardPosition/types';

export const template = createObjectValueTemplate(
    {
        ...BoardPositionBase.templateValue,
        boardId: createReplaceValueTemplate(z.string()),
        isPrivate: createReplaceValueTemplate(z.boolean()),
    },
    2,
    1
);
