import * as Command from './internal/ot/room/character/command/functions';
import * as CommandTypes from './internal/ot/room/character/command/types';
import * as RecordOperation from './internal/ot/util/recordOperation';

export const privateCommandsDiff = ({
    prevState,
    nextState,
}: {
    prevState: Record<string, CommandTypes.State | undefined>;
    nextState: Record<string, CommandTypes.State | undefined>;
}): RecordOperation.RecordUpOperation<CommandTypes.State, CommandTypes.UpOperation> | undefined => {
    return RecordOperation.diff<CommandTypes.State, CommandTypes.UpOperation>({
        prevState,
        nextState,
        innerDiff: params => {
            const diff = Command.diff(params);
            if (diff == null) {
                return undefined;
            }
            return Command.toUpOperation(diff);
        },
    });
};

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

export { maybe, Maybe } from './internal/maybe';

export { PublicChannelKey } from './internal/publicChannelKey';

export { simpleId } from './internal/simpleId';

export {
    isValidVarToml,
    parseToml,
    getVariableFromVarTomlObject,
    isValidChatPalette,
    generateChatPalette,
} from './internal/toml';

export { testCommand, execCharacterCommand } from './internal/command/main';

export { Default, Uploader, FirebaseStorage, FilePath } from './internal/ot/filePath/types';

export { Expression, plain, expr1, analyze } from './internal/expression';

export {
    toClientState,
    toUpOperation,
    toDownOperation,
    apply,
    applyBack,
    composeDownOperation,
    restore,
    diff,
    serverTransform,
    clientTransform,
} from './internal/ot/room/functions';

export {
    dbState,
    DbState,
    state,
    State,
    upOperation,
    UpOperation,
    downOperation,
    DownOperation,
    TwoWayOperation,
} from './internal/ot/room/types';

export {
    State as BgmState,
    UpOperation as BgmUpOperation,
    DownOperation as BgmDownOperation,
} from './internal/ot/room/bgm/types';

export {
    State as ParamNameState,
    UpOperation as ParamNameUpOperation,
    DownOperation as ParamNameDownOperation,
} from './internal/ot/room/paramName/types';

export {
    parseState,
    stringifyState,
    decodeDbState,
    exactDbState,
    parseUpOperation,
    stringifyUpOperation,
    decodeDownOperation,
    exactDownOperation,
} from './internal/ot/room/converter';

export {
    apply as applyBoardPosition,
    diff as boardPositionDiff,
    toUpOperation as toBoardPositionUpOperation,
} from './internal/ot/boardPositionBase/functions';

export {
    State as BoardPositionState,
    UpOperation as BoardPositionUpOperation,
    DownOperation as BoardPositionDownOperation,
} from './internal/ot/boardPositionBase/types';

export {
    apply as applyPiece,
    diff as pieceDiff,
    toUpOperation as toPieceUpOperation,
} from './internal/ot/pieceBase/functions';

export {
    State as PieceState,
    UpOperation as PieceUpOperation,
    DownOperation as PieceDownOperation,
} from './internal/ot/pieceBase/types';

export {
    Master,
    Player,
    Spectator,
    ParticipantRole,
    State as ParticipantState,
    UpOperation as ParticipantUpOperation,
    DownOperation as ParticipantDownOperation,
} from './internal/ot/room/participant/types';

export {
    apply as applyBoard,
    diff as boardDiff,
    toUpOperation as toBoardUpOperation,
} from './internal/ot/room/board/functions';

export {
    State as BoardState,
    UpOperation as BoardUpOperation,
    DownOperation as BoardDownOperation,
} from './internal/ot/room/board/types';

export {
    apply as applyCharacter,
    diff as characterDiff,
    toUpOperation as toCharacterUpOperation,
} from './internal/ot/room/character/functions';

export {
    State as CharacterState,
    UpOperation as CharacterUpOperation,
    DownOperation as CharacterDownOperation,
} from './internal/ot/room/character/types';

export {
    State as BoolParamState,
    UpOperation as BoolParamUpOperation,
    DownOperation as BoolParamDownOperation,
} from './internal/ot/room/character/boolParam/types';

export {
    apply as applyCharacterPiece,
    diff as characterPieceDiff,
    toUpOperation as toCharacterPieceUpOperation,
} from './internal/ot/room/character/characterPiece/functions';

export {
    State as CharacterPieceState,
    UpOperation as CharacterPieceUpOperation,
    DownOperation as CharacterPieceDownOperation,
} from './internal/ot/room/character/characterPiece/types';

export {
    State as NumParamState,
    UpOperation as NumParamUpOperation,
    DownOperation as NumParamDownOperation,
} from './internal/ot/room/character/numParam/types';

