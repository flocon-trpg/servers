'use strict';

var http = require('http');
var path = require('path');
var core = require('@mikro-orm/core');
var apolloServerExpress = require('apollo-server-express');
var express = require('express');
var fs = require('fs-extra');
var graphql = require('graphql');
var ws$1 = require('graphql-ws/lib/use/ws');
var multer = require('multer');
var pinoHttp = require('pino-http');
var rateLimiterFlexible = require('rate-limiter-flexible');
var sanitize = require('sanitize-filename');
var sharp = require('sharp');
var ws = require('ws');
var entity = require('./entities/file/entity.js');
var entity$1 = require('./entities/user/entity.js');
var getUserIfEntry = require('./entities/user/getUserIfEntry.js');
var BaasType = require('./enums/BaasType.js');
var FilePermissionType = require('./enums/FilePermissionType.js');
var env = require('./env.js');
var Html = require('./html/Html.js');
var logger = require('./logger.js');
var consume = require('./rateLimit/consume.js');
var appConsole = require('./utils/appConsole.js');
var easyFlake = require('./utils/easyFlake.js');
var thumbsDir = require('./utils/thumbsDir.js');

const set401Status = (res) => {
    return res.status(401).setHeader('WWW-Authenticate', 'Bearer');
};
const isRoomEventSubscription = (query) => {
    const parsedQuery = graphql.parse(query);
    return parsedQuery.definitions.some(t => {
        if (t.kind !== 'OperationDefinition') {
            return false;
        }
        return t.name?.value.toLowerCase() === 'roomevent';
    });
};
const setupIndexAsSuccess = (app) => {
    app.get('/', (req, res) => {
        res.send(Html.Html.success);
    });
};
const setupIndexAsError = (app) => {
    app.get('/', (req, res) => {
        res.send(Html.Html.error);
    });
};
const loggingPlugin = {
    async requestDidStart() {
        return {
            async didEncounterErrors(requestContext) {
                logger.logger.info({
                    request: requestContext.request,
                    response: requestContext.response,
                    errors: requestContext.errors,
                }, 'GraphQL error encountered');
            },
            async willSendResponse(requestContext) {
                logger.logger.info({
                    request: requestContext.request,
                    response: requestContext.response,
                    errors: requestContext.errors,
                }, 'GraphQL request completed');
            },
        };
    },
};
const createServerAsError = async ({ port }) => {
    const app = express();
    setupIndexAsError(app);
    const server = app.listen(port, () => {
        logger.logger.warn(`⚠️ Server ready at http://localhost:${port}, but API is not working. Please see error messages.`);
    });
    return server;
};
const createServer = async ({ serverConfig, promiseQueue, connectionManager, em, schema, debug, getDecodedIdTokenFromExpressRequest, getDecodedIdTokenFromWsContext, port, quiet, httpServerOptions, }) => {
    let rateLimiter = null;
    if (!serverConfig.disableRateLimitExperimental) {
        rateLimiter = new rateLimiterFlexible.RateLimiterMemory({
            duration: 60,
            points: 600,
        });
    }
    const context = async (context) => {
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
    const apolloServer = new apolloServerExpress.ApolloServer({
        schema,
        context,
        debug,
        csrfPrevention: true,
        cache: 'bounded',
        plugins: [loggingPlugin],
    });
    await apolloServer.start();
    const app = express();
    app.use(pinoHttp({
        logger: logger.logger.get(),
    }));
    apolloServer.applyMiddleware({ app });
    if (serverConfig.accessControlAllowOrigin == null) {
        !quiet &&
            appConsole.AppConsole.infoAsNotice({
                en: '"accessControlAllowOrigin" config was not found. "Access-Control-Allow-Origin" header will be empty.',
                ja: '"accessControlAllowOrigin" のコンフィグが見つかりませんでした。"Access-Control-Allow-Origin" ヘッダーは空になります。',
            });
    }
    else {
        !quiet &&
            appConsole.AppConsole.infoAsNotice({
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
    const applyUploader = async () => {
        const uploaderConfig = serverConfig.uploader;
        if (uploaderConfig == null || !uploaderConfig.enabled) {
            !quiet &&
                appConsole.AppConsole.infoAsNotice({
                    en: `The uploader of API server is disabled.`,
                    ja: `APIサーバーのアップローダーは無効化されています。`,
                });
            return;
        }
        const directory = uploaderConfig.directory;
        if (directory == null) {
            !quiet &&
                appConsole.AppConsole.warn({
                    en: `The uploader of API server is disabled because "${env.EMBUPLOADER_PATH}" is empty.`,
                    ja: `"${env.EMBUPLOADER_PATH}"の値が空なので、APIサーバーのアップローダーは無効化されています。`,
                });
            return;
        }
        !quiet &&
            appConsole.AppConsole.infoAsNotice({
                en: `The uploader of API server is enabled.`,
                ja: `APIサーバーのアップローダーは有効化されています。`,
            });
        await fs.ensureDir(path.resolve(directory));
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, path.resolve(directory));
            },
            filename: function (req, file, cb) {
                cb(null, easyFlake.easyFlake() + path.extname(file.originalname));
            },
        });
        const permission = {
            unlisted: 'unlisted',
            public: 'public',
        };
        app.post('/uploader/upload/:permission', async (req, res, next) => {
            switch (req.params.permission) {
                case permission.unlisted:
                case permission.public:
                    break;
                default:
                    res.sendStatus(404);
                    return;
            }
            const decodedIdToken = await getDecodedIdTokenFromExpressRequest(req);
            if (decodedIdToken == null || decodedIdToken.isError) {
                set401Status(res).send('Invalid Authorization header');
                return;
            }
            const rateLimitError = await consume.consume(rateLimiter, decodedIdToken.value.uid, 10);
            if (rateLimitError != null) {
                res.status(429).send(rateLimitError.errorMessage);
                return;
            }
            const forkedEm = em.fork();
            const userUid = decodedIdToken.value.uid;
            const user = await getUserIfEntry.getUserIfEntry({
                em: forkedEm,
                userUid,
                baasType: BaasType.BaasType.Firebase,
                serverConfig,
            });
            if (user == null) {
                res.status(403).send('Requires entry');
                return;
            }
            res.locals.user = user;
            res.locals.forkedEm = forkedEm;
            const [files, filesCount] = await forkedEm.findAndCount(entity.File, {
                createdBy: { userUid: user.userUid },
            });
            const upload = multer({
                storage,
                limits: {
                    fileSize: uploaderConfig.maxFileSize,
                },
                fileFilter: (req, file, cb) => {
                    if (uploaderConfig.countQuota != null &&
                        uploaderConfig.countQuota <= filesCount) {
                        cb(null, false);
                        res.status(400).send('File count quota exceeded');
                        return;
                    }
                    const totalSize = files.reduce((seed, elem) => seed + elem.size, 0);
                    if (uploaderConfig.sizeQuota != null &&
                        uploaderConfig.sizeQuota <= totalSize) {
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
            const file = req.file;
            if (file == null) {
                res.sendStatus(400);
                return;
            }
            const thumbFileName = `${file.filename}.webp`;
            const thumbsDirPath = path.join(path.dirname(file.path), thumbsDir.thumbsDir);
            await fs.ensureDir(thumbsDirPath);
            const thumbPath = path.join(thumbsDirPath, thumbFileName);
            const thumbnailSaved = await sharp(file.path)
                .resize(80)
                .webp()
                .toFile(thumbPath)
                .then(() => true)
                .catch(err => {
                logger.logger.debug(err);
                return false;
            });
            const permissionType = req.params.permission === permission.public
                ? FilePermissionType.FilePermissionType.Entry
                : FilePermissionType.FilePermissionType.Private;
            const entity$1 = new entity.File({
                ...file,
                screenname: file.originalname,
                createdBy: core.Reference.create(user),
                thumbFilename: thumbnailSaved ? thumbFileName : undefined,
                filesize: file.size,
                deletePermission: permissionType,
                listPermission: permissionType,
                renamePermission: permissionType,
            });
            await forkedEm.persistAndFlush(entity$1);
            res.sendStatus(200);
        });
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
            if (directory == null) {
                res.status(403).send('Flocon uploader is disabled by server config');
                return;
            }
            const decodedIdToken = await getDecodedIdTokenFromExpressRequest(req);
            if (decodedIdToken == null || decodedIdToken.isError) {
                set401Status(res).send('Invalid Authorization header');
                return;
            }
            const rateLimitError = await consume.consume(rateLimiter, decodedIdToken.value.uid, 5);
            if (rateLimitError != null) {
                res.status(429).send(rateLimitError.errorMessage);
                return;
            }
            const forkedEm = em.fork();
            const user = await forkedEm.findOne(entity$1.User, { userUid: decodedIdToken.value.uid });
            if (user?.isEntry !== true) {
                res.status(403).send('Requires entry');
                return;
            }
            const filename = sanitize(req.params.file_name);
            if (filename !== req.params.file_name) {
                res.status(400).send('file_name is invalid');
                return;
            }
            let filepath;
            if (typeParam === 'files') {
                const fileCount = await forkedEm.count(entity.File, { filename });
                if (fileCount === 0) {
                    res.sendStatus(404);
                    return;
                }
                filepath = path.join(path.resolve(directory), filename);
            }
            else {
                const fileCount = await forkedEm.count(entity.File, { thumbFilename: filename });
                if (fileCount === 0) {
                    res.sendStatus(404);
                    return;
                }
                filepath = path.join(path.resolve(directory), 'thumbs', filename);
            }
            res.header('Content-Security-Policy', "default-src 'self'; img-src *; media-src *");
            res.sendFile(filepath, () => {
                res.end();
            });
        });
    };
    await applyUploader();
    setupIndexAsSuccess(app);
    const httpServer = http.createServer(app);
    const subscriptionsPath = '/graphql';
    const wsServer = new ws.Server({
        server: httpServer,
        path: subscriptionsPath,
    });
    ws$1.useServer({
        schema,
        execute: graphql.execute,
        subscribe: graphql.subscribe,
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
            logger.logger.info({ message }, 'graphql-ws onSubscribe');
            message.payload.query;
            if (!isRoomEventSubscription(message.payload.query)) {
                return;
            }
            const decodedIdToken = await getDecodedIdTokenFromWsContext(ctx);
            if (decodedIdToken?.isError !== false) {
                return;
            }
            const roomId = message.payload.variables?.id;
            if (typeof roomId === 'string') {
                await connectionManager.onConnectToRoom({
                    connectionId: message.id,
                    userUid: decodedIdToken.value.uid,
                    roomId,
                });
            }
            else {
                logger.logger.warn('(typeof RoomEvent.id) should be string');
            }
        },
        onNext(ctx, message, args, result) {
            logger.logger.info({ message, result }, 'graphql-ws onNext');
        },
        onComplete: (ctx, message) => {
            logger.logger.info({ message }, 'graphql-ws onComplete');
            return connectionManager.onLeaveRoom({ connectionId: message.id });
        },
        onClose: async (ctx, code, reason) => {
            logger.logger.info({ code, reason }, 'graphql-ws onClose');
            for (const key in ctx.subscriptions) {
                await connectionManager.onLeaveRoom({ connectionId: key });
            }
        },
    }, wsServer);
    if (httpServerOptions?.keepAliveTimeout != null) {
        httpServer.keepAliveTimeout = httpServerOptions.keepAliveTimeout;
    }
    const server = httpServer.listen(port, () => {
        !quiet &&
            logger.logger.infoAsNotice(`🚀 Server ready at http://localhost:${port}${apolloServer.graphqlPath}`);
        !quiet &&
            logger.logger.infoAsNotice(`🚀 Subscriptions ready at ws://localhost:${port}${subscriptionsPath}`);
    });
    const close = async () => {
        await new Promise((resolve, reject) => {
            server.close(err => {
                if (err == null) {
                    resolve(undefined);
                    return;
                }
                reject(err);
            });
        });
        await apolloServer.stop();
    };
    return { close };
};

exports.createServer = createServer;
exports.createServerAsError = createServerAsError;
//# sourceMappingURL=createServer.js.map
