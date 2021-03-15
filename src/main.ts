import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import path from 'path';
import admin from 'firebase-admin';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { authToken } from './@shared/Constants';
import { ResolverContext } from './graphql+mikro-orm/utils/Contexts';
import registerEnumTypes from './graphql+mikro-orm/registerEnumTypes';
import { buildSchema } from './buildSchema';
import { PromiseQueue } from './utils/PromiseQueue';
import { createPostgreSQL, createSQLite } from './mikro-orm';
import { firebaseConfig, loadServerConfigAsMain, postgresql, sqlite } from './config';
import { CustomResult, ResultModule } from './@shared/Result';
import ws from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { execute, subscribe } from 'graphql';
import { checkMigrationsBeforeStart } from './migrate';

const main = async (params: { debug: boolean }): Promise<void> => {
    admin.initializeApp({
        projectId: firebaseConfig.projectId,
    });

    registerEnumTypes();

    const schema = await buildSchema({ emitSchemaFile: false });
    const serverConfig = loadServerConfigAsMain();
    const dbType = serverConfig.database.__type;
    const orm = await (async () => {
        try {
            switch (serverConfig.database.__type) {
                case postgresql:
                    return await createPostgreSQL({...serverConfig.database.postgresql, debug: params.debug });
                case sqlite:
                    return await createSQLite({ ...serverConfig.database.sqlite, debug: params.debug } );
            }
        } catch (error) {
            console.error('Could not connect to the database!');
            throw error;
        }
    })();

    await checkMigrationsBeforeStart(orm, dbType);

    const getDecodedIdToken = async (idToken: string): Promise<CustomResult<admin.auth.DecodedIdToken, any>> => {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken).then(ResultModule.ok).catch(ResultModule.error);
        return decodedIdToken;
    };

    const getDecodedIdTokenFromBearer = async (bearer: string | undefined): Promise<CustomResult<admin.auth.DecodedIdToken, any> | undefined> => {
        // bearerのフォーマットはだいたいこんな感じ
        // 'Bearer aNGoGo3ngC.oepGJoGoeo34Ha.Oge03mvQgeo4H'
        if (bearer == null || !bearer.startsWith('Bearer ')) {
            return undefined;
        }
        const idToken = bearer.replace('Bearer ', '');
        return await getDecodedIdToken(idToken);
    };

    // TODO: queueLimitの値をきちんと決める
    const promiseQueue = new PromiseQueue({ queueLimit: 50 });

    // 戻り値はTだけでなくPromise<T>でもいいのでasyncを使っている
    const context = async (context: ExpressContext): Promise<ResolverContext> => {
        return {
            decodedIdToken: await getDecodedIdTokenFromBearer(context.req.headers.authorization),
            promiseQueue,
            createEm: () => orm.em.fork(),
        };
    };

    // The ApolloServer constructor requires two parameters: your schema
    // definition and your set of resolvers.
    const apolloServer = new ApolloServer({
        schema,
        context,
        subscriptions: {
            onConnect: connectionParams => connectionParams
        },
        debug: params.debug,
    });

    const app = express();

    // 先に書くほど優先度が高いみたいなので、applyMiddlewareを先に書くと、/graphqlが上書きされない。
    apolloServer.applyMiddleware({ app });
    app.use(express.static(path.join(process.cwd(), 'root'))); // expressにアップローダー機能をつけてroot配下に置く機能を実装するときに使う。ただ優先度は低い

    const PORT = process.env.PORT ?? 4000;

    // https://github.com/enisdenjo/graphql-ws のコードを使用
    const server = app.listen(PORT, () => {
        // create and use the websocket server
        const wsServer = new ws.Server({
            server,
            path: '/graphql',
        });

        useServer({
            schema,
            execute,
            subscribe,
            context: async ctx => {
                let decodedIdToken: string | undefined;
                if (ctx.connectionParams != null) {
                    const authTokenValue = ctx.connectionParams[authToken];
                    if (typeof authTokenValue === 'string') {
                        decodedIdToken = authTokenValue;
                    }
                }
                return {
                    decodedIdToken: decodedIdToken == null ? undefined : await getDecodedIdToken(decodedIdToken),
                    promiseQueue,
                    createEm: () => orm.em.fork(),
                };
            },
        },
        wsServer);

        console.log(`🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`);
        console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${apolloServer.subscriptionsPath}`);
    });
};

export default main;