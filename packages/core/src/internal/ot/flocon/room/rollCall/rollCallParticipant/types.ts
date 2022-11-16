import { z } from 'zod';
import { maybe } from '@/maybe';
import { createObjectValueTemplate, createReplaceValueTemplate } from '@/ot/generator';

export const template = createObjectValueTemplate(
    {
        answeredAt: createReplaceValueTemplate(maybe(z.number())),
    },
    1,
    1
);
