"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const registerEnumTypes_1 = __importDefault(require("./graphql+mikro-orm/registerEnumTypes"));
const buildSchema_1 = require("./buildSchema");
const PromiseQueue_1 = require("./utils/PromiseQueue");
const mikro_orm_1 = require("./mikro-orm");
const config_1 = require("./config");
const ws_1 = __importDefault(require("ws"));
const ws_2 = require("graphql-ws/lib/use/ws");
const graphql_1 = require("graphql");
const migrate_1 = require("./migrate");
const main_1 = require("./connection/main");
const result_1 = require("@kizahasi/result");
const util_1 = require("@kizahasi/util");
const main = async (params) => {
    var _a;
    firebase_admin_1.default.initializeApp({
        projectId: config_1.firebaseConfig.projectId,
    });
    const connectionManager = new main_1.InMemoryConnectionManager();
    registerEnumTypes_1.default();
    const schema = await buildSchema_1.buildSchema({ emitSchemaFile: false, pubSub: main_1.pubSub });
    const serverConfig = config_1.loadServerConfigAsMain();
    const dbType = serverConfig.database.__type;
    const orm = await (async () => {
        try {
            switch (serverConfig.database.__type) {
                case config_1.postgresql:
                    return await mikro_orm_1.createPostgreSQL(Object.assign(Object.assign({}, serverConfig.database.postgresql), { debug: params.debug }));
                case config_1.sqlite:
                    return await mikro_orm_1.createSQLite(Object.assign(Object.assign({}, serverConfig.database.sqlite), { debug: params.debug }));
            }
        }
        catch (error) {
            console.error('Could not connect to the database!');
            throw error;
        }
    })();
    await migrate_1.checkMigrationsBeforeStart(orm, dbType);
    const getDecodedIdToken = async (idToken) => {
        const decodedIdToken = await firebase_admin_1.default.auth().verifyIdToken(idToken).then(result_1.Result.ok).catch(result_1.Result.error);
        return decodedIdToken;
    };
    const getDecodedIdTokenFromBearer = async (bearer) => {
        if (bearer == null || !bearer.startsWith('Bearer ')) {
            return undefined;
        }
        const idToken = bearer.replace('Bearer ', '');
        return await getDecodedIdToken(idToken);
    };
    const getDecodedIdTokenFromContext = async (ctx) => {
        let authTokenValue;
        if (ctx.connectionParams != null) {
            const authTokenValueAsUnknown = ctx.connectionParams[util_1.authToken];
            if (typeof authTokenValueAsUnknown === 'string') {
                authTokenValue = authTokenValueAsUnknown;
            }
        }
        return authTokenValue == null ? undefined : await getDecodedIdToken(authTokenValue);
    };
    const promiseQueue = new PromiseQueue_1.PromiseQueue({ queueLimit: 50 });
    const context = async (context) => {
        return {
            decodedIdToken: await getDecodedIdTokenFromBearer(context.req.headers.authorization),
            promiseQueue,
            connectionManager,
            createEm: () => orm.em.fork(),
        };
    };
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema,
        context,
        debug: params.debug,
    });
    const app = express_1.default();
    apolloServer.applyMiddleware({ app });
    app.use(express_1.default.static(path_1.default.join(process.cwd(), 'root')));
    const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 4000;
    const server = app.listen(PORT, () => {
        const wsServer = new ws_1.default.Server({
            server,
            path: '/graphql',
        });
        ws_2.useServer({
            schema,
            execute: graphql_1.execute,
            subscribe: graphql_1.subscribe,
            context: async (ctx) => {
                const decodedIdToken = await getDecodedIdTokenFromContext(ctx);
                return {
                    decodedIdToken,
                    promiseQueue,
                    connectionManager,
                    createEm: () => orm.em.fork(),
                };
            },
            onSubscribe: async (ctx, message) => {
                var _a, _b;
                if (((_a = message.payload.operationName) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== 'roomevent') {
                    return;
                }
                const decodedIdToken = await getDecodedIdTokenFromContext(ctx);
                if ((decodedIdToken === null || decodedIdToken === void 0 ? void 0 : decodedIdToken.isError) !== false) {
                    return;
                }
                const roomId = (_b = message.payload.variables) === null || _b === void 0 ? void 0 : _b.id;
                if (typeof roomId === 'string') {
                    connectionManager.onConnectToRoom({
                        connectionId: message.id,
                        userUid: decodedIdToken.value.uid,
                        roomId,
                    });
                }
                else {
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
            }
        }, wsServer);
        console.log(`🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`);
        console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${apolloServer.subscriptionsPath}`);
    });
};
exports.default = main;
