'use strict';

var FilePathModule = require('@flocon-trpg/core');
var utils = require('@flocon-trpg/utils');
var result = require('@kizahasi/result');
var admin = require('firebase-admin');
var VERSION = require('./VERSION.js');
var buildSchema = require('./buildSchema.js');
var createORM = require('./config/createORM.js');
var createORMOptions = require('./config/createORMOptions.js');
var logConfigParser = require('./config/logConfigParser.js');
var serverConfigParser = require('./config/serverConfigParser.js');
var main$1 = require('./connection/main.js');
var createServer = require('./createServer.js');
var BaasType = require('./enums/BaasType.js');
var env = require('./env.js');
var initializeLogger = require('./initializeLogger.js');
var migrate = require('./migrate.js');
var appConsole = require('./utils/appConsole.js');
var commandLineArgs = require('./utils/commandLineArgs.js');
var promiseQueue = require('./utils/promiseQueue.js');

const logEntryPasswordConfig = (serverConfig) => {
    if (serverConfig.entryPassword == null) {
        appConsole.AppConsole.infoAsNotice({
            icon: '🔓',
            en: 'Entry password is disabled.',
            ja: 'エントリーパスワードは無効化されています。',
        });
    }
    else {
        appConsole.AppConsole.infoAsNotice({
            icon: '🔐',
            en: 'Entry password is enabled.',
            ja: 'エントリーパスワードは有効化されています。',
        });
    }
};
const main = async (params) => {
    const logConfigResult = new logConfigParser.LogConfigParser(process.env).logConfig;
    initializeLogger.initializeLogger(logConfigResult);
    appConsole.AppConsole.infoAsNotice({
        en: `Flocon API Server v${VERSION.VERSION.toString()}`,
    });
    const port = process.env.PORT ?? 4000;
    const onError = async (message) => {
        utils.loggerRef.error(message);
        await createServer.createServerAsError({
            port,
        });
    };
    const commandLineArgs$1 = await commandLineArgs.loadAsMain();
    const serverConfigParser$1 = new serverConfigParser.ServerConfigParser(process.env);
    const serverConfigResult = serverConfigParser$1.serverConfig;
    if (serverConfigResult.isError) {
        await onError(serverConfigResult.error);
        return;
    }
    const serverConfig = serverConfigResult.value;
    const orm = await createORM.createORM(createORMOptions.createORMOptions(serverConfig, commandLineArgs$1.db, 'dist'));
    if (orm.isError) {
        await onError(orm.error);
        return;
    }
    if (serverConfig.firebaseAdminSecret == null) {
        if (serverConfig.firebaseProjectId == null) {
            await onError(`FirebaseのプロジェクトIDを取得できませんでした。${env.FIREBASE_PROJECT_ID} にプロジェクトIDをセットしてください。`);
            return;
        }
        admin.initializeApp({
            projectId: serverConfig.firebaseProjectId,
        });
    }
    else {
        const projectId = serverConfig.firebaseAdminSecret.project_id ?? serverConfig.firebaseProjectId;
        admin.initializeApp({
            projectId,
            credential: admin.credential.cert({
                projectId,
                clientEmail: serverConfig.firebaseAdminSecret.client_email,
                privateKey: serverConfig.firebaseAdminSecret.private_key,
            }),
        });
    }
    const schema = await buildSchema.buildSchema(serverConfig)({ emitSchemaFile: false, pubSub: main$1.pubSub });
    if (serverConfig.autoMigration) {
        await migrate.doAutoMigrationBeforeStart(orm.value);
    }
    await migrate.checkMigrationsBeforeStart(orm.value);
    logEntryPasswordConfig(serverConfig);
    const getDecodedIdToken = async (idToken) => {
        const decodedIdToken = await admin
            .auth()
            .verifyIdToken(idToken)
            .then(result.Result.ok)
            .catch(result.Result.error);
        if (decodedIdToken.isError) {
            return decodedIdToken;
        }
        return result.Result.ok({
            ...decodedIdToken.value,
            type: BaasType.BaasType.Firebase,
        });
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
            const authTokenValueAsUnknown = ctx.connectionParams[FilePathModule.authToken];
            if (typeof authTokenValueAsUnknown === 'string') {
                authTokenValue = authTokenValueAsUnknown;
            }
        }
        return authTokenValue == null ? undefined : await getDecodedIdToken(authTokenValue);
    };
    const connectionManager = new main$1.InMemoryConnectionManager();
    const promiseQueue$1 = new promiseQueue.PromiseQueue({ queueLimit: 50 });
    await createServer.createServer({
        promiseQueue: promiseQueue$1,
        serverConfig,
        connectionManager,
        em: orm.value.em,
        schema,
        debug: params.debug,
        port: process.env.PORT ?? 4000,
        getDecodedIdTokenFromExpressRequest: context => getDecodedIdTokenFromBearer(context.headers.authorization),
        getDecodedIdTokenFromWsContext,
    });
};

exports.main = main;
//# sourceMappingURL=main.js.map
