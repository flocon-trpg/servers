import * as t from 'io-ts';
import { maybe } from '../../../../../maybe';
import { createObjectValueTemplate, createReplaceValueTemplate } from '../../../../generator';

export const template = createObjectValueTemplate(
    {
        answeredAt: createReplaceValueTemplate(maybe(t.number)),
    },
    1,
    1
);
