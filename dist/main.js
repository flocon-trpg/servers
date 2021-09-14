"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const buildSchema_1 = require("./buildSchema");
const promiseQueue_1 = require("./utils/promiseQueue");
const mikro_orm_1 = require("./mikro-orm");
const config_1 = require("./config");
const migrate_1 = require("./migrate");
const main_1 = require("./connection/main");
const result_1 = require("@kizahasi/result");
const util_1 = require("@kizahasi/util");
const BaasType_1 = require("./enums/BaasType");
const appConsole_1 = require("./utils/appConsole");
const createServer_1 = require("./createServer");
const logEntryPasswordConfig = (serverConfig) => {
    if (serverConfig.entryPassword == null) {
        appConsole_1.AppConsole.log({
            icon: '🔓',
            en: 'Entry password is disabled.',
            ja: 'エントリーパスワードは無効化されています。',
        });
    }
    else {
        appConsole_1.AppConsole.log({
            icon: '🔐',
            en: 'Entry password is enabled.',
            ja: 'エントリーパスワードは有効化されています。',
        });
    }
};
const main = async (params) => {
    var _a;
    firebase_admin_1.default.initializeApp({
        projectId: config_1.loadFirebaseConfig().projectId,
    });
    const connectionManager = new main_1.InMemoryConnectionManager();
    const serverConfig = await config_1.loadServerConfigAsMain();
    const schema = await buildSchema_1.buildSchema(serverConfig)({ emitSchemaFile: false, pubSub: main_1.pubSub });
    const dbType = serverConfig.database.__type;
    const orm = await mikro_orm_1.prepareORM(serverConfig.database, params.debug);
    await migrate_1.checkMigrationsBeforeStart(orm, dbType);
    logEntryPasswordConfig(serverConfig);
    const getDecodedIdToken = async (idToken) => {
        const decodedIdToken = await firebase_admin_1.default
            .auth()
            .verifyIdToken(idToken)
            .then(result_1.Result.ok)
            .catch(result_1.Result.error);
        if (decodedIdToken.isError) {
            console.log('verifyIdToken failed: %o, %s', decodedIdToken.error, idToken);
            return decodedIdToken;
        }
        return result_1.Result.ok(Object.assign(Object.assign({}, decodedIdToken.value), { type: BaasType_1.BaasType.Firebase }));
    };
    const getDecodedIdTokenFromBearer = async (bearer) => {
        if (bearer == null || !bearer.startsWith('Bearer ')) {
            return undefined;
        }
        const idToken = bearer.replace('Bearer ', '');
        return await getDecodedIdToken(idToken);
    };
    const getDecodedIdTokenFromWsContext = async (ctx) => {
        let authTokenValue;
        if (ctx.connectionParams != null) {
            const authTokenValueAsUnknown = ctx.connectionParams[util_1.authToken];
            if (typeof authTokenValueAsUnknown === 'string') {
                authTokenValue = authTokenValueAsUnknown;
            }
        }
        return authTokenValue == null ? undefined : await getDecodedIdToken(authTokenValue);
    };
    const promiseQueue = new promiseQueue_1.PromiseQueue({ queueLimit: 50 });
    await createServer_1.createServer({
        promiseQueue,
        serverConfig,
        connectionManager,
        em: orm.em,
        schema,
        debug: params.debug,
        port: (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 4000,
        getDecodedIdTokenFromExpressRequest: context => getDecodedIdTokenFromBearer(context.headers.authorization),
        getDecodedIdTokenFromWsContext,
    });
};
exports.default = main;
