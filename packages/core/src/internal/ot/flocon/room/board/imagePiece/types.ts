import * as t from 'io-ts';
import { filePathValue } from '../../../filePath/types';
import * as BoardPosition from '../../../boardPositionBase/types';
import * as Piece from '../../../pieceBase/types';
import { maybe } from '../../../../../maybe';
import { createObjectValueTemplate, createReplaceValueTemplate } from '../../../../generator';

export const template = createObjectValueTemplate(
    {
        ...BoardPosition.templateValue,
        ...Piece.templateValue,
        ownerParticipantId: createReplaceValueTemplate(maybe(t.string)),
        image: createReplaceValueTemplate(maybe(filePathValue)),
        isPrivate: createReplaceValueTemplate(t.boolean),
    },
    2,
    1
);
