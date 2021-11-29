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
} from './internal/ot/boardPosition/functions';

export {
    State as BoardPositionState,
    UpOperation as BoardPositionUpOperation,
    DownOperation as BoardPositionDownOperation,
} from './internal/ot/boardPosition/types';

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
    apply as applyPiece,
    diff as pieceDiff,
    toUpOperation as toPieceUpOperation,
} from './internal/ot/piece/functions';

export {
    State as PieceState,
    UpOperation as PieceUpOperation,
    DownOperation as PieceDownOperation,
} from './internal/ot/piece/types';

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
    DownOperation as BoolParamCharacterDownOperation,
} from './internal/ot/room/character/boolParam/types';

export {
    State as NumParamState,
    UpOperation as NumParamUpOperation,
    DownOperation as NumParamCharacterDownOperation,
} from './internal/ot/room/character/numParam/types';

export {
    apply as applyStrParamCharacter,
    diff as strParamcharacterDiff,
    toUpOperation as toCharacterStrParamUpOperation,
} from './internal/ot/room/character/strParam/functions';

export {
    State as StrParamState,
    UpOperation as StrParamUpOperation,
    DownOperation as StrParamCharacterDownOperation,
} from './internal/ot/room/character/strParam/types';

export {
    apply as applyDicePieceValue,
    diff as dicePieceValueDiff,
    toUpOperation as toDicePieceValueUpOperation,
} from './internal/ot/room/dicePieceValue/functions';

export {
    State as DicePieceValueState,
    UpOperation as DicePieceValueUpOperation,
    DownOperation as DicePieceValueDownOperation,
    dicePieceValueStrIndexes,
} from './internal/ot/room/dicePieceValue/types';

export {
    decode as decodeDicePieceValue,
    parse as parseDicePieceValue,
    exact as exactDicePieceValue,
} from './internal/ot/room/dicePieceValue/converter';

export {
    apply as applyDieValue,
    diff as dieValueDiff,
    toUpOperation as toDieValueUpOperation,
} from './internal/ot/room/dicePieceValue/dieValue/functions';

export {
    State as DieValueState,
    UpOperation as DieValueUpOperation,
    DownOperation as DieValueDownOperation,
} from './internal/ot/room/dicePieceValue/dieValue/types';

export {
    type as dicePieceValueLog,
    Type as DicePieceValueLog,
} from './internal/ot/room/dicePieceValue/log';

export {
    apply as applyImagePieceValue,
    diff as imagePieceValueDiff,
    toUpOperation as toImagePieceValueUpOperation,
} from './internal/ot/room/imagePieceValue/functions';

export {
    State as ImagePieceValueState,
    UpOperation as ImagePieceValueUpOperation,
    DownOperation as ImagePieceValueDownOperation,
} from './internal/ot/room/imagePieceValue/types';

export {
    apply as applyNumberPieceValue,
    diff as stringPieceValueDiff,
    toUpOperation as toStringPieceValueUpOperation,
} from './internal/ot/room/stringPieceValue/functions';

export {
    State as StringPieceValueState,
    UpOperation as StringPieceValueUpOperation,
    DownOperation as StringPieceValueDownOperation,
    String,
    Number,
} from './internal/ot/room/stringPieceValue/types';

export {
    decode as decodeStringPieceValue,
    parse as parseStringPieceValue,
    exact as exactStringPieceValue,
} from './internal/ot/room/stringPieceValue/converter';

export {
    type as stringPieceValueLog,
    Type as StringPieceValueLog,
} from './internal/ot/room/stringPieceValue/log';

export {
    State as MemoState,
    UpOperation as MemoUpOperation,
    DownOperation as MemoDownOperation,
    Plain,
    Markdown,
} from './internal/ot/room/memo/types';

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

export { updateType, createType, deleteType } from './internal/ot/piece/log';

export { createLogs } from './internal/ot/room/log';

export { StateManager } from './internal/stateManagers/stateManager';

export {
    Apply,
    Compose,
    Transform,
    Diff,
    StateManagerParameters,
} from './internal/stateManagers/types';
