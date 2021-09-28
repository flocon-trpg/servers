import admin from 'firebase-admin';
import { buildSchema } from './buildSchema';
import { PromiseQueue } from './utils/promiseQueue';
import { prepareORM } from './mikro-orm';
import { loadFirebaseConfig, loadServerConfigAsMain } from './config';
import { Extra } from 'graphql-ws/lib/use/ws';
import { checkMigrationsBeforeStart } from './migrate';
import { InMemoryConnectionManager, pubSub } from './connection/main';
import { Result } from '@kizahasi/result';
import { authToken } from '@kizahasi/flocon-core';
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

const main = async (params: { debug: boolean }): Promise<void> => {
    admin.initializeApp({
        projectId: loadFirebaseConfig().projectId,
    });

    const connectionManager = new InMemoryConnectionManager();

    const serverConfig = await loadServerConfigAsMain();
    const schema = await buildSchema(serverConfig)({ emitSchemaFile: false, pubSub });
    const dbType = serverConfig.database.__type;
    const orm = await prepareORM(serverConfig.database, params.debug);
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

export default main;
