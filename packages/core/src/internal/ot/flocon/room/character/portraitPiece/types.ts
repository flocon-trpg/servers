import * as t from 'io-ts';
import * as BoardPositionBase from '../../../boardPositionBase/types';
import { createObjectValueTemplate, createReplaceValueTemplate } from '../../../../generator';

export const template = createObjectValueTemplate(
    {
        ...BoardPositionBase.templateValue,
        boardId: createReplaceValueTemplate(t.string),
        isPrivate: createReplaceValueTemplate(t.boolean),
    },
    2,
    1
);
