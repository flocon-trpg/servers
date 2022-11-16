import { z } from 'zod';
import * as Piece from '../../../piece/types';
import * as DieValueTypes from './dieValue/types';
import { maybe } from '@/maybe';
import {
    createObjectValueTemplate,
    createRecordValueTemplate,
    createReplaceValueTemplate,
} from '@/ot/generator';

export const dicePieceStrIndexes = ['1', '2', '3', '4'] as const;

export const template = createObjectValueTemplate(
    {
        ...Piece.templateValue,
        ownerCharacterId: createReplaceValueTemplate(maybe(z.string())),
        dice: createRecordValueTemplate(DieValueTypes.template),
    },
    2,
    1
);
