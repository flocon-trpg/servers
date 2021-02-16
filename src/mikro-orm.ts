import { Connection, IDatabaseDriver, LoggerNamespace, MikroORM } from '@mikro-orm/core';
import { AddBoardOp, Board, BoardBase, RemoveBoardOp, UpdateBoardOp } from './graphql+mikro-orm/entities/board/mikro-orm';
import { CharaBase, Chara, AddCharaOp, RemoveCharaOp, UpdateCharaOp } from './graphql+mikro-orm/entities/character/mikro-orm';
import { AddPieceLocOp, PieceLoc, PieceLocBase, RemovedPieceLoc, RemovePieceLocOp, UpdatePieceLocOp } from './graphql+mikro-orm/entities/character/pieceLocation/mikro-orm';
import { Room, RoomOp } from './graphql+mikro-orm/entities/room/mikro-orm';
import { RoomPrvMsg, RoomPubCh, RoomPubMsg, RoomSe } from './graphql+mikro-orm/entities/roomMessage/mikro-orm';
import { User } from './graphql+mikro-orm/entities/user/mikro-orm';
import { EM } from './utils/types';
import { AddParamNameOp, ParamName, ParamNameBase, RemoveParamNameOp, UpdateParamNameOp } from './graphql+mikro-orm/entities/room/paramName/mikro-orm';
import { AddRoomBgmOp, RemoveRoomBgmOp, RoomBgm, RoomBgmBase, UpdateRoomBgmOp } from './graphql+mikro-orm/entities/room/bgm/mikro-orm';
import { BoolParam, BoolParamBase, RemovedBoolParam, UpdateBoolParamOp } from './graphql+mikro-orm/entities/character/boolParam/mikro-orm';
import { NumParamBase, NumParam, RemovedNumParam, AddNumParamOp, UpdateNumParamOp, NumMaxParam, NumMaxParamBase, RemovedNumMaxParam, UpdateNumMaxParamOp } from './graphql+mikro-orm/entities/character/numParam/mikro-orm';
import { StrParamBase, StrParam, RemovedStrParam, UpdateStrParamOp } from './graphql+mikro-orm/entities/character/strParam/mikro-orm';
import { AddParticiOp, Partici, ParticiOp, UpdateParticiOp } from './graphql+mikro-orm/entities/participant/mikro-orm';

const entities = [
    BoardBase,
    Board,
    AddBoardOp,
    RemoveBoardOp,
    UpdateBoardOp,

    CharaBase,
    Chara,
    AddCharaOp,
    RemoveCharaOp,
    UpdateCharaOp,

    BoolParamBase,
    BoolParam,
    RemovedBoolParam,
    UpdateBoolParamOp,

    NumParamBase,
    NumParam,
    RemovedNumParam,
    AddNumParamOp,
    UpdateNumParamOp,

    NumMaxParamBase,
    NumMaxParam,
    RemovedNumMaxParam,
    UpdateNumMaxParamOp,

    StrParamBase,
    StrParam,
    RemovedStrParam,
    UpdateStrParamOp,

    Partici,
    ParticiOp,
    AddParticiOp,
    UpdateParticiOp,

    PieceLocBase,
    PieceLoc,
    RemovedPieceLoc,
    AddPieceLocOp,
    RemovePieceLocOp,
    UpdatePieceLocOp,

    ParamNameBase,
    ParamName,
    AddParamNameOp,
    RemoveParamNameOp,
    UpdateParamNameOp,

    RoomBgmBase,
    RoomBgm,
    AddRoomBgmOp,
    RemoveRoomBgmOp,
    UpdateRoomBgmOp,

    Room,
    RoomOp,
    RoomPubMsg,
    RoomPrvMsg,
    RoomPubCh,
    RoomSe,
    User,
];

type Debug = boolean | LoggerNamespace[];

export const createSQLite = async ({ dbName, debug }: { dbName: string; debug?: Debug }): Promise<MikroORM<IDatabaseDriver<Connection>>> => {
    // TODO: dbNameを変える、パスもここからのディレクトリではなく実行されるtypescriptファイルの位置が基準となりわかりにくいので変える。
    return await MikroORM.init({
        entities,
        dbName,
        migrations: {
            path: './migrations/sqlite'
        },
        type: 'sqlite',
        forceUndefined: true,
        debug,
    });
};

export const createPostgreSQL = async ({ dbName, clientUrl, debug }: { dbName: string; clientUrl: string; debug?: Debug }): Promise<MikroORM<IDatabaseDriver<Connection>>> => {
    return await MikroORM.init({
        entities,
        dbName,
        migrations: {
            path: './migrations/postgresql'
        },
        type: 'postgresql',
        debug,
        forceUndefined: true,
        clientUrl,
    });
};
