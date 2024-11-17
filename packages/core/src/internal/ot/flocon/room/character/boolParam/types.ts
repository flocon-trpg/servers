import { z } from 'zod';
import {
    createObjectValueTemplate,
    createReplaceValueTemplate,
    createTextValueTemplate,
} from '../../../../generator/types';

export const template = createObjectValueTemplate(
    {
        isValuePrivate: createReplaceValueTemplate(z.boolean()),
        value: createReplaceValueTemplate(z.boolean().optional()),
        overriddenParameterName: createTextValueTemplate(true),
    },
    2,
    1,
);
