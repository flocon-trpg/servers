import { z } from 'zod';
import {
    createObjectValueTemplate,
    createReplaceValueTemplate,
    createTextValueTemplate,
} from '../../../../generator';

export const template = createObjectValueTemplate(
    {
        isValuePrivate: createReplaceValueTemplate(z.boolean()),
        value: createReplaceValueTemplate(z.number().optional()),

        /**
         * @description Do not use this value for numMaxParam.
         */
        overriddenParameterName: createTextValueTemplate(true),
    },
    2,
    1
);
