import { z } from 'zod';
import { createObjectValueTemplate, createReplaceValueTemplate } from '../../../../generator/types';
import * as Piece from '../../../piece/types';

export const template = createObjectValueTemplate(
    {
        ...Piece.templateValue,
        boardId: createReplaceValueTemplate(z.string()),
        isPrivate: createReplaceValueTemplate(z.boolean()),
    },
    2,
    1
);
