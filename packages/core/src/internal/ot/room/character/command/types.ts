import { createObjectValueTemplate, createOtValueTemplate } from '../../../generator';

export const template = createObjectValueTemplate(
    {
        name: createOtValueTemplate(false),
        value: createOtValueTemplate(false),
    },
    1,
    1
);
