import * as t from 'io-ts';
import * as Piece from '../../../piece/types';
import { maybe } from '../../../../../maybe';
import {
    createObjectValueTemplate,
    createOtValueTemplate,
    createReplaceValueTemplate,
} from '../../../../generator';

export const String = 'String';
export const Number = 'Number';

const valueInputType = t.union([t.literal(String), t.literal(Number)]);

export const template = createObjectValueTemplate(
    {
        ...Piece.templateValue,
        ownerCharacterId: createReplaceValueTemplate(maybe(t.string)),
        isValuePrivate: createReplaceValueTemplate(t.boolean),
        value: createOtValueTemplate(false),
        valueInputType: createReplaceValueTemplate(maybe(valueInputType)),
    },
    2,
    1
);
