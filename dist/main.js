"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
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
const BaasType_1 = require("./enums/BaasType");
const mikro_orm_2 = require("./graphql+mikro-orm/entities/user/mikro-orm");
const sanitize_filename_1 = __importDefault(require("sanitize-filename"));
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const mikro_orm_3 = require("./graphql+mikro-orm/entities/file/mikro-orm");
const helpers_1 = require("./graphql+mikro-orm/resolvers/utils/helpers");
const core_1 = require("@mikro-orm/core");
const appConsole_1 = require("./utils/appConsole");
const fs_extra_1 = require("fs-extra");
const uuid_1 = require("uuid");
const FilePermissionType_1 = require("./enums/FilePermissionType");
const mikro_orm_4 = require("./graphql+mikro-orm/entities/singleton/mikro-orm");
const logEntryPasswordConfig = async (em) => {
    const entity = await mikro_orm_4.getSingletonEntity(em.fork());
    if (entity.entryPasswordHash == null) {
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
    var _a, _b;
    firebase_admin_1.default.initializeApp({
        projectId: config_1.firebaseConfig.projectId,
    });
    const connectionManager = new main_1.InMemoryConnectionManager();
    const schema = await buildSchema_1.buildSchema({ emitSchemaFile: false, pubSub: main_1.pubSub });
    const serverConfig = await config_1.loadServerConfigAsMain();
    const dbType = serverConfig.database.__type;
    const orm = await mikro_orm_1.prepareORM(serverConfig.database, params.debug);
    await migrate_1.checkMigrationsBeforeStart(orm, dbType);
    await logEntryPasswordConfig(orm.em);
    const getDecodedIdToken = async (idToken) => {
        const decodedIdToken = await firebase_admin_1.default
            .auth()
            .verifyIdToken(idToken)
            .then(result_1.Result.ok)
            .catch(result_1.Result.error);
        if (decodedIdToken.isError) {
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
    await apolloServer.start();
    const app = express_1.default();
    apolloServer.applyMiddleware({ app });
    if (serverConfig.accessControlAllowOrigin == null) {
        appConsole_1.AppConsole.log({
            en: '"accessControlAllowOrigin" config was not found. "Access-Control-Allow-Origin" header will be empty.',
            ja: '"accessControlAllowOrigin" のコンフィグが見つかりませんでした。"Access-Control-Allow-Origin" ヘッダーは空になります。',
        });
    }
    else {
        appConsole_1.AppConsole.log({
            en: `"accessControlAllowOrigin" config was found. "Access-Control-Allow-Origin" header will be "${serverConfig.accessControlAllowOrigin}".`,
            ja: `"accessControlAllowOrigin" のコンフィグが見つかりました。"Access-Control-Allow-Origin" ヘッダーは "${serverConfig.accessControlAllowOrigin}" になります。`,
        });
        const accessControlAllowOrigin = serverConfig.accessControlAllowOrigin;
        app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', accessControlAllowOrigin);
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            next();
        });
    }
    if (((_a = serverConfig.uploader) === null || _a === void 0 ? void 0 : _a.enabled) === true) {
        appConsole_1.AppConsole.log({
            en: `The uploader of API server is enabled.`,
            ja: `APIサーバーのアップローダーが有効化されます。`,
        });
        const uploaderConfig = serverConfig.uploader;
        await fs_extra_1.ensureDir(path_1.default.resolve(uploaderConfig.directory));
        const storage = multer_1.default.diskStorage({
            destination: function (req, file, cb) {
                cb(null, path_1.default.resolve(uploaderConfig.directory));
            },
            filename: function (req, file, cb) {
                cb(null, uuid_1.v4() + path_1.default.extname(file.originalname));
            },
        });
        app.post('/uploader/upload/:permission', async (req, res, next) => {
            let permissionParam;
            switch (req.params.permission) {
                case 'unlisted':
                    permissionParam = 'unlisted';
                    break;
                case 'public':
                    permissionParam = 'public';
                    break;
                default:
                    res.sendStatus(404);
                    return;
            }
            const decodedIdToken = await getDecodedIdTokenFromBearer(req.headers.authorization);
            if (decodedIdToken == null || decodedIdToken.isError) {
                res.status(403).send('Invalid Authorization header');
                return;
            }
            const userUid = decodedIdToken.value.uid;
            const em = orm.em.fork();
            const user = await helpers_1.getUserIfEntry({
                em,
                userUid,
                baasType: BaasType_1.BaasType.Firebase,
            });
            if (user == null) {
                res.status(403).send('Requires entry');
                return;
            }
            const [files, filesCount] = await em.findAndCount(mikro_orm_3.File, {
                createdBy: { userUid: user.userUid },
            });
            const upload = multer_1.default({
                storage,
                limits: {
                    fileSize: uploaderConfig.maxFileSize,
                },
                fileFilter: (req, file, cb) => {
                    if (uploaderConfig.countQuota <= filesCount) {
                        cb(null, false);
                        res.status(400).send('File count quota exceeded');
                        return;
                    }
                    const totalSize = files.reduce((seed, elem) => seed + elem.size, 0);
                    if (uploaderConfig.sizeQuota <= totalSize) {
                        cb(null, false);
                        res.status(400).send('File size quota exceeded');
                        return;
                    }
                    cb(null, true);
                },
            });
            upload.single('file')(req, res, error => {
                const main = async () => {
                    if (error) {
                        next(error);
                        return;
                    }
                    const file = req.file;
                    if (file == null) {
                        res.status(200);
                        return;
                    }
                    const thumbFileName = `${file.filename}.webp`;
                    const thumbDir = path_1.default.join(path_1.default.dirname(file.path), 'thumbs');
                    const thumbPath = path_1.default.join(thumbDir, thumbFileName);
                    await fs_extra_1.ensureDir(thumbDir);
                    const thumbnailSaved = await sharp_1.default(file.path)
                        .resize(80)
                        .webp()
                        .toFile(thumbPath)
                        .then(() => true)
                        .catch(() => false);
                    const permission = permissionParam === 'public'
                        ? FilePermissionType_1.FilePermissionType.Entry
                        : FilePermissionType_1.FilePermissionType.Private;
                    const entity = new mikro_orm_3.File(Object.assign(Object.assign({}, file), { screenname: file.originalname, createdBy: core_1.Reference.create(user), thumbFilename: thumbnailSaved ? thumbFileName : undefined, filesize: file.size, deletePermission: permission, listPermission: permission, renamePermission: permission }));
                    await em.persistAndFlush(entity);
                    res.sendStatus(200);
                    next();
                };
                main();
            });
        });
    }
    app.get('/uploader/:type/:file_name', async (req, res, next) => {
        var _a;
        let typeParam;
        switch (req.params.type) {
            case 'files':
                typeParam = 'files';
                break;
            case 'thumbs':
                typeParam = 'thumbs';
                break;
            default:
                res.sendStatus(404);
                return;
        }
        if (((_a = serverConfig.uploader) === null || _a === void 0 ? void 0 : _a.enabled) !== true) {
            res.status(403).send('Flocon uploader is disabled by server config');
            return;
        }
        const filename = sanitize_filename_1.default(req.params.file_name);
        const decodedIdToken = await getDecodedIdTokenFromBearer(req.headers.authorization);
        if (decodedIdToken == null || decodedIdToken.isError) {
            res.status(403).send('Invalid Authorization header');
            return;
        }
        const em = orm.em.fork();
        const user = await em.findOne(mikro_orm_2.User, { userUid: decodedIdToken.value.uid });
        if ((user === null || user === void 0 ? void 0 : user.isEntry) !== true) {
            res.status(403).send('Requires entry');
            return;
        }
        const fileEntity = await em.findOne(mikro_orm_3.File, { filename });
        if (fileEntity == null) {
            res.sendStatus(404);
            return;
        }
        let filepath;
        if (typeParam === 'files') {
            filepath = path_1.default.join(path_1.default.resolve(serverConfig.uploader.directory), filename);
        }
        else {
            if (fileEntity.thumbFilename == null) {
                res.sendStatus(404);
                next();
                return;
            }
            filepath = path_1.default.join(path_1.default.resolve(serverConfig.uploader.directory), 'thumb', sanitize_filename_1.default(fileEntity.thumbFilename));
        }
        res.header('Content-Security-Policy', "script-src 'unsafe-hashes'");
        res.sendFile(filepath, () => {
            res.end();
            next();
        });
    });
    const PORT = (_b = process.env.PORT) !== null && _b !== void 0 ? _b : 4000;
    const server = app.listen(PORT, () => {
        const subscriptionsPath = '/graphql';
        const wsServer = new ws_1.default.Server({
            server,
            path: subscriptionsPath,
        });
        ws_2.useServer({
            schema,
            execute: graphql_1.execute,
            subscribe: graphql_1.subscribe,
            context: async (ctx) => {
                const decodedIdToken = await getDecodedIdTokenFromContext(ctx);
                const result = {
                    decodedIdToken,
                    promiseQueue,
                    connectionManager,
                    createEm: () => orm.em.fork(),
                };
                return result;
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
            },
        }, wsServer);
        console.log(`🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`);
        console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${subscriptionsPath}`);
    });
};
exports.default = main;
