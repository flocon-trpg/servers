import { createObjectValueTemplate, createOtValueTemplate } from '../../generator';

export const template = createObjectValueTemplate(
    {
        name: createOtValueTemplate(false),
    },
    1,
    1
);
