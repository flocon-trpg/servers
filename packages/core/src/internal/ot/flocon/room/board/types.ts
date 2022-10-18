import * as t from 'io-ts';
import { maybe } from '../../../../maybe';
import {
    createObjectValueTemplate,
    createRecordValueTemplate,
    createReplaceValueTemplate,
    createTextValueTemplate,
} from '../../../generator';
import { filePathValue } from '../../filePath/types';
import * as DicePiece from './dicePiece/types';
import * as ImagePiece from './imagePiece/types';
import * as ShapePiece from './shapePiece/types';
import * as StringPiece from './stringPiece/types';

export const template = createObjectValueTemplate(
    {
        backgroundImage: createReplaceValueTemplate(maybe(filePathValue)),
        backgroundImageZoom: createReplaceValueTemplate(t.number),
        cellColumnCount: createReplaceValueTemplate(t.number),
        cellHeight: createReplaceValueTemplate(t.number),
        cellOffsetX: createReplaceValueTemplate(t.number),
        cellOffsetY: createReplaceValueTemplate(t.number),
        cellRowCount: createReplaceValueTemplate(t.number),
        cellWidth: createReplaceValueTemplate(t.number),
        name: createTextValueTemplate(false),
        ownerParticipantId: createReplaceValueTemplate(maybe(t.string)),

        dicePieces: createRecordValueTemplate(DicePiece.template),
        imagePieces: createRecordValueTemplate(ImagePiece.template),
        shapePieces: createRecordValueTemplate(ShapePiece.template),
        stringPieces: createRecordValueTemplate(StringPiece.template),
    },
    2,
    1
);
