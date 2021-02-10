import { Connection, IDatabaseDriver, LoggerNamespace, MikroORM } from '@mikro-orm/core';
import { AddBoardOp, Board, BoardBase, RemoveBoardOp, UpdateBoardOp } from './graphql+typegoose/entities/board/mikro-orm';
import { CharaBase, Chara, AddCharaOp, RemoveCharaOp, UpdateCharaOp } from './graphql+typegoose/entities/character/mikro-orm';
import { Participant } from './graphql+typegoose/entities/participant/mikro-orm';
import { AddPieceLocOp, PieceLoc, PieceLocBase, RemovedPieceLoc, RemovePieceLocOp, UpdatePieceLocOp } from './graphql+typegoose/entities/character/pieceLocation/mikro-orm';
import { Room, RoomOp } from './graphql+typegoose/entities/room/mikro-orm';
import { RoomPrvMsg, RoomPubCh, RoomPubMsg, RoomSe } from './graphql+typegoose/entities/roomMessage/mikro-orm';
import { User } from './graphql+typegoose/entities/user/mikro-orm';
import { EM } from './utils/types';
import { AddParamNameOp, ParamName, ParamNameBase, RemoveParamNameOp, UpdateParamNameOp } from './graphql+typegoose/entities/room/paramName/mikro-orm';
import { AddRoomBgmOp, RemoveRoomBgmOp, RoomBgm, RoomBgmBase, UpdateRoomBgmOp } from './graphql+typegoose/entities/room/bgm/mikro-orm';
import { BoolParam, BoolParamBase, RemovedBoolParam, UpdateBoolParamOp } from './graphql+typegoose/entities/character/boolParam/mikro-orm';
import { NumParamBase, NumParam, RemovedNumParam, AddNumParamOp, UpdateNumParamOp, NumMaxParam, NumMaxParamBase, RemovedNumMaxParam, UpdateNumMaxParamOp } from './graphql+typegoose/entities/character/numParam/mikro-orm';
import { StrParamBase, StrParam, RemovedStrParam, UpdateStrParamOp } from './graphql+typegoose/entities/character/strParam/mikro-orm';

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

    Participant,

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
