import * as t from 'io-ts';
import { maybe } from '../../../../../maybe';
import {
    createObjectValueTemplate,
    createReplaceValueTemplate,
    createTextValueTemplate,
} from '../../../../generator';
import * as Piece from '../../../piece/types';

export const String = 'String';
export const Number = 'Number';

const valueInputType = t.union([t.literal(String), t.literal(Number)]);

export const template = createObjectValueTemplate(
    {
        ...Piece.templateValue,
        ownerCharacterId: createReplaceValueTemplate(maybe(t.string)),
        isValuePrivate: createReplaceValueTemplate(t.boolean),
        value: createTextValueTemplate(false),
        valueInputType: createReplaceValueTemplate(maybe(valueInputType)),
    },
    2,
    1
);
