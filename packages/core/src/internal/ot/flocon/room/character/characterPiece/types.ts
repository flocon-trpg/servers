import * as t from 'io-ts';
import { createObjectValueTemplate, createReplaceValueTemplate } from '../../../../generator';
import * as Piece from '../../../piece/types';

export const template = createObjectValueTemplate(
    {
        ...Piece.templateValue,
        boardId: createReplaceValueTemplate(t.string),
        isPrivate: createReplaceValueTemplate(t.boolean),
    },
    2,
    1
);
