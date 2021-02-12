import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import path from 'path';
import * as http from 'http';
import admin from 'firebase-admin';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { authToken } from './@shared/Constants';
import { ResolverContext } from './graphql+typegoose/utils/Contexts';
import registerEnumTypes from './graphql+typegoose/registerEnumTypes';
import { buildSchema } from './buildSchema';
import { PromiseQueue } from './utils/PromiseQueue';
import { MikroORM } from '@mikro-orm/core';
import { createPostgreSQL, createSQLite } from './mikro-orm';
import { firebaseConfig, postgresql, serverConfig, sqlite } from './config';
import { CustomResult, ResultModule } from './@shared/Result';

const main = async (params: { debug: boolean }): Promise<void> => {
    admin.initializeApp({
        projectId: firebaseConfig.projectId,
    });

    registerEnumTypes();

    const schema = await buildSchema({ emitSchemaFile: false });

    const orm = await (async () => {
        try {
            switch (serverConfig.database.__type) {
                case postgresql:
                    return await createPostgreSQL(serverConfig.database.postgresql);
                case sqlite:
                    return await createSQLite(serverConfig.database.sqlite);
            }
        } catch (error) {
            console.error('📌 Could not connect to the database', error);
            throw Error(error);
        }
    })();

    const getDecodedIdToken = async (bearer: string | undefined): Promise<CustomResult<admin.auth.DecodedIdToken, any> | undefined> => {
        // bearerのフォーマットはだいたいこんな感じ
        // 'Bearer aNGoGo3ngC.oepGJoGoeo34Ha.Oge03mvQgeo4H'
        if (bearer == null || !bearer.startsWith('Bearer ')) {
            return undefined;
        }
        const idToken = bearer.replace('Bearer ', '');
        const decodedIdToken = await admin.auth().verifyIdToken(idToken).then(ResultModule.ok).catch(ResultModule.error);
        return decodedIdToken;
    };

    // TODO: queueLimitの値をきちんと決める
    const promiseQueue = new PromiseQueue({ queueLimit: 50 });

    // 戻り値はTだけでなくPromise<T>でもいいのでasyncを使っている
    const context = async (context: ExpressContext): Promise<ResolverContext> => {
        // context.connection != nullの場合はwebsocketによる接続
        // client側でconnectionParams[authToken]にJWTがセットされている。connectionParamsはcontext.connection.contextに入っているので、それを利用してDecodedIdTokenを取得している。
        // https://github.com/apollographql/apollo-server/issues/1597#issuecomment-423641175
        // https://github.com/apollographql/apollo-server/issues/1597#issuecomment-442534421
        if (context.connection) {
            return {
                decodedIdToken: await getDecodedIdToken(context.connection.context[authToken]),
                promiseQueue,
                createEm: () => orm.em.fork(),
            };
        }

        return {
            decodedIdToken: await getDecodedIdToken(context.req.headers.authorization),
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

    // https://www.apollographql.com/docs/apollo-server/data/subscriptions/#subscriptions-with-additional-middleware の方法でSubscriptionを有効にしている。
    // 当初は代わりに https://www.apollographql.com/docs/graphql-subscriptions/express/ の方法を使っていたが、onConnectが呼ばれないという現象が発生したのでボツ。
    const server = http.createServer(app);
    apolloServer.installSubscriptionHandlers(server);

    // google app engineでは、ポートとしてprocess.env.PORTを使わなければならない
    // https://cloud.google.com/appengine/docs/standard/nodejs/how-requests-are-handled?hl=ja#handling_requests
    const PORT = process.env.PORT ?? 4000;
    // The `listen` method launches a web server.
    server.listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`);
        console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${apolloServer.subscriptionsPath}`);
    });
};

export default main;