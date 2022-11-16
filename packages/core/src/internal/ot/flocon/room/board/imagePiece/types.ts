import { z } from 'zod';
import { filePathValue } from '../../../filePath/types';
import * as Piece from '../../../piece/types';
import { maybe } from '@/maybe';
import { createObjectValueTemplate, createReplaceValueTemplate } from '@/ot/generator';

export const template = createObjectValueTemplate(
    {
        ...Piece.templateValue,
        ownerParticipantId: createReplaceValueTemplate(maybe(z.string())),
        image: createReplaceValueTemplate(maybe(filePathValue)),
        isPrivate: createReplaceValueTemplate(z.boolean()),
    },
    2,
    1
);
