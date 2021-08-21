"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareORM = exports.createPostgreSQL = exports.createSQLite = void 0;
const core_1 = require("@mikro-orm/core");
const configType_1 = require("./configType");
const mikro_orm_1 = require("./graphql+mikro-orm/entities/file/mikro-orm");
const mikro_orm_2 = require("./graphql+mikro-orm/entities/room/mikro-orm");
const mikro_orm_3 = require("./graphql+mikro-orm/entities/roomMessage/mikro-orm");
const mikro_orm_4 = require("./graphql+mikro-orm/entities/user/mikro-orm");
const entities = [
    mikro_orm_2.Room,
    mikro_orm_2.RoomOp,
    mikro_orm_3.RoomPubMsg,
    mikro_orm_3.RoomPrvMsg,
    mikro_orm_3.DicePieceValueLog,
    mikro_orm_3.NumberPieceValueLog,
    mikro_orm_3.RoomPubCh,
    mikro_orm_3.RoomSe,
    mikro_orm_4.User,
    mikro_orm_1.File,
];
const createSQLite = async ({ dbName, debug, }) => {
    return await core_1.MikroORM.init({
        entities,
        dbName,
        migrations: {
            path: './migrations/sqlite',
        },
        type: 'sqlite',
        forceUndefined: true,
        debug,
    });
};
exports.createSQLite = createSQLite;
const createPostgreSQL = async ({ dbName, clientUrl, debug, }) => {
    return await core_1.MikroORM.init({
        entities,
        dbName,
        migrations: {
            path: './migrations/postgresql',
        },
        type: 'postgresql',
        debug,
        forceUndefined: true,
        clientUrl,
    });
};
exports.createPostgreSQL = createPostgreSQL;
const prepareORM = async (config, debug) => {
    try {
        switch (config.__type) {
            case configType_1.postgresql:
                return await exports.createPostgreSQL(Object.assign(Object.assign({}, config), { debug }));
            case configType_1.sqlite:
                return await exports.createSQLite(Object.assign(Object.assign({}, config), { debug }));
        }
    }
    catch (error) {
        console.error('Could not connect to the database!');
        throw error;
    }
};
exports.prepareORM = prepareORM;
