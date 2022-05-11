import * as t from 'io-ts';
import { createReplaceValueTemplate } from '../../generator';

export const compositeKey = createReplaceValueTemplate(
    t.type({
        createdBy: t.string,
        id: t.string,
    })
);
