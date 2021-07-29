import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import path from 'path';
import admin from 'firebase-admin';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { ResolverContext } from './graphql+mikro-orm/utils/Contexts';
import registerEnumTypes from './graphql+mikro-orm/registerEnumTypes';
import { buildSchema } from './buildSchema';
import { PromiseQueue } from './utils/PromiseQueue';
import { createPostgreSQL, createSQLite } from './mikro-orm';
import { firebaseConfig, loadServerConfigAsMain, postgresql, sqlite } from './config';
import ws from 'ws';
import { Extra, useServer } from 'graphql-ws/lib/use/ws';
import { execute, subscribe } from 'graphql';
import { checkMigrationsBeforeStart } from './migrate';
import { InMemoryConnectionManager, pubSub } from './connection/main';
import { CustomResult, Result } from '@kizahasi/result';
import { authToken } from '@kizahasi/util';
import { Context } from 'graphql-ws/lib/server';
import { BaasType } from './enums/BaasType';

const main = async (params: { debug: boolean }): Promise<void> => {
    admin.initializeApp({
        projectId: firebaseConfig.projectId,
    });

    const connectionManager = new InMemoryConnectionManager();

    registerEnumTypes();

    const schema = await buildSchema({ emitSchemaFile: false, pubSub });
    const serverConfig = await loadServerConfigAsMain();
    const dbType = serverConfig.database.__type;
    const orm = await (async () => {
        try {
            switch (serverConfig.database.__type) {
                case postgresql:
                    return await createPostgreSQL({
                        ...serverConfig.database.postgresql,
                        debug: params.debug,
                    });
                case sqlite:
                    return await createSQLite({
                        ...serverConfig.database.sqlite,
                        debug: params.debug,
                    });
            }
        } catch (error) {
            console.error('Could not connect to the database!');
            throw error;
        }
    })();

    await checkMigrationsBeforeStart(orm, dbType);

    const getDecodedIdToken = async (
        idToken: string
    ): Promise<CustomResult<admin.auth.DecodedIdToken & { type: BaasType.Firebase }, any>> => {
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
        CustomResult<admin.auth.DecodedIdToken & { type: BaasType.Firebase }, any> | undefined
    > => {
        // bearerのフォーマットはだいたいこんな感じ
        // 'Bearer aNGoGo3ngC.oepGJoGoeo34Ha.Oge03mvQgeo4H'
        if (bearer == null || !bearer.startsWith('Bearer ')) {
            return undefined;
        }
        const idToken = bearer.replace('Bearer ', '');
        return await getDecodedIdToken(idToken);
    };

    const getDecodedIdTokenFromContext = async (ctx: Context<Extra>) => {
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

    // 戻り値はTだけでなくPromise<T>でもいいのでasyncを使っている
    const context = async (context: ExpressContext): Promise<ResolverContext> => {
        return {
            decodedIdToken: await getDecodedIdTokenFromBearer(context.req.headers.authorization),
            promiseQueue,
            connectionManager,
            createEm: () => orm.em.fork(),
        };
    };

    // The ApolloServer constructor requires two parameters: your schema
    // definition and your set of resolvers.
    const apolloServer = new ApolloServer({
        schema,
        context,
        debug: params.debug,
    });
    await apolloServer.start();

    const app = express();

    // 先に書くほど優先度が高いみたいなので、applyMiddlewareを先に書くと、/graphqlが上書きされない。
    apolloServer.applyMiddleware({ app });
    app.use(express.static(path.join(process.cwd(), 'root'))); // expressにアップローダー機能をつけてroot配下に置く機能を実装するときに使う。ただ優先度は低い

    const PORT = process.env.PORT ?? 4000;

    // https://github.com/enisdenjo/graphql-ws のコードを使用
    const server = app.listen(PORT, () => {
        const subscriptionsPath = '/graphql';

        // create and use the websocket server
        const wsServer = new ws.Server({
            server,
            path: subscriptionsPath,
        });

        useServer(
            {
                schema,
                execute,
                subscribe,
                context: async ctx => {
                    const decodedIdToken = await getDecodedIdTokenFromContext(ctx);
                    return {
                        decodedIdToken,
                        promiseQueue,
                        connectionManager,
                        createEm: () => orm.em.fork(),
                    } as ResolverContext;
                },
                onSubscribe: async (ctx, message) => {
                    if (message.payload.operationName?.toLowerCase() !== 'roomevent') {
                        return;
                    }
                    const decodedIdToken = await getDecodedIdTokenFromContext(ctx);
                    if (decodedIdToken?.isError !== false) {
                        return;
                    }

                    const roomId = message.payload.variables?.id;
                    if (typeof roomId === 'string') {
                        connectionManager.onConnectToRoom({
                            connectionId: message.id,
                            userUid: decodedIdToken.value.uid,
                            roomId,
                        });
                    } else {
                        console.warn('(typeof RoomEvent.id) should be string');
                    }
                },
                onComplete: async (ctx, message) => {
                    connectionManager.onLeaveRoom({ connectionId: message.id });
                },
                onClose: ctx => {
                    for (const key in ctx.subscriptions) {
                        connectionManager.onLeaveRoom({ connectionId: key });
                    }
                },
            },
            wsServer
        );

        console.log(`🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`);
        console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${subscriptionsPath}`);
    });
};

export default main;
