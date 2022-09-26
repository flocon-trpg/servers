import * as t from 'io-ts';
import * as Piece from '../../../piece/types';
import { maybe } from '../../../../../maybe';
import {
    createObjectValueTemplate,
    createRecordValueTemplate,
    createReplaceValueTemplate,
} from '../../../../generator';
import * as Shape from '../../../shape/types';

export const template = createObjectValueTemplate(
    {
        ...Piece.templateValue,
        ownerParticipantId: createReplaceValueTemplate(maybe(t.string)),
        isPrivate: createReplaceValueTemplate(t.boolean),

        /**
         * keyは`'1'`から`'9'`の9個のみをサポートしています。詳細は`./functions.ts`を参照してください。
         *
         * ShapeのPath.dataは、widthとheightがともに100pxの正方形として記述します。コマなどの大きさに応じて自動的にscaleされます。
         * */
        shapes: createRecordValueTemplate(Shape.template),
    },
    1,
    1
);
