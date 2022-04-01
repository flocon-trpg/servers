import * as t from 'io-ts';
import {
    createObjectValueTemplate,
    createOtValueTemplate,
    createReplaceValueTemplate,
} from '../../../generator';

export const template = createObjectValueTemplate(
    {
        isValuePrivate: createReplaceValueTemplate(t.boolean),
        value: createOtValueTemplate(true),
        overriddenParameterName: createOtValueTemplate(true),
    },
    2,
    1
);
