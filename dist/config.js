"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadServerConfigAsMigrationDown = exports.loadServerConfigAsMigrationUp = exports.loadServerConfigAsMigrationCreate = exports.loadServerConfigAsMain = exports.firebaseConfig = void 0;
const flocon_core_1 = require("@kizahasi/flocon-core");
const configType_1 = require("./configType");
const commandLineArgs_1 = require("./utils/commandLineArgs");
const E = __importStar(require("fp-ts/Either"));
const io_ts_reporters_1 = require("./utils/io-ts-reporters");
const loadFirebaseConfig = () => {
    let env = process.env['FLOCON_FIREBASE_CONFIG'];
    if (env == null) {
        env = process.env['NEXT_PUBLIC_FLOCON_FIREBASE_CONFIG'];
    }
    if (env == null) {
        throw new Error('Firebase config is not found. Set FLOCON_FIREBASE_CONFIG or NEXT_PUBLIC_FLOCON_FIREBASE_CONFIG environment variable.');
    }
    const json = JSON.parse(env);
    const decoded = E.mapLeft(io_ts_reporters_1.formatValidationErrors)(flocon_core_1.firebaseConfig.decode(json));
    if (decoded._tag === 'Left') {
        throw new Error(decoded.left);
    }
    return decoded.right;
};
const loadServerConfig = ({ databaseArg, }) => {
    const env = process.env['FLOCON_API_CONFIG'];
    if (env == null) {
        throw new Error('Server config is not found. Set FLOCON_API_CONFIG environment variable.');
    }
    const json = JSON.parse(env);
    const j = E.mapLeft(io_ts_reporters_1.formatValidationErrors)(configType_1.serverConfigJson.decode(json));
    if (j._tag === 'Left') {
        throw new Error(j.left);
    }
    const right = j.right;
    let database;
    switch (databaseArg) {
        case null:
            database = (() => {
                if (right.database.sqlite != null) {
                    if (right.database.postgresql != null) {
                        throw new Error('When server config has SQLite and PostgreSQL config, you must use --db parameter.');
                    }
                    return Object.assign(Object.assign({}, right.database.sqlite), { __type: commandLineArgs_1.sqlite });
                }
                if (right.database.postgresql == null) {
                    throw new Error('database/postgresql or database/sqlite is required.');
                }
                return Object.assign(Object.assign({}, right.database.postgresql), { __type: configType_1.postgresql });
            })();
            break;
        case commandLineArgs_1.sqlite: {
            if (right.database.sqlite == null) {
                throw new Error('database/sqlite is required.');
            }
            database = Object.assign(Object.assign({}, right.database.sqlite), { __type: commandLineArgs_1.sqlite });
            break;
        }
        case configType_1.postgresql: {
            if (right.database.postgresql == null) {
                throw new Error('database/postgresql is required.');
            }
            database = Object.assign(Object.assign({}, right.database.postgresql), { __type: configType_1.postgresql });
            break;
        }
    }
    return {
        database,
        uploader: right.uploader,
        accessControlAllowOrigin: right.accessControlAllowOrigin,
    };
};
exports.firebaseConfig = loadFirebaseConfig();
let serverConfigAsMainCache = null;
const loadServerConfigAsMain = async () => {
    var _a;
    if (serverConfigAsMainCache == null) {
        serverConfigAsMainCache = loadServerConfig({
            databaseArg: (_a = (await commandLineArgs_1.loadAsMain()).db) !== null && _a !== void 0 ? _a : null,
        });
    }
    return serverConfigAsMainCache;
};
exports.loadServerConfigAsMain = loadServerConfigAsMain;
let serverConfigAsMigrationCreateCache = null;
const loadServerConfigAsMigrationCreate = async () => {
    if (serverConfigAsMigrationCreateCache == null) {
        serverConfigAsMigrationCreateCache = loadServerConfig({
            databaseArg: (await commandLineArgs_1.loadMigrationCreate()).db,
        });
    }
    return serverConfigAsMigrationCreateCache;
};
exports.loadServerConfigAsMigrationCreate = loadServerConfigAsMigrationCreate;
let serverConfigAsMigrationUpCache = null;
const loadServerConfigAsMigrationUp = async () => {
    if (serverConfigAsMigrationUpCache == null) {
        serverConfigAsMigrationUpCache = loadServerConfig({
            databaseArg: (await commandLineArgs_1.loadMigrationUp()).db,
        });
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
