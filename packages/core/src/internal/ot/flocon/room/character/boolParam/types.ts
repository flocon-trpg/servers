import * as t from 'io-ts';
import { maybe } from '../../../../../maybe';
import {
    createObjectValueTemplate,
    createReplaceValueTemplate,
    createTextValueTemplate,
} from '../../../../generator';

export const template = createObjectValueTemplate(
    {
        isValuePrivate: createReplaceValueTemplate(t.boolean),
        value: createReplaceValueTemplate(maybe(t.boolean)),
        overriddenParameterName: createTextValueTemplate(true),
    },
    2,
    1
);
