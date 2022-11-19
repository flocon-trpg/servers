import { z } from 'zod';
import { maybe } from '../../../maybe';
import { createObjectValueTemplate, createReplaceValueTemplate } from '../../generator';
import { shape } from '../../shape';

export const template = createObjectValueTemplate(
    {
        shape: createReplaceValueTemplate(shape),
        fill: createReplaceValueTemplate(maybe(z.string())),
        stroke: createReplaceValueTemplate(maybe(z.string())),
        strokeWidth: createReplaceValueTemplate(maybe(z.number())),
    },
    1,
    1
);
