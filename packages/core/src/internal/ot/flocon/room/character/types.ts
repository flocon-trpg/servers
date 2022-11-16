import { z } from 'zod';
import { filePathValue } from '../../filePath/types';
import * as BoolParam from './boolParam/types';
import * as CharacterPiece from './characterPiece/types';
import * as Command from './command/types';
import * as NumParam from './numParam/types';
import * as PortraitPiece from './portraitPiece/types';
import * as StrParam from './strParam/types';
import { maybe } from '@/maybe';
import {
    State,
    createObjectValueTemplate,
    createParamRecordValueTemplate,
    createRecordValueTemplate,
    createReplaceValueTemplate,
    createTextValueTemplate,
} from '@/ot/generator';

// boolParams, numParams, numMaxParams, strParams: keyはstrIndex20などの固定キーを想定。
// pieces, portraitPositions: 誰でも作成できる値。keyはboardのkey。

// キャラクター全体非公開機能との兼ね合いがあるため、piecesとportraitPositionsをState<typeof Room.template>に置くのは綺麗ではない。

export const defaultBoolParamState: State<typeof BoolParam.template> = {
    $v: 2,
    $r: 1,
    isValuePrivate: false,
    value: undefined,
    overriddenParameterName: undefined,
};

export const defaultNumParamState: State<typeof NumParam.template> = {
    $v: 2,
    $r: 1,
    isValuePrivate: false,
    value: undefined,
    overriddenParameterName: undefined,
};

export const defaultStrParamState: State<typeof StrParam.template> = {
    $v: 2,
    $r: 1,
    isValuePrivate: false,
    value: undefined,
    overriddenParameterName: undefined,
};

export const template = createObjectValueTemplate(
    {
        ownerParticipantId: createReplaceValueTemplate(maybe(z.string())),

        image: createReplaceValueTemplate(maybe(filePathValue)),
        isPrivate: createReplaceValueTemplate(z.boolean()),
        memo: createTextValueTemplate(false),
        name: createTextValueTemplate(false),
        chatPalette: createTextValueTemplate(false),
        privateVarToml: createTextValueTemplate(false),
        portraitImage: createReplaceValueTemplate(maybe(filePathValue)),

        hasTag1: createReplaceValueTemplate(z.boolean()),
        hasTag2: createReplaceValueTemplate(z.boolean()),
        hasTag3: createReplaceValueTemplate(z.boolean()),
        hasTag4: createReplaceValueTemplate(z.boolean()),
        hasTag5: createReplaceValueTemplate(z.boolean()),
        hasTag6: createReplaceValueTemplate(z.boolean()),
        hasTag7: createReplaceValueTemplate(z.boolean()),
        hasTag8: createReplaceValueTemplate(z.boolean()),
        hasTag9: createReplaceValueTemplate(z.boolean()),
        hasTag10: createReplaceValueTemplate(z.boolean()),

        boolParams: createParamRecordValueTemplate(BoolParam.template, defaultBoolParamState),
        numParams: createParamRecordValueTemplate(NumParam.template, defaultNumParamState),
        numMaxParams: createParamRecordValueTemplate(NumParam.template, defaultNumParamState),
        strParams: createParamRecordValueTemplate(StrParam.template, defaultStrParamState),
        pieces: createRecordValueTemplate(CharacterPiece.template),
        privateCommands: createRecordValueTemplate(Command.template),
        portraitPieces: createRecordValueTemplate(PortraitPiece.template),
    },
    2,
    1
);
