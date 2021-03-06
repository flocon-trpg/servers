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
import { ServerConfig } from './configType';
import { createServer, createServerAsError } from './createServer';
import { VERSION } from './VERSION';
import { ServerConfigBuilder } from './config';
import { loadAsMain } from './utils/commandLineArgs';

const logEntryPasswordConfig = (serverConfig: ServerConfig) => {
    if (serverConfig.entryPassword == null) {
        AppConsole.log({
            icon: 'π',
            en: 'Entry password is disabled.',
            ja: 'γ¨γ³γγͺγΌγγΉγ―γΌγγ―η‘εΉεγγγ¦γγΎγγ',
        });
    } else {
        AppConsole.log({
            icon: 'π',
            en: 'Entry password is enabled.',
            ja: 'γ¨γ³γγͺγΌγγΉγ―γΌγγ―ζεΉεγγγ¦γγΎγγ',
        });
    }
};

export const main = async (params: { debug: boolean }): Promise<void> => {
    AppConsole.log({
        en: `Flocon API Server v${VERSION.toString()}`,
    });

    const port = process.env.PORT ?? 4000;

    const commandLineArgs = await loadAsMain();

    const serverConfigBuilder = new ServerConfigBuilder(process.env);
    const serverConfigResult = serverConfigBuilder.serverConfig;

    if (serverConfigResult.isError) {
        console.error(serverConfigResult.error);
        await createServerAsError({
            port,
        });
        return;
    }

    const serverConfig = serverConfigResult.value;
    const orm = await ServerConfig.createORM(
        serverConfig,
        commandLineArgs.db,
        'dist',
        commandLineArgs.debug
    );

    if (orm.isError) {
        console.error(orm.error);
        await createServerAsError({
            port,
        });
        return;
    }

    // credentialγ«undefinedγζΈ‘γγ¨`Invalid Firebase app options passed as the first argument to initializeApp() for the app named "[DEFAULT]". The "credential" property must be an object which implements the Credential interface.`γ¨γγγ¨γ©γΌγεΊγγ?γ§ειΏγγ¦γγ
    if (serverConfig.firebaseAdminSecret == null) {
        admin.initializeApp({
            projectId: serverConfig.firebaseProjectId,
        });
    } else {
        admin.initializeApp({
            projectId: serverConfig.firebaseProjectId,
            credential: admin.credential.cert({
                projectId: serverConfig.firebaseProjectId,
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
        // bearerγ?γγ©γΌγγγγ―γ γγγγγγͺζγ
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

    // TODO: queueLimitγ?ε€γγγ‘γγ¨ζ±Ίγγ
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
