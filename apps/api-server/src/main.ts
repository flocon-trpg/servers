import admin from 'firebase-admin';
import { buildSchema } from './buildSchema';
import { PromiseQueue } from './utils/promiseQueue';
import { checkMigrationsBeforeStart, doAutoMigrationBeforeStart } from './migrate';
import { InMemoryConnectionManager, pubSub } from './connection/main';
import { Result } from '@kizahasi/result';
import { authToken } from '@flocon-trpg/core';
import { Context } from 'graphql-ws/lib/server';
import { BaasType } from './enums/BaasType';
import { AppConsole } from './utils/appConsole';
import { ServerConfig } from './config/types';
import { createServer, createServerAsError } from './createServer';
import { VERSION } from './VERSION';
import { ServerConfigParser } from './config/serverConfigParser';
import { loadAsMain } from './utils/commandLineArgs';
import { createORM, createORMOptions } from './config/createORM';
import { FIREBASE_PROJECTID } from './env';

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
    AppConsole.log({
        en: `Flocon API Server v${VERSION.toString()}`,
    });

    const port = process.env.PORT ?? 4000;

    const onError = async (message: string) => {
        console.error(message);
        await createServerAsError({
            port,
        });
    };

    const commandLineArgs = await loadAsMain();

    const serverConfigParser = new ServerConfigParser(process.env);
    const serverConfigResult = serverConfigParser.serverConfig;

    if (serverConfigResult.isError) {
        await onError(serverConfigResult.error);
        return;
    }

    const serverConfig = serverConfigResult.value;
    const orm = await createORM(
        createORMOptions(serverConfig, commandLineArgs.db, 'dist', commandLineArgs.debug)
    );

    if (orm.isError) {
        await onError(orm.error);
        return;
    }

    // credentialにundefinedを渡すと`Invalid Firebase app options passed as the first argument to initializeApp() for the app named "[DEFAULT]". The "credential" property must be an object which implements the Credential interface.`というエラーが出るので回避している
    if (serverConfig.firebaseAdminSecret == null) {
        if (serverConfig.firebaseProjectId == null) {
            await onError(
                `FirebaseのプロジェクトIDを取得できませんでした。${FIREBASE_PROJECTID} にプロジェクトIDをセットしてください。`
            );
            return;
        }

        admin.initializeApp({
            projectId: serverConfig.firebaseProjectId,
        });
    } else {
        admin.initializeApp({
            projectId: serverConfig.firebaseAdminSecret.project_id,
            credential: admin.credential.cert({
                projectId: serverConfig.firebaseAdminSecret.project_id,
                clientEmail: serverConfig.firebaseAdminSecret.client_email,
                privateKey: serverConfig.firebaseAdminSecret.private_key,
            }),
        });
    }

    const schema = await buildSchema(serverConfig)({ emitSchemaFile: false, pubSub });
    if (serverConfig.autoMigration) {
        await doAutoMigrationBeforeStart(orm.value);
    }
    await checkMigrationsBeforeStart(orm.value);
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

    const getDecodedIdTokenFromWsContext = async (ctx: Context) => {
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
        em: orm.value.em,
        schema,
        debug: params.debug,
        port: process.env.PORT ?? 4000,
        getDecodedIdTokenFromExpressRequest: context =>
            getDecodedIdTokenFromBearer(context.headers.authorization),
        getDecodedIdTokenFromWsContext,
    });
};
