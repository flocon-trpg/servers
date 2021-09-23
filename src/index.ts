import * as Command from './internal/ot/room/participant/character/command/v1';
import * as RecordOperation from './internal/ot/util/recordOperation';

export const privateCommandsDiff = ({
    prevState,
    nextState,
}: {
    prevState: Record<string, Command.State | undefined>;
    nextState: Record<string, Command.State | undefined>;
}): RecordOperation.RecordUpOperation<Command.State, Command.UpOperation> | undefined => {
    return RecordOperation.diff<Command.State, Command.UpOperation>({
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

export { maybe, Maybe } from './internal/maybe';

export { PublicChannelKey } from './internal/publicChannelKey';

export { Cache, createNodeCache, createRedisCache } from './internal/cache/main';

export {
    isValidVarToml,
    parseToml,
    getVariableFromVarTomlObject,
    isValidChatPalette,
    generateChatPalette,
} from './internal/toml';

export { testCommand, execCharacterCommand } from './internal/flocommand/main';

export { Default, Uploader, FirebaseStorage, FilePath } from './internal/ot/filePath/v1';

export { Expression, plain, expr1, analyze } from './internal/expression';

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
} from './internal/ot/room/v1';

export {
    State as BgmState,
    UpOperation as BgmUpOperation,
    DownOperation as BgmDownOperation,
} from './internal/ot/room/bgm/v1';

export {
    State as ParamNameState,
    UpOperation as ParamNameUpOperation,
    DownOperation as ParamNameDownOperation,
} from './internal/ot/room/paramName/v1';

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
    State as BoardLocationState,
    UpOperation as BoardLocationUpOperation,
    DownOperation as BoardLocationDownOperation,
    apply as applyBoardLocation,
    diff as boardLocationDiff,
    toUpOperation as toBoardLocationUpOperation,
} from './internal/ot/boardLocation/v1';

export {
    Master,
    Player,
    Spectator,
    ParticipantRole,
    State as ParticipantState,
    DbState as ParticipantDbState,
    UpOperation as ParticipantUpOperation,
    DownOperation as ParticipantDownOperation,
} from './internal/ot/room/participant/v1';

export {
    State as PieceState,
    UpOperation as PieceUpOperation,
    DownOperation as PieceDownOperation,
    apply as applyPiece,
    diff as pieceDiff,
    toUpOperation as toPieceUpOperation,
} from './internal/ot/piece/v1';

export {
    State as BoardState,
    UpOperation as BoardUpOperation,
    DownOperation as BoardDownOperation,
    apply as applyBoard,
    diff as boardDiff,
    toUpOperation as toBoardUpOperation,
} from './internal/ot/room/participant/board/v1';

export {
    State as CharacterState,
    UpOperation as CharacterUpOperation,
    DownOperation as CharacterDownOperation,
    apply as applyCharacter,
    diff as characterDiff,
    toUpOperation as toCharacterUpOperation,
} from './internal/ot/room/participant/character/v1';

export {
    State as BoolParamState,
    UpOperation as BoolParamUpOperation,
    DownOperation as BoolParamCharacterDownOperation,
} from './internal/ot/room/participant/character/boolParam/v1';

export {
    State as NumParamState,
    UpOperation as NumParamUpOperation,
    DownOperation as NumParamCharacterDownOperation,
} from './internal/ot/room/participant/character/numParam/v1';

export {
    State as StrParamState,
    UpOperation as StrParamUpOperation,
    DownOperation as StrParamCharacterDownOperation,
    apply as applyStrParamCharacter,
    diff as strParamcharacterDiff,
    toUpOperation as toCharacterStrParamUpOperation,
} from './internal/ot/room/participant/character/strParam/v1';

export {
    State as DicePieceValueState,
    UpOperation as DicePieceValueUpOperation,
    DownOperation as DicePieceValueDownOperation,
    apply as applyDicePieceValue,
    diff as dicePieceValueDiff,
    toUpOperation as toDicePieceValueUpOperation,
    dicePieceValueStrIndexes,
} from './internal/ot/room/participant/character/dicePieceValue/v1';

export {
    decode as decodeDicePieceValue,
    parse as parseDicePieceValue,
    exact as exactDicePieceValue,
} from './internal/ot/room/participant/character/dicePieceValue/converter';

export {
    State as DieValueState,
    UpOperation as DieValueUpOperation,
    DownOperation as DieValueDownOperation,
    apply as applyDieValue,
    diff as dieValueDiff,
    toUpOperation as toDieValueUpOperation,
} from './internal/ot/room/participant/character/dicePieceValue/dieValue/v1';

export {
    type as dicePieceValueLog,
    Type as DicePieceValueLog,
} from './internal/ot/room/participant/character/dicePieceValue/log-v1';

export {
    State as ImagePieceValueState,
    UpOperation as ImagePieceValueUpOperation,
    DownOperation as ImagePieceValueDownOperation,
    apply as applyImagePieceValue,
    diff as imagePieceValueDiff,
    toUpOperation as toImagePieceValueUpOperation,
} from './internal/ot/room/participant/imagePieceValue/v1';

export {
    State as NumberPieceValueState,
    UpOperation as NumberPieceValueUpOperation,
    DownOperation as NumberPieceValueDownOperation,
    apply as applyNumberPieceValue,
    diff as numberPieceValueDiff,
    toUpOperation as toNumberPieceValueUpOperation,
} from './internal/ot/room/participant/character/numberPieceValue/v1';

export {
    decode as decodeNumberPieceValue,
    parse as parseNumberPieceValue,
    exact as exactNumberPieceValue,
} from './internal/ot/room/participant/character/numberPieceValue/converter';

export {
    type as numberPieceValueLog,
    Type as NumberPieceValueLog,
} from './internal/ot/room/participant/character/numberPieceValue/log-v1';

export {
    State as MemoState,
    UpOperation as MemoUpOperation,
    DownOperation as MemoDownOperation,
} from './internal/ot/room/memo/v1';

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

export { client, admin, restrict, RequestedBy } from './internal/ot/util/type';

export { updateType, createType, deleteType } from './internal/ot/piece/log-v1';

export { createLogs } from './internal/ot/room/log-v1';
