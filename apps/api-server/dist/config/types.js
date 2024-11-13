'use strict';

var zod = require('zod');

const postgresql = 'postgresql';
const sqlite = 'sqlite';
const mysql = 'mysql';
const plain = 'plain';
const bcrypt = 'bcrypt';
const none = 'none';
const driverOptionsConfig = zod.z
    .object({
    driverOptions: zod.z.record(zod.z.unknown()),
})
    .partial();
const clientUrlType = zod.z.object({
    clientUrl: zod.z.string(),
});
const dbNamePartial = zod.z
    .object({
    dbName: zod.z.string(),
})
    .partial();
const mysqlDatabase = driverOptionsConfig.merge(dbNamePartial).merge(clientUrlType);
const postgresqlDatabase = driverOptionsConfig.merge(dbNamePartial).merge(clientUrlType);
const sqliteDatabaseCore = zod.z.union([
    zod.z.object({
        dbName: zod.z.string(),
        clientUrl: zod.z.undefined(),
    }),
    zod.z.object({
        dbName: zod.z.undefined(),
        clientUrl: zod.z.string(),
    }),
    zod.z.object({
        dbName: zod.z.string(),
        clientUrl: zod.z.string(),
    }),
]);
const sqliteDatabase = driverOptionsConfig.and(sqliteDatabaseCore);
const firebaseAdminSecret = zod.z
    .object({
    client_email: zod.z.string(),
    private_key: zod.z.string(),
})
    .merge(zod.z
    .object({
    project_id: zod.z.string(),
})
    .partial());
const entryPassword = zod.z.union([
    zod.z.object({ type: zod.z.literal(none) }),
    zod.z.object({
        type: zod.z.union([zod.z.literal(plain), zod.z.literal(bcrypt)]),
        value: zod.z.string(),
    }),
]);
const json = 'json';
const $default = 'default';

exports.$default = $default;
exports.bcrypt = bcrypt;
exports.entryPassword = entryPassword;
exports.firebaseAdminSecret = firebaseAdminSecret;
exports.json = json;
exports.mysql = mysql;
exports.mysqlDatabase = mysqlDatabase;
exports.none = none;
exports.plain = plain;
exports.postgresql = postgresql;
exports.postgresqlDatabase = postgresqlDatabase;
exports.sqlite = sqlite;
exports.sqliteDatabase = sqliteDatabase;
//# sourceMappingURL=types.js.map
