"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPostgreSQL = exports.createSQLite = void 0;
const core_1 = require("@mikro-orm/core");
const mikro_orm_1 = require("./graphql+mikro-orm/entities/room/board/mikro-orm");
const mikro_orm_2 = require("./graphql+mikro-orm/entities/room/character/mikro-orm");
const mikro_orm_3 = require("./graphql+mikro-orm/entities/room/character/piece/mikro-orm");
const mikro_orm_4 = require("./graphql+mikro-orm/entities/room/mikro-orm");
const mikro_orm_5 = require("./graphql+mikro-orm/entities/roomMessage/mikro-orm");
const mikro_orm_6 = require("./graphql+mikro-orm/entities/user/mikro-orm");
const mikro_orm_7 = require("./graphql+mikro-orm/entities/room/paramName/mikro-orm");
const mikro_orm_8 = require("./graphql+mikro-orm/entities/room/bgm/mikro-orm");
const mikro_orm_9 = require("./graphql+mikro-orm/entities/room/character/boolParam/mikro-orm");
const mikro_orm_10 = require("./graphql+mikro-orm/entities/room/character/numParam/mikro-orm");
const mikro_orm_11 = require("./graphql+mikro-orm/entities/room/character/strParam/mikro-orm");
const mikro_orm_12 = require("./graphql+mikro-orm/entities/room/participant/mikro-orm");
const mikro_orm_value_1 = require("./graphql+mikro-orm/entities/room/participant/myValue/mikro-orm_value");
const mikro_orm_piece_1 = require("./graphql+mikro-orm/entities/room/participant/myValue/mikro-orm_piece");
const mikro_orm_13 = require("./graphql+mikro-orm/entities/room/character/tachie/mikro-orm");
const entities = [
    mikro_orm_1.BoardBase,
    mikro_orm_1.Board,
    mikro_orm_1.AddBoardOp,
    mikro_orm_1.RemoveBoardOp,
    mikro_orm_1.UpdateBoardOp,
    mikro_orm_2.CharaBase,
    mikro_orm_2.Chara,
    mikro_orm_2.AddCharaOp,
    mikro_orm_2.RemoveCharaOp,
    mikro_orm_2.UpdateCharaOp,
    mikro_orm_9.BoolParamBase,
    mikro_orm_9.BoolParam,
    mikro_orm_9.RemovedBoolParam,
    mikro_orm_9.UpdateBoolParamOp,
    mikro_orm_10.NumParamBase,
    mikro_orm_10.NumParam,
    mikro_orm_10.RemovedNumParam,
    mikro_orm_10.UpdateNumParamOp,
    mikro_orm_10.NumMaxParamBase,
    mikro_orm_10.NumMaxParam,
    mikro_orm_10.RemovedNumMaxParam,
    mikro_orm_10.UpdateNumMaxParamOp,
    mikro_orm_11.StrParamBase,
    mikro_orm_11.StrParam,
    mikro_orm_11.RemovedStrParam,
    mikro_orm_11.UpdateStrParamOp,
    mikro_orm_12.Partici,
    mikro_orm_12.AddParticiOp,
    mikro_orm_12.UpdateParticiOp,
    mikro_orm_12.RemoveParticiOp,
    mikro_orm_value_1.MyValue,
    mikro_orm_value_1.RemovedMyValue,
    mikro_orm_value_1.AddMyValueOp,
    mikro_orm_value_1.RemoveMyValueOp,
    mikro_orm_value_1.UpdateMyValueOp,
    mikro_orm_piece_1.MyValuePiece,
    mikro_orm_piece_1.RemovedMyValuePieceByPartici,
    mikro_orm_piece_1.RemovedMyValuePieceByMyValue,
    mikro_orm_piece_1.AddMyValuePieceOp,
    mikro_orm_piece_1.RemoveMyValuePieceOp,
    mikro_orm_piece_1.UpdateMyValuePieceOp,
    mikro_orm_3.CharaPieceBase,
    mikro_orm_3.CharaPiece,
    mikro_orm_3.RemovedCharaPiece,
    mikro_orm_3.AddCharaPieceOp,
    mikro_orm_3.RemoveCharaPieceOp,
    mikro_orm_3.UpdateCharaPieceOp,
    mikro_orm_13.TachieLocBase,
    mikro_orm_13.TachieLoc,
    mikro_orm_13.RemovedTachieLoc,
    mikro_orm_13.AddTachieLocOp,
    mikro_orm_13.RemoveTachieLocOp,
    mikro_orm_13.UpdateTachieLocOp,
    mikro_orm_7.ParamNameBase,
    mikro_orm_7.ParamName,
    mikro_orm_7.AddParamNameOp,
    mikro_orm_7.RemoveParamNameOp,
    mikro_orm_7.UpdateParamNameOp,
    mikro_orm_8.RoomBgmBase,
    mikro_orm_8.RoomBgm,
    mikro_orm_8.AddRoomBgmOp,
    mikro_orm_8.RemoveRoomBgmOp,
    mikro_orm_8.UpdateRoomBgmOp,
    mikro_orm_4.Room,
    mikro_orm_4.RoomOp,
    mikro_orm_5.RoomPubMsg,
    mikro_orm_5.RoomPrvMsg,
    mikro_orm_5.MyValueLog,
    mikro_orm_5.RoomPubCh,
    mikro_orm_5.RoomSe,
    mikro_orm_6.User,
];
const createSQLite = async ({ dbName, debug }) => {
    return await core_1.MikroORM.init({
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
exports.createSQLite = createSQLite;
const createPostgreSQL = async ({ dbName, clientUrl, debug }) => {
    return await core_1.MikroORM.init({
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
exports.createPostgreSQL = createPostgreSQL;
