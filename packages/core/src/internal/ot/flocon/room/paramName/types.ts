import { createObjectValueTemplate, createTextValueTemplate } from '../../../generator';

export const template = createObjectValueTemplate(
    {
        name: createTextValueTemplate(false),
    },
    1,
    1
);
