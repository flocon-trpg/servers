import { z } from 'zod';
import * as BoardPositionBase from '@/ot/flocon/boardPosition/types';
import { createObjectValueTemplate, createReplaceValueTemplate } from '@/ot/generator';

export const template = createObjectValueTemplate(
    {
        ...BoardPositionBase.templateValue,
        boardId: createReplaceValueTemplate(z.string()),
        isPrivate: createReplaceValueTemplate(z.boolean()),
    },
    2,
    1
);
