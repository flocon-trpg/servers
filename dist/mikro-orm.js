"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPostgreSQL = exports.createSQLite = void 0;
const core_1 = require("@mikro-orm/core");
const mikro_orm_1 = require("./graphql+mikro-orm/entities/room/mikro-orm");
const mikro_orm_2 = require("./graphql+mikro-orm/entities/roomMessage/mikro-orm");
const mikro_orm_3 = require("./graphql+mikro-orm/entities/user/mikro-orm");
const entities = [
    mikro_orm_1.Room,
    mikro_orm_1.RoomOp,
    mikro_orm_2.RoomPubMsg,
    mikro_orm_2.RoomPrvMsg,
    mikro_orm_2.MyValueLog,
    mikro_orm_2.RoomPubCh,
    mikro_orm_2.RoomSe,
    mikro_orm_3.User,
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
