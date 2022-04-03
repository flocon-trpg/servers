import * as t from 'io-ts';
import { maybe } from '../../../../maybe';
import {
    createObjectValueTemplate,
    createOtValueTemplate,
    createReplaceValueTemplate,
} from '../../../generator';

export const template = createObjectValueTemplate(
    {
        isValuePrivate: createReplaceValueTemplate(t.boolean),
        value: createReplaceValueTemplate(maybe(t.boolean)),
        overriddenParameterName: createOtValueTemplate(true),
    },
    2,
    1
);
