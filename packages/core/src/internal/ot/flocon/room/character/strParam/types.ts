import * as t from 'io-ts';
import {
    createObjectValueTemplate,
    createReplaceValueTemplate,
    createTextValueTemplate,
} from '../../../../generator';

export const template = createObjectValueTemplate(
    {
        isValuePrivate: createReplaceValueTemplate(t.boolean),
        value: createTextValueTemplate(true),
        overriddenParameterName: createTextValueTemplate(true),
    },
    2,
    1
);
