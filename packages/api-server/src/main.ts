import admin from 'firebase-admin';
import { buildSchema } from './buildSchema';
import { PromiseQueue } from './utils/promiseQueue';
import { prepareORM } from './mikro-orm';
import { loadFirebaseConfig, loadServerConfigAsMain } from './config';
import { Extra } from 'graphql-ws/lib/use/ws';
import { doAutoMigrationBeforeStart, checkMigrationsBeforeStart } from './migrate';
import { InMemoryConnectionManager, pubSub } from './connection/main';
import { Result } from '@kizahasi/result';
import { authToken } from '@flocon-trpg/core';
import { Context } from 'graphql-ws/lib/server';
import { BaasType } from './enums/BaasType';
import { AppConsole } from './utils/appConsole';
import { ServerConfig } from './configType';
import { createServer } from './createServer';

const logEntryPasswordConfig = (serverConfig: ServerConfig) => {
    if (serverConfig.entryPassword == null) {
        AppConsole.log({
            icon: '🔓',
            en: 'Entry password is disabled.',
            ja: 'エントリーパスワードは無効化されています。',
        });
    } else {
        AppConsole.log({
            icon: '🔐',
            en: 'Entry password is enabled.',
            ja: 'エントリーパスワードは有効化されています。',
        });
    }
};

export const main = async (params: { debug: boolean }): Promise<void> => {
    const firebaseConfig = loadFirebaseConfig();

    const serverConfig = await loadServerConfigAsMain();

    admin.initializeApp({
        projectId: firebaseConfig.projectId,
        credential:
            serverConfig.firebaseAdminSecret == null
                ? undefined
                : admin.credential.cert({
                      projectId: firebaseConfig.projectId,
                      clientEmail: serverConfig.firebaseAdminSecret.clientEmail,
                      privateKey: serverConfig.firebaseAdminSecret.privateKey,
                  }),
    });

    const schema = await buildSchema(serverConfig)({ emitSchemaFile: false, pubSub });
    const dbType = serverConfig.database.__type;
    const orm = await prepareORM(serverConfig.database, params.debug);
    if (serverConfig.autoMigration) {
        await doAutoMigrationBeforeStart(orm, dbType);
    }
    await checkMigrationsBeforeStart(orm, dbType);
    logEntryPasswordConfig(serverConfig);

    const getDecodedIdToken = async (
        idToken: string
    ): Promise<Result<admin.auth.DecodedIdToken & { type: BaasType.Firebase }, unknown>> => {
        const decodedIdToken = await admin
            .auth()
            .verifyIdToken(idToken)
            .then(Result.ok)
            .catch(Result.error);
        if (decodedIdToken.isError) {
            return decodedIdToken;
        }
        return Result.ok({
            ...decodedIdToken.value,
            type: BaasType.Firebase,
        });
    };

    const getDecodedIdTokenFromBearer = async (
        bearer: string | undefined
    ): Promise<
        Result<admin.auth.DecodedIdToken & { type: BaasType.Firebase }, unknown> | undefined
    > => {
        // bearerのフォーマットはだいたいこんな感じ
        // 'Bearer aNGoGo3ngC.oepGJoGoeo34Ha.Oge03mvQgeo4H'
        if (bearer == null || !bearer.startsWith('Bearer ')) {
            return undefined;
        }
        const idToken = bearer.replace('Bearer ', '');
        return await getDecodedIdToken(idToken);
    };

    const getDecodedIdTokenFromWsContext = async (ctx: Context<Extra>) => {
        let authTokenValue: string | undefined;
        if (ctx.connectionParams != null) {
            const authTokenValueAsUnknown = ctx.connectionParams[authToken];
            if (typeof authTokenValueAsUnknown === 'string') {
                authTokenValue = authTokenValueAsUnknown;
            }
        }
        return authTokenValue == null ? undefined : await getDecodedIdToken(authTokenValue);
    };

    const connectionManager = new InMemoryConnectionManager();

    // TODO: queueLimitの値をきちんと決める
    const promiseQueue = new PromiseQueue({ queueLimit: 50 });

    await createServer({
        promiseQueue,
        serverConfig,
        connectionManager,
        em: orm.em,
        schema,
        debug: params.debug,
        port: process.env.PORT ?? 4000,
        getDecodedIdTokenFromExpressRequest: context =>
            getDecodedIdTokenFromBearer(context.headers.authorization),
        getDecodedIdTokenFromWsContext,
    });
};
