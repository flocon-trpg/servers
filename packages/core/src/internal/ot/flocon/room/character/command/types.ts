import { createObjectValueTemplate, createTextValueTemplate } from '../../../../generator';

export const template = createObjectValueTemplate(
    {
        name: createTextValueTemplate(false),
        value: createTextValueTemplate(false),
    },
    1,
    1
);