export {
    apply as applyStrParamCharacter,
    diff as strParamcharacterDiff,
    toUpOperation as toStrParamUpOperation,
} from './internal/ot/room/character/strParam/functions';

export {
    State as StrParamState,
    UpOperation as StrParamUpOperation,
    DownOperation as StrParamCharacterDownOperation,
} from './internal/ot/room/character/strParam/types';

export {
    apply as applyPortraitPiece,
    diff as portraitPieceDiff,
    toUpOperation as toPortraitPieceUpOperation,
} from './internal/ot/room/character/portraitPiece/functions';

export {
    State as PortraitPieceState,
    UpOperation as PortraitPieceUpOperation,
    DownOperation as PortraitPieceDownOperation,
} from './internal/ot/room/character/portraitPiece/types';

export {
    apply as applyDicePiece,
    diff as dicePieceDiff,
    toUpOperation as toDicePieceUpOperation,
} from './internal/ot/room/board/dicePiece/functions';

export {
    State as DicePieceState,
    UpOperation as DicePieceUpOperation,
    DownOperation as DicePieceDownOperation,
    dicePieceStrIndexes,
} from './internal/ot/room/board/dicePiece/types';

export {
    decode as decodeDicePiece,
    parse as parseDicePiece,
    exact as exactDicePiece,
} from './internal/ot/room/board/dicePiece/converter';

export {
    apply as applyDieValue,
    diff as dieValueDiff,
    toUpOperation as toDieValueUpOperation,
} from './internal/ot/room/board/dicePiece/dieValue/functions';

export {
    State as DieValueState,
    UpOperation as DieValueUpOperation,
    DownOperation as DieValueDownOperation,
} from './internal/ot/room/board/dicePiece/dieValue/types';

export { type as dicePieceLog, Type as DicePieceLog } from './internal/ot/room/board/dicePiece/log';

export {
    apply as applyImagePiece,
    diff as imagePieceDiff,
    toUpOperation as toImagePieceUpOperation,
} from './internal/ot/room/board/imagePiece/functions';

export {
    State as ImagePieceState,
    UpOperation as ImagePieceUpOperation,
    DownOperation as ImagePieceDownOperation,
} from './internal/ot/room/board/imagePiece/types';

export {
    apply as applyStringPiece,
    diff as stringPieceDiff,
    toUpOperation as toStringPieceUpOperation,
} from './internal/ot/room/board/stringPiece/functions';

export {
    State as StringPieceState,
    UpOperation as StringPieceUpOperation,
    DownOperation as StringPieceDownOperation,
    String,
    Number,
} from './internal/ot/room/board/stringPiece/types';

export {
    decode as decodeStringPiece,
    parse as parseStringPiece,
    exact as exactStringPiece,
} from './internal/ot/room/board/stringPiece/converter';

export {
    type as stringPieceLog,
    Type as StringPieceLog,
} from './internal/ot/room/board/stringPiece/log';

export {
    State as MemoState,
    UpOperation as MemoUpOperation,
    DownOperation as MemoDownOperation,
    Plain,
    Markdown,
} from './internal/ot/room/memo/types';

export {
    DownOperation as NullableTextDownOperation,
    UpOperation as NullableTextUpOperation,
    TwoWayOperation as NullableTextTwoWayOperation,
    apply as applyNullableText,
    diff as nullableTextDiff,
    toUpOperation as toNullableTextUpOperation,
} from './internal/ot/util/nullableTextOperation';

export { isIdRecord } from './internal/ot/util/record';

export {
    replace,
    update,
    RecordDownOperationElement,
    RecordTwoWayOperationElement,
    RecordUpOperationElement,
} from './internal/ot/util/recordOperationElement';

export {
    RecordDownOperation,
    RecordUpOperation,
    RecordTwoWayOperation,
} from './internal/ot/util/recordOperation';

export {
    DownOperation as TextDownOperation,
    UpOperation as TextUpOperation,
    TwoWayOperation as TextTwoWayOperation,
    apply as applyText,
    diff as textDiff,
    toUpOperation as toTextUpOperation,
} from './internal/ot/util/textOperation';

export {
    client,
    admin,
    restrict,
    RequestedBy,
    isCharacterOwner,
    isBoardOwner,
    isOwner,
} from './internal/ot/util/requestedBy';

export { updateType, createType, deleteType } from './internal/ot/pieceBase/log';

export { createLogs } from './internal/ot/room/log';

export { StateManager } from './internal/stateManagers/stateManager';

export {
    Apply,
    Compose,
    Transform,
    Diff,
    StateManagerParameters,
} from './internal/stateManagers/types';
