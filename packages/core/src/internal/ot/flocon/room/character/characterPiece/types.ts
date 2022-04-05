import * as t from 'io-ts';
import * as BoardPosition from '../../../boardPositionBase/types';
import { createObjectValueTemplate, createReplaceValueTemplate } from '../../../../generator';
import * as Piece from '../../../pieceBase/types';

export const template = createObjectValueTemplate(
    {
        ...BoardPosition.templateValue,
        ...Piece.templateValue,
        boardId: createReplaceValueTemplate(t.string),
        isPrivate: createReplaceValueTemplate(t.boolean),
    },
    2,
    1
);
