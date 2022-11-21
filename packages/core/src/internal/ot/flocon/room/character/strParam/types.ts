import { z } from 'zod';
import {
    createObjectValueTemplate,
    createReplaceValueTemplate,
    createTextValueTemplate,
} from '@/ot/generator';

export const template = createObjectValueTemplate(
    {
        isValuePrivate: createReplaceValueTemplate(z.boolean()),
        value: createTextValueTemplate(true),
        overriddenParameterName: createTextValueTemplate(true),
    },
    2,
    1
);
