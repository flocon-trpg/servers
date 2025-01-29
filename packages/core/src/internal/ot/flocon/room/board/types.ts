import { z } from 'zod';
import { maybe } from '../../../../maybe';
import {
    createObjectValueTemplate,
    createRecordValueTemplate,
    createReplaceValueTemplate,
    createTextValueTemplate,
} from '../../../generator/types';
import { filePathValue } from '../../filePath/types';
import * as DeckPiece from './deckPiece/types';
import * as DicePiece from './dicePiece/types';
import * as ImagePiece from './imagePiece/types';
import * as ShapePiece from './shapePiece/types';
import * as StringPiece from './stringPiece/types';

export const template = createObjectValueTemplate(
    {
        backgroundImage: createReplaceValueTemplate(filePathValue.optional()),
        // 例えば1ならば1倍、2ならば2倍。web-serverのユーザー設定にzoomがあるがそちらと計算方法が異なるので注意。
        // TODO: backgroundImageZoom ではなく backgroundImageScale 等にしておけばわかりやすかったか。
        backgroundImageZoom: createReplaceValueTemplate(z.number()),
        cellColumnCount: createReplaceValueTemplate(z.number()),
        cellHeight: createReplaceValueTemplate(z.number()),
        cellOffsetX: createReplaceValueTemplate(z.number()),
        cellOffsetY: createReplaceValueTemplate(z.number()),
        cellRowCount: createReplaceValueTemplate(z.number()),
        cellWidth: createReplaceValueTemplate(z.number()),
        name: createTextValueTemplate(false),
        ownerParticipantId: createReplaceValueTemplate(maybe(z.string())),

        deckPieces: createRecordValueTemplate(DeckPiece.template),
        dicePieces: createRecordValueTemplate(DicePiece.template),
        imagePieces: createRecordValueTemplate(ImagePiece.template),
        shapePieces: createRecordValueTemplate(ShapePiece.template),
        stringPieces: createRecordValueTemplate(StringPiece.template),
    },
    2,
    1,
);
