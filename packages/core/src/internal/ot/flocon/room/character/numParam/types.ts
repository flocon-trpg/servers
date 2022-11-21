import { z } from 'zod';
import { maybe } from '@/maybe';
import {
    createObjectValueTemplate,
    createReplaceValueTemplate,
    createTextValueTemplate,
} from '@/ot/generator';

export const template = createObjectValueTemplate(
    {
        isValuePrivate: createReplaceValueTemplate(z.boolean()),
        value: createReplaceValueTemplate(maybe(z.number())),

        /**
         * @description Do not use this value for numMaxParam.
         */
        overriddenParameterName: createTextValueTemplate(true),
    },
    2,
    1
);
