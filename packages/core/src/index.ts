export { anonymous, authToken, $free, $system } from './internal/constants';

export { firebaseConfig, FirebaseConfig } from './internal/firebaseConfig';

export {
    StrIndex5,
    strIndex5Array,
    isStrIndex5,
    StrIndex10,
    strIndex10Array,
    isStrIndex10,
    StrIndex20,
    strIndex20Array,
    isStrIndex20,
    StrIndex100,
    strIndex100Array,
    isStrIndex100,
} from './internal/indexes';

export { MaxLength100String, maxLength100String } from './internal/maxLengthString';

export { forceMaxLength100String } from './internal/forceMaxLength100String';

export { maybe, Maybe } from './internal/maybe';

export { PublicChannelKey } from './internal/publicChannelKey';

export { simpleId } from './internal/simpleId';

export {
    isValidVarToml,
    parseToml,
    getVariableFromVarTomlObject,
    generateChatPalette,
} from './internal/toml';

export { testCommand, execCharacterCommand } from './internal/command/main';

export { Expression, plain, expr1, analyze } from './internal/expression';

export {
    sanitizeFilename,
    sanitizeFoldername,
    trySanitizePath,
    joinPath,
    UploaderPathSource,
} from './internal/uploaderPath';

export { fakeFirebaseConfig1, fakeFirebaseConfig2 } from './internal/fake/fakeFirebaseConfig';

export { $index, arrayToIndexObjects, indexObjectsToArray, IndexObject } from './internal/ot/array';

export {
    Default,
    Uploader,
    FirebaseStorage,
    filePathTemplate,
} from './internal/ot/flocon/filePath/types';

export {
    $v,
    $r,
    toDownOperation,
    toUpOperation,
    apply,
    applyBack,
    composeDownOperation,
    restore,
    diff,
    clientTransform,
} from './internal/ot/generator/functions';

export {
    atomic,
    // replace,
    ot,
    record,
    paramRecord,
    object,
    state,
    State,
    upOperation,
    UpOperation,
    downOperation,
    DownOperation,
    TwoWayOperation,
    createObjectValueTemplate,
    createTextValueTemplate,
    createParamRecordValueTemplate,
    createRecordValueTemplate,
    createReplaceValueTemplate,
} from './internal/ot/generator/types';

export { OmitVersion } from './internal/ot/generator/omitVersion';

export { toClientState, serverTransform } from './internal/ot/flocon/room/functions';

export {
    template as roomTemplate,
    dbTemplate as roomDbTemplate,
} from './internal/ot/flocon/room/types';

export { template as bgmTemplate } from './internal/ot/flocon/room/bgm/types';

export { template as paramNameTemplate } from './internal/ot/flocon/room/paramName/types';

export {
    parseState,
    stringifyState,
    decodeDbState,
    exactDbState,
    parseUpOperation,
    stringifyUpOperation,
    decodeDownOperation,
    exactDownOperation,
} from './internal/ot/flocon/room/converter';

export { template as boardPositionTemplate } from './internal/ot/flocon/boardPosition/types';

export { template as pieceTemplate } from './internal/ot/flocon/piece/types';

export {
    Master,
    Player,
    Spectator,
    ParticipantRole,
    template as participantTemplate,
} from './internal/ot/flocon/room/participant/types';

export { template as boardTemplate } from './internal/ot/flocon/room/board/types';

export { template as characterTemplate } from './internal/ot/flocon/room/character/types';

export { template as boolParamTemplate } from './internal/ot/flocon/room/character/boolParam/types';

export { template as characterPieceTemplate } from './internal/ot/flocon/room/character/characterPiece/types';

export { template as commandTemplate } from './internal/ot/flocon/room/character/command/types';

export { template as numParamTemplate } from './internal/ot/flocon/room/character/numParam/types';

export { template as strParamTemplate } from './internal/ot/flocon/room/character/strParam/types';

export { template as portraitPieceTemplate } from './internal/ot/flocon/room/character/portraitPiece/types';

export { template as shapeTemplate } from './internal/ot/flocon/shape/types';

export { template as shapePieceTemplate } from './internal/ot/flocon/room/board/shapePiece/types';

export {
    template as dicePieceTemplate,
    dicePieceStrIndexes,
} from './internal/ot/flocon/room/board/dicePiece/types';

export {
    decode as decodeDicePiece,
    parse as parseDicePiece,
} from './internal/ot/flocon/room/board/dicePiece/converter';

export { template as dieValueTemplate } from './internal/ot/flocon/room/board/dicePiece/dieValue/types';

export {
    type as dicePieceLog,
    Type as DicePieceLog,
} from './internal/ot/flocon/room/board/dicePiece/log';

export { template as imagePieceTemplate } from './internal/ot/flocon/room/board/imagePiece/types';

export {
    template as stringPieceTemplate,
    String,
    Number,
} from './internal/ot/flocon/room/board/stringPiece/types';

export {
    decode as decodeStringPiece,
    parse as parseStringPiece,
} from './internal/ot/flocon/room/board/stringPiece/converter';

export {
    type as stringPieceLog,
    Type as StringPieceLog,
} from './internal/ot/flocon/room/board/stringPiece/log';

export { template as memoTemplate, Plain, Markdown } from './internal/ot/flocon/room/memo/types';

export { getOpenRollCall } from './internal/ot/flocon/room/rollCall/getOpenRollCall';

export { isOpenRollCall } from './internal/ot/flocon/room/rollCall/isOpenRollCall';

export { OtError, toOtError } from './internal/ot/otError';

export {
    DownOperation as NullableTextDownOperation,
    UpOperation as NullableTextUpOperation,
    TwoWayOperation as NullableTextTwoWayOperation,
    apply as applyNullableText,
    diff as nullableTextDiff,
    toUpOperation as toNullableTextUpOperation,
} from './internal/ot/nullableTextOperation';

export { isIdRecord } from './internal/ot/record';

export {
    replace,
    update,
    RecordDownOperationElement,
    RecordTwoWayOperationElement,
    RecordUpOperationElement,
} from './internal/ot/recordOperationElement';

export {
    RecordDownOperation,
    RecordUpOperation,
    RecordTwoWayOperation,
} from './internal/ot/recordOperation';

export {
    DownOperation as TextDownOperation,
    UpOperation as TextUpOperation,
    TwoWayOperation as TextTwoWayOperation,
    apply as applyText,
    diff as textDiff,
    toUpOperation as toTextUpOperation,
} from './internal/ot/textOperation';

export {
    client,
    admin,
    restrict,
    RequestedBy,
    isCharacterOwner,
    isBoardOwner,
    isOwner,
} from './internal/ot/requestedBy';

export { path, shape } from './internal/ot/shape';

export { updateType, createType, deleteType } from './internal/ot/flocon/piece/log';

export { createLogs } from './internal/ot/flocon/room/log';
