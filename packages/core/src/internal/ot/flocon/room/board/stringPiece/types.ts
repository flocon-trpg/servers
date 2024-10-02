import { z } from 'zod';
import { maybe } from '../../../../../maybe';
import {
    createObjectValueTemplate,
    createReplaceValueTemplate,
    createTextValueTemplate,
} from '../../../../generator/types';
import * as Piece from '../../../piece/types';

export const String = 'String';
export const Number = 'Number';

const valueInputType = z.union([z.literal(String), z.literal(Number)]);

export const template = createObjectValueTemplate(
    {
        ...Piece.templateValue,
        ownerCharacterId: createReplaceValueTemplate(maybe(z.string())),
        isValuePrivate: createReplaceValueTemplate(z.boolean()),
        value: createTextValueTemplate(false),
        valueInputType: createReplaceValueTemplate(maybe(valueInputType)),
    },
    2,
    1,
);
