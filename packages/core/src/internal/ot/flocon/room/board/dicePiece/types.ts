import * as t from 'io-ts';
import * as DieValueTypes from './dieValue/types';
import { maybe } from '../../../../../maybe';
import * as BoardPosition from '../../../boardPositionBase/types';
import * as Piece from '../../../pieceBase/types';
import {
    createObjectValueTemplate,
    createRecordValueTemplate,
    createReplaceValueTemplate,
} from '../../../../generator';

export const dicePieceStrIndexes = ['1', '2', '3', '4'] as const;

export const template = createObjectValueTemplate(
    {
        ...BoardPosition.templateValue,
        ...Piece.templateValue,
        ownerCharacterId: createReplaceValueTemplate(maybe(t.string)),
        dice: createRecordValueTemplate(DieValueTypes.template),
    },
    2,
    1
);
