import * as t from 'io-ts';
import { createObjectValueTemplate, createReplaceValueTemplate } from '../../../../generator';
import * as BoardPositionBase from '../../../boardPosition/types';

export const template = createObjectValueTemplate(
    {
        ...BoardPositionBase.templateValue,
        boardId: createReplaceValueTemplate(t.string),
        isPrivate: createReplaceValueTemplate(t.boolean),
    },
    2,
    1
);
