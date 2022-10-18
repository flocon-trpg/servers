import * as t from 'io-ts';
import { maybe } from '../../../../maybe';
import {
    State,
    createObjectValueTemplate,
    createParamRecordValueTemplate,
    createRecordValueTemplate,
    createReplaceValueTemplate,
    createTextValueTemplate,
} from '../../../generator';
import { filePathValue } from '../../filePath/types';
import * as BoolParam from './boolParam/types';
import * as CharacterPiece from './characterPiece/types';
import * as Command from './command/types';
import * as NumParam from './numParam/types';
import * as PortraitPiece from './portraitPiece/types';
import * as StrParam from './strParam/types';

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
        ownerParticipantId: createReplaceValueTemplate(maybe(t.string)),

        image: createReplaceValueTemplate(maybe(filePathValue)),
        isPrivate: createReplaceValueTemplate(t.boolean),
        memo: createTextValueTemplate(false),
        name: createTextValueTemplate(false),
        chatPalette: createTextValueTemplate(false),
        privateVarToml: createTextValueTemplate(false),
        portraitImage: createReplaceValueTemplate(maybe(filePathValue)),

        hasTag1: createReplaceValueTemplate(t.boolean),
        hasTag2: createReplaceValueTemplate(t.boolean),
        hasTag3: createReplaceValueTemplate(t.boolean),
        hasTag4: createReplaceValueTemplate(t.boolean),
        hasTag5: createReplaceValueTemplate(t.boolean),
        hasTag6: createReplaceValueTemplate(t.boolean),
        hasTag7: createReplaceValueTemplate(t.boolean),
        hasTag8: createReplaceValueTemplate(t.boolean),
        hasTag9: createReplaceValueTemplate(t.boolean),
        hasTag10: createReplaceValueTemplate(t.boolean),

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
