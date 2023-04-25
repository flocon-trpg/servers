import { createObjectValueTemplate, createTextValueTemplate } from '../../../../generator/types';

export const template = createObjectValueTemplate(
    {
        name: createTextValueTemplate(false),
        value: createTextValueTemplate(false),
    },
    1,
    1
);
