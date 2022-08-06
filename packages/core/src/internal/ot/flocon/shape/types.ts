import { maybe } from '../../../maybe';
import { createObjectValueTemplate, createReplaceValueTemplate } from '../../generator';
import { shape } from '../../util/shape';
import * as t from 'io-ts';

export const template = createObjectValueTemplate(
    {
        shape: createReplaceValueTemplate(shape),
        fill: createReplaceValueTemplate(maybe(t.string)),
        stroke: createReplaceValueTemplate(maybe(t.string)),
        strokeWidth: createReplaceValueTemplate(maybe(t.number)),
    },
    1,
    1
);
