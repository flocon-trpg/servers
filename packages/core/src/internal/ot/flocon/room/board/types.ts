import { z } from 'zod';
import { maybe } from '../../../../maybe';
import {
    createObjectValueTemplate,
    createRecordValueTemplate,
    createReplaceValueTemplate,
    createTextValueTemplate,
} from '../../../generator/types';
import { filePathValue } from '../../filePath/types';
import * as DicePiece from './dicePiece/types';
import * as ImagePiece from './imagePiece/types';
import * as ShapePiece from './shapePiece/types';
import * as StringPiece from './stringPiece/types';

export const template = createObjectValueTemplate(
    {
        backgroundImage: createReplaceValueTemplate(maybe(filePathValue)),
        backgroundImageZoom: createReplaceValueTemplate(z.number()),
        cellColumnCount: createReplaceValueTemplate(z.number()),
        cellHeight: createReplaceValueTemplate(z.number()),
        cellOffsetX: createReplaceValueTemplate(z.number()),
        cellOffsetY: createReplaceValueTemplate(z.number()),
        cellRowCount: createReplaceValueTemplate(z.number()),
        cellWidth: createReplaceValueTemplate(z.number()),
        name: createTextValueTemplate(false),
        ownerParticipantId: createReplaceValueTemplate(maybe(z.string())),

        dicePieces: createRecordValueTemplate(DicePiece.template),
        imagePieces: createRecordValueTemplate(ImagePiece.template),
        shapePieces: createRecordValueTemplate(ShapePiece.template),
        stringPieces: createRecordValueTemplate(StringPiece.template),
    },
    2,
    1,
);
