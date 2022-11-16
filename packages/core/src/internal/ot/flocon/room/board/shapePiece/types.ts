import { z } from 'zod';
import { maybe } from '@/maybe';
import * as Piece from '@/ot/flocon/piece/types';
import * as Shape from '@/ot/flocon/shape/types';
import {
    createObjectValueTemplate,
    createRecordValueTemplate,
    createReplaceValueTemplate,
} from '@/ot/generator';

export const template = createObjectValueTemplate(
    {
        ...Piece.templateValue,
        ownerParticipantId: createReplaceValueTemplate(maybe(z.string())),
        isPrivate: createReplaceValueTemplate(z.boolean()),

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
