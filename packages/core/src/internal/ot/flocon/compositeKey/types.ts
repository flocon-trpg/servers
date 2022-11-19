import { z } from 'zod';
import { createReplaceValueTemplate } from '../../generator';

export const compositeKey = createReplaceValueTemplate(
    z.object({
        createdBy: z.string(),
        id: z.string(),
    })
);
