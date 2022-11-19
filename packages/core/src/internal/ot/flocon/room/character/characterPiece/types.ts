import { z } from 'zod';
import * as Piece from '@/ot/flocon/piece/types';
import { createObjectValueTemplate, createReplaceValueTemplate } from '@/ot/generator';

export const template = createObjectValueTemplate(
    {
        ...Piece.templateValue,
        boardId: createReplaceValueTemplate(z.string()),
        isPrivate: createReplaceValueTemplate(z.boolean()),
    },
    2,
    1
);
