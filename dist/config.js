"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadServerConfigAsMigrationDown = exports.loadServerConfigAsMigrationUp = exports.loadServerConfigAsMigrationCreate = exports.loadServerConfigAsMain = exports.firebaseConfig = exports.sqlite = exports.postgresql = void 0;
const util_1 = require("@kizahasi/util");
const commandLineArgs_1 = require("./utils/commandLineArgs");
exports.postgresql = 'postgresql';
exports.sqlite = 'sqlite';
const loadFirebaseConfig = () => {
    let env = process.env['FLOCON_FIREBASE_CONFIG'];
    if (env == null) {
        env = process.env['NEXT_PUBLIC_FLOCON_FIREBASE_CONFIG'];
    }
    if (env == null) {
        throw new Error('Firebase config is not found. Set FLOCON_FIREBASE_CONFIG or NEXT_PUBLIC_FLOCON_FIREBASE_CONFIG environment variable.');
    }
    const json = JSON.parse(env);
    return util_1.createFirebaseConfig(json);
};
const loadServerConfig = ({ databaseArg }) => {
    var _a, _b;
    const env = process.env['FLOCON_API_CONFIG'];
    if (env == null) {
        throw new Error('Server config is not found. Set FLOCON_API_CONFIG environment variable.');
    }
    const json = JSON.parse(env);
    const j = util_1.JsonObject.init(json);
    const postgresqlJson = j.get('database').tryGet('postgresql');
    const sqliteJson = j.get('database').tryGet('sqlite');
    let database;
    switch (databaseArg) {
        case null:
            database = (() => {
                if (sqliteJson != null) {
                    if (postgresqlJson != null) {
                        throw new Error('When server config has SQLite and PostgreSQL config, you must use --db parameter.');
                    }
                    return {
                        __type: 'sqlite',
                        sqlite: {
                            dbName: sqliteJson.get('dbName').valueAsString(),
                        }
                    };
                }
                if (postgresqlJson == null) {
                    throw new Error('database/postgresql or database/sqlite is required.');
                }
                return {
                    __type: exports.postgresql,
                    postgresql: {
                        dbName: postgresqlJson.get('dbName').valueAsString(),
                        clientUrl: postgresqlJson.get('clientUrl').valueAsString(),
                    }
                };
            })();
            break;
        case exports.sqlite: {
            if (sqliteJson == null) {
                throw new Error('database/sqlite is required.');
            }
            database = {
                __type: exports.sqlite,
                sqlite: {
                    dbName: sqliteJson.get('dbName').valueAsString(),
                }
            };
            break;
        }
        case exports.postgresql: {
            if (postgresqlJson == null) {
                throw new Error('database/postgresql is required.');
            }
            database = {
                __type: exports.postgresql,
                postgresql: {
                    dbName: postgresqlJson.get('dbName').valueAsString(),
                    clientUrl: postgresqlJson.get('clientUrl').valueAsString(),
                }
            };
            break;
        }
    }
    return {
        globalEntryPhrase: (_b = (_a = j.tryGet('globalEntryPhrase')) === null || _a === void 0 ? void 0 : _a.valueAsString()) !== null && _b !== void 0 ? _b : undefined,
        database,
    };
};
exports.firebaseConfig = loadFirebaseConfig();
let serverConfigAsMainCache = null;
const loadServerConfigAsMain = async () => {
    var _a;
    if (serverConfigAsMainCache == null) {
        serverConfigAsMainCache = loadServerConfig({ databaseArg: (_a = (await commandLineArgs_1.loadAsMain()).db) !== null && _a !== void 0 ? _a : null });
    }
    return serverConfigAsMainCache;
};
exports.loadServerConfigAsMain = loadServerConfigAsMain;
let serverConfigAsMigrationCreateCache = null;
const loadServerConfigAsMigrationCreate = async () => {
    if (serverConfigAsMigrationCreateCache == null) {
        serverConfigAsMigrationCreateCache = loadServerConfig({ databaseArg: (await commandLineArgs_1.loadMigrationCreate()).db });
    }
    return serverConfigAsMigrationCreateCache;
};
exports.loadServerConfigAsMigrationCreate = loadServerConfigAsMigrationCreate;
let serverConfigAsMigrationUpCache = null;
const loadServerConfigAsMigrationUp = async () => {
    if (serverConfigAsMigrationUpCache == null) {
        serverConfigAsMigrationUpCache = loadServerConfig({ databaseArg: (await commandLineArgs_1.loadMigrationUp()).db });
    }
    return serverConfigAsMigrationUpCache;
};
exports.loadServerConfigAsMigrationUp = loadServerConfigAsMigrationUp;
let serverConfigAsMigrationDownCache = null;
const loadServerConfigAsMigrationDown = async () => {
    if (serverConfigAsMigrationDownCache == null) {
        const loaded = await commandLineArgs_1.loadMigrationDown();
        serverConfigAsMigrationDownCache = Object.assign(Object.assign({}, loadServerConfig({ databaseArg: loaded.db })), { count: loaded.count });
    }
    return serverConfigAsMigrationDownCache;
};
exports.loadServerConfigAsMigrationDown = loadServerConfigAsMigrationDown;
