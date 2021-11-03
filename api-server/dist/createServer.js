"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const ws_1 = __importDefault(require("ws"));
const ws_2 = require("graphql-ws/lib/use/ws");
const graphql_1 = require("graphql");
const BaasType_1 = require("./enums/BaasType");
const mikro_orm_1 = require("./graphql+mikro-orm/entities/user/mikro-orm");
const sanitize_filename_1 = __importDefault(require("sanitize-filename"));
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const mikro_orm_2 = require("./graphql+mikro-orm/entities/file/mikro-orm");
const helpers_1 = require("./graphql+mikro-orm/resolvers/utils/helpers");
const core_1 = require("@mikro-orm/core");
const appConsole_1 = require("./utils/appConsole");
const fs_extra_1 = require("fs-extra");
const FilePermissionType_1 = require("./enums/FilePermissionType");
const easyFlake_1 = require("./utils/easyFlake");
const thumbsDir_1 = require("./utils/thumbsDir");
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const consume_1 = require("./rateLimit/consume");
const createServer = async ({ serverConfig, promiseQueue, connectionManager, em, schema, debug, getDecodedIdTokenFromExpressRequest, getDecodedIdTokenFromWsContext, port, }) => {
    let rateLimiter = null;
    if (serverConfig['-experimental-disableRateLimit'] !== true) {
        rateLimiter = new rate_limiter_flexible_1.RateLimiterMemory({
            duration: 60,
            points: 600,
        });
    }
    const context = async (context) => {
        context.req.socket.remoteAddress;
        return {
            decodedIdToken: await getDecodedIdTokenFromExpressRequest(context.req),
            rateLimiter,
            serverConfig,
            promiseQueue,
            connectionManager,
            em: em.fork(),
            authorizedUser: null,
        };
    };
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema,
        context,
        debug,
    });
    await apolloServer.start();
    const app = (0, express_1.default)();
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
    if (serverConfig.uploader != null) {
        appConsole_1.AppConsole.log({
            en: `The uploader of API server is enabled.`,
            ja: `APIサーバーのアップローダーは有効化されています。`,
        });
        const uploaderConfig = serverConfig.uploader;
        await (0, fs_extra_1.ensureDir)(path_1.default.resolve(uploaderConfig.directory));
        const storage = multer_1.default.diskStorage({
            destination: function (req, file, cb) {
                cb(null, path_1.default.resolve(uploaderConfig.directory));
            },
            filename: function (req, file, cb) {
                cb(null, (0, easyFlake_1.easyFlake)() + path_1.default.extname(file.originalname));
            },
        });
        app.post('/uploader/upload/:permission', async (req, res, next) => {
            const decodedIdToken = await getDecodedIdTokenFromExpressRequest(req);
            if (decodedIdToken == null || decodedIdToken.isError) {
                res.status(403).send('Invalid Authorization header');
                return;
            }
            const rateLimitError = await (0, consume_1.consume)(rateLimiter, decodedIdToken.value.uid, 10);
            if (rateLimitError != null) {
                res.status(429).send(rateLimitError.errorMessage);
                return;
            }
            const forkedEm = em.fork();
            const userUid = decodedIdToken.value.uid;
            const user = await (0, helpers_1.getUserIfEntry)({
                em: forkedEm,
                userUid,
                baasType: BaasType_1.BaasType.Firebase,
                serverConfig,
            });
            if (user == null) {
                res.status(403).send('Requires entry');
                return;
            }
            res.locals.user = user;
            res.locals.forkedEm = forkedEm;
            const [files, filesCount] = await forkedEm.findAndCount(mikro_orm_2.File, {
                createdBy: { userUid: user.userUid },
            });
            const upload = (0, multer_1.default)({
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
            upload.single('file')(req, res, next);
        }, async (req, res) => {
            const forkedEm = res.locals.forkedEm;
            const user = res.locals.user;
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
            const file = req.file;
            if (file == null) {
                res.sendStatus(400);
                return;
            }
            const thumbFileName = `${file.filename}.webp`;
            const thumbDir = path_1.default.join(path_1.default.dirname(file.path), thumbsDir_1.thumbsDir);
            await (0, fs_extra_1.ensureDir)(thumbDir);
            const thumbPath = path_1.default.join(thumbDir, thumbFileName);
            const thumbnailSaved = await (0, sharp_1.default)(file.path)
                .resize(80)
                .webp()
                .toFile(thumbPath)
                .then(() => true)
                .catch(err => {
                console.log(err);
                return false;
            });
            const permission = permissionParam === 'public'
                ? FilePermissionType_1.FilePermissionType.Entry
                : FilePermissionType_1.FilePermissionType.Private;
            const entity = new mikro_orm_2.File(Object.assign(Object.assign({}, file), { screenname: file.originalname, createdBy: core_1.Reference.create(user), thumbFilename: thumbnailSaved ? thumbFileName : undefined, filesize: file.size, deletePermission: permission, listPermission: permission, renamePermission: permission }));
            await forkedEm.persistAndFlush(entity);
            res.sendStatus(200);
        });
    }
    else {
        appConsole_1.AppConsole.log({
            en: `The uploader of API server is disabled.`,
            ja: `APIサーバーのアップローダーは無効化されています。`,
        });
    }
    app.get('/uploader/:type/:file_name', async (req, res) => {
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
        if (serverConfig.uploader == null) {
            res.status(403).send('Flocon uploader is disabled by server config');
            return;
        }
        const decodedIdToken = await getDecodedIdTokenFromExpressRequest(req);
        if (decodedIdToken == null || decodedIdToken.isError) {
            res.status(403).send('Invalid Authorization header');
            return;
        }
        const rateLimitError = await (0, consume_1.consume)(rateLimiter, decodedIdToken.value.uid, 5);
        if (rateLimitError != null) {
            res.status(429).send(rateLimitError.errorMessage);
            return;
        }
        const forkedEm = em.fork();
        const user = await forkedEm.findOne(mikro_orm_1.User, { userUid: decodedIdToken.value.uid });
        if ((user === null || user === void 0 ? void 0 : user.isEntry) !== true) {
            res.status(403).send('Requires entry');
            return;
        }
        const filename = (0, sanitize_filename_1.default)(req.params.file_name);
        let filepath;
        if (typeParam === 'files') {
            const fileCount = await forkedEm.count(mikro_orm_2.File, { filename });
            if (fileCount === 0) {
                res.sendStatus(404);
                return;
            }
            filepath = path_1.default.join(path_1.default.resolve(serverConfig.uploader.directory), filename);
        }
        else {
            const fileCount = await forkedEm.count(mikro_orm_2.File, { thumbFilename: filename });
            if (fileCount === 0) {
                res.sendStatus(404);
                return;
            }
            filepath = path_1.default.join(path_1.default.resolve(serverConfig.uploader.directory), 'thumbs', (0, sanitize_filename_1.default)(filename));
        }
        res.header('Content-Security-Policy', "script-src 'unsafe-hashes'");
        res.sendFile(filepath, () => {
            res.end();
        });
    });
    const server = app.listen(port, () => {
        const subscriptionsPath = '/graphql';
        const wsServer = new ws_1.default.Server({
            server,
            path: subscriptionsPath,
        });
        (0, ws_2.useServer)({
            schema,
            execute: graphql_1.execute,
            subscribe: graphql_1.subscribe,
            context: async (ctx) => {
                const decodedIdToken = await getDecodedIdTokenFromWsContext(ctx);
                const result = {
                    decodedIdToken,
                    rateLimiter,
                    serverConfig,
                    promiseQueue,
                    connectionManager,
                    em: em.fork(),
                    authorizedUser: null,
                };
                return result;
            },
            onSubscribe: async (ctx, message) => {
                var _a, _b;
                if (((_a = message.payload.operationName) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== 'roomevent') {
                    return;
                }
                const decodedIdToken = await getDecodedIdTokenFromWsContext(ctx);
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
        console.log(`🚀 Server ready at http://localhost:${port}${apolloServer.graphqlPath}`);
        console.log(`🚀 Subscriptions ready at ws://localhost:${port}${subscriptionsPath}`);
    });
    return server;
};
exports.createServer = createServer;
