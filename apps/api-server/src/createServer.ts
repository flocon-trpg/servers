import { createServer as createHttpServer } from 'http';
import path from 'path';
import { loggerRef } from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import { PluginDefinition } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import express from 'express';
import { ensureDir } from 'fs-extra';
import { GraphQLSchema, execute, parse , subscribe } from 'graphql';

import { Context } from 'graphql-ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import multer from 'multer';
import pinoHttp from 'pino-http';
import { RateLimiterAbstract, RateLimiterMemory } from 'rate-limiter-flexible';
import sanitize from 'sanitize-filename';
import sharp from 'sharp';
import ws from 'ws';
import { ServerConfig } from './config/types';
import { InMemoryConnectionManager } from './connection/main';
import { File } from './entities/file/entity';
import { User } from './entities/user/entity';
import { getUserIfEntry } from './entities/user/getUserIfEntry';
import { BaasType } from './enums/BaasType';
import { FilePermissionType } from './enums/FilePermissionType';
import { EMBUPLOADER_PATH } from './env';
import { Html } from './html/Html';
import { consume } from './rateLimit/consume';
import { DecodedIdToken, EM, ResolverContext } from './types';
import { AppConsole } from './utils/appConsole';
import { easyFlake } from './utils/easyFlake';
import { PromiseQueue } from './utils/promiseQueue';
import { thumbsDir } from './utils/thumbsDir';

const set401Status = (res: express.Response) => {
    return res.status(401).setHeader('WWW-Authenticate', 'Bearer');
};

const isRoomEventSubscription = (query: string) => {
    const parsedQuery = parse(query);
    return parsedQuery.definitions.some(t => {
        if (t.kind !== 'OperationDefinition') {
            return false;
        }
        return t.name?.value.toLowerCase() === 'roomevent';
    });
};

const setupIndexAsSuccess = (app: ReturnType<typeof express>) => {
    app.get('/', (req, res) => {
        res.send(Html.success);
    });
};

const setupIndexAsError = (app: ReturnType<typeof express>) => {
    app.get('/', (req, res) => {
        res.send(Html.error);
    });
};

const loggingPlugin: PluginDefinition = {
    async requestDidStart() {
        return {
            async didEncounterErrors(requestContext) {
                loggerRef.info(
                    {
                        request: requestContext.request,
                        response: requestContext.response,
                        errors: requestContext.errors,
                    },
                    'GraphQL error encountered',
                );
            },
            async willSendResponse(requestContext) {
                loggerRef.info(
                    {
                        request: requestContext.request,
                        response: requestContext.response,
                        errors: requestContext.errors,
                    },
                    'GraphQL request completed',
                );
            },
        };
    },
};

export const createServerAsError = async ({ port }: { port: string | number }) => {
    const app = express();
    setupIndexAsError(app);

    const server = app.listen(port, () => {
        loggerRef.warn(
            `⚠️ Server ready at http://localhost:${port}, but API is not working. Please see error messages.`,
        );
    });
    return server;
};

export const createServer = async ({
    serverConfig,
    promiseQueue,
    connectionManager,
    em,
    schema,
    debug,
    getDecodedIdTokenFromExpressRequest,
    getDecodedIdTokenFromWsContext,
    port,
    quiet,
    httpServerOptions,
}: {
    serverConfig: ServerConfig;
    promiseQueue: PromiseQueue;
    connectionManager: InMemoryConnectionManager;
    em: EM;
    schema: GraphQLSchema;
    debug: boolean;
    getDecodedIdTokenFromExpressRequest: (
        req: ExpressContext['req'],
    ) => Promise<Result<Readonly<DecodedIdToken>, unknown> | undefined>;
    getDecodedIdTokenFromWsContext: (
        context: Context,
    ) => Promise<Result<Readonly<DecodedIdToken>, unknown> | undefined>;
    port: string | number;
    quiet?: boolean;
    httpServerOptions?: {
        keepAliveTimeout?: number;
    };
}) => {
    let rateLimiter: RateLimiterAbstract | null = null;
    if (!serverConfig.disableRateLimitExperimental) {
        rateLimiter = new RateLimiterMemory({
            // TODO: 値をちゃんと決める。現時点では、Rate limit によるエラーでユーザー体験が損なわれないようにするため、暫定的に大きめのポイントを設定している。
            duration: 60,
            points: 3000,
        });
    }

    const context = async (context: ExpressContext): Promise<ResolverContext> => {
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

    const apolloServer = new ApolloServer({
        schema,
        context,
        debug,
        csrfPrevention: true,
        cache: 'bounded',
        plugins: [loggingPlugin],
    });
    await apolloServer.start();

    const app = express();

    app.use(
        pinoHttp({
            logger: loggerRef.value,
        }),
    );

    // 先に書くほど優先度が高いようなので、applyMiddlewareを先に書くと、/graphqlが上書きされない。
    apolloServer.applyMiddleware({ app });

    if (serverConfig.accessControlAllowOrigin == null) {
        if (!quiet) {
            AppConsole.infoAsNotice({
                en: '"accessControlAllowOrigin" config was not found. "Access-Control-Allow-Origin" header will be empty.',
                ja: '"accessControlAllowOrigin" のコンフィグが見つかりませんでした。"Access-Control-Allow-Origin" ヘッダーは空になります。',
            });
        }
    } else {
        if (!quiet) {
            AppConsole.infoAsNotice({
                en: `"accessControlAllowOrigin" config was found. "Access-Control-Allow-Origin" header will be "${serverConfig.accessControlAllowOrigin}".`,
                ja: `"accessControlAllowOrigin" のコンフィグが見つかりました。"Access-Control-Allow-Origin" ヘッダーは "${serverConfig.accessControlAllowOrigin}" になります。`,
            });
        }
        const accessControlAllowOrigin = serverConfig.accessControlAllowOrigin;
        app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', accessControlAllowOrigin);
            res.header(
                'Access-Control-Allow-Headers',
                'Origin, X-Requested-With, Content-Type, Accept, Authorization',
            );
            next();
        });
    }

    const applyUploader = async () => {
        const uploaderConfig = serverConfig.uploader;
        if (uploaderConfig == null || !uploaderConfig.enabled) {
            if (!quiet) {
                AppConsole.infoAsNotice({
                    en: `The uploader of API server is disabled.`,
                    ja: `APIサーバーのアップローダーは無効化されています。`,
                });
            }
            return;
        }
        const directory = uploaderConfig.directory;
        if (directory == null) {
            if (!quiet) {
                AppConsole.warn({
                    en: `The uploader of API server is disabled because "${EMBUPLOADER_PATH}" is empty.`,
                    ja: `"${EMBUPLOADER_PATH}"の値が空なので、APIサーバーのアップローダーは無効化されています。`,
                });
            }
            return;
        }

        if (!quiet) {
            AppConsole.infoAsNotice({
                en: `The uploader of API server is enabled.`,
                ja: `APIサーバーのアップローダーは有効化されています。`,
            });
        }

        await ensureDir(path.resolve(directory));
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, path.resolve(directory));
            },
            filename: function (req, file, cb) {
                cb(null, easyFlake() + path.extname(file.originalname));
            },
        });

        const permission = {
            unlisted: 'unlisted',
            public: 'public',
        };
        app.post(
            '/uploader/upload/:permission',
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            async (req, res, next) => {
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

                const rateLimitError = await consume(rateLimiter, decodedIdToken.value.uid, 10);
                if (rateLimitError != null) {
                    res.status(429).send(rateLimitError.errorMessage);
                    return;
                }

                const forkedEm = em.fork();
                const userUid = decodedIdToken.value.uid;
                const user = await getUserIfEntry({
                    em: forkedEm,
                    userUid,
                    baasType: BaasType.Firebase,
                    serverConfig,
                });
                if (user == null) {
                    res.status(403).send('Requires entry');
                    return;
                }
                res.locals.user = user;
                res.locals.forkedEm = forkedEm;
                const [files, filesCount] = await forkedEm.findAndCount(File, {
                    createdBy: { userUid: user.userUid },
                });
                const upload = multer({
                    storage,
                    limits: {
                        fileSize: uploaderConfig.maxFileSize,
                    },
                    fileFilter: (req, file, cb) => {
                        if (
                            uploaderConfig.countQuota != null &&
                            uploaderConfig.countQuota <= filesCount
                        ) {
                            cb(null, false);
                            res.status(400).send('File count quota exceeded');
                            return;
                        }
                        const totalSize = files.reduce((seed, elem) => seed + elem.size, 0);
                        if (
                            uploaderConfig.sizeQuota != null &&
                            uploaderConfig.sizeQuota <= totalSize
                        ) {
                            cb(null, false);
                            res.status(400).send('File size quota exceeded');
                            return;
                        }
                        cb(null, true);
                    },
                });

                upload.single('file')(req, res, next);
            },
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            async (req, res) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const forkedEm: EM = res.locals.forkedEm;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const user: User = res.locals.user;

                const file = req.file;
                if (file == null) {
                    res.sendStatus(400);
                    return;
                }
                const thumbFileName = `${file.filename}.webp`;
                const thumbsDirPath = path.join(path.dirname(file.path), thumbsDir);
                await ensureDir(thumbsDirPath);
                const thumbPath = path.join(thumbsDirPath, thumbFileName);
                // 画像がアップロードされた際にsharpでサムネイル画像を生成する処理があるが、Windowsだとsharpによって生成元の画像がロックされてしまい、その後に削除できないことがある(https://github.com/lovell/sharp/issues/415#issuecomment-212817987)。それを防ぐため、ここでsharpのcacheを無効化している。
                // 現時点ではsharpのcacheを有効化するコードがないため、このコードを削除して代わりにどこかで一回だけ呼び出すようにしてもいい。
                sharp.cache(false);
                const thumbnailSaved = await sharp(file.path)
                    .resize(80)
                    .webp()
                    .toFile(thumbPath)
                    .then(() => true)
                    .catch(err => {
                        // 画像かどうかに関わらず全てのファイルをsharpに渡すため、mp3などといった画像でないファイルの場合はほぼ確実にここに来る。そのため、warnなどではなくそれよりlevelの低いdebugを使っている。
                        loggerRef.debug(err);
                        return false;
                    });
                const permissionType =
                    req.params.permission === permission.public
                        ? FilePermissionType.Entry
                        : FilePermissionType.Private;
                const entity = forkedEm.create(File, {
                    ...file,
                    screenname: file.originalname,
                    createdBy: user,
                    thumbFilename: thumbnailSaved ? thumbFileName : undefined,
                    filesize: file.size,
                    deletePermission: permissionType,
                    listPermission: permissionType,
                    renamePermission: permissionType,
                });
                await forkedEm.persistAndFlush(entity);
                res.sendStatus(200);
            },
        );

        app.get('/uploader/:type/:file_name', 
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            async (req, res) => {
            let typeParam: 'files' | 'thumbs';
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

            const rateLimitError = await consume(rateLimiter, decodedIdToken.value.uid, 5);
            if (rateLimitError != null) {
                res.status(429).send(rateLimitError.errorMessage);
                return;
            }

            const forkedEm = em.fork();
            const user = await forkedEm.findOne(User, { userUid: decodedIdToken.value.uid });
            if (user?.isEntry !== true) {
                res.status(403).send('Requires entry');
                return;
            }

            const filename = sanitize(req.params.file_name);
            if (filename !== req.params.file_name) {
                res.status(400).send('file_name is invalid');
                return;
            }

            let filepath: string;
            if (typeParam === 'files') {
                const fileCount = await forkedEm.count(File, { filename });
                if (fileCount === 0) {
                    res.sendStatus(404);
                    return;
                }
                filepath = path.join(path.resolve(directory), filename);
            } else {
                const fileCount = await forkedEm.count(File, { thumbFilename: filename });
                if (fileCount === 0) {
                    res.sendStatus(404);
                    return;
                }
                filepath = path.join(path.resolve(directory), 'thumbs', filename);
            }

            // 現在は内蔵アップローダーのファイルを直接開く手段はクライアントには実装されていないが、念のためCSPを設定している
            res.header('Content-Security-Policy', "default-src 'self'; img-src *; media-src *");

            res.sendFile(filepath, () => {
                res.end();
            });
        });
    };
    await applyUploader();

    setupIndexAsSuccess(app);

    // https://github.com/enisdenjo/graphql-ws のコードを参考にした
    const httpServer = createHttpServer(app);
    const subscriptionsPath = '/graphql';
    const wsServer = new ws.Server({
        server: httpServer,
        path: subscriptionsPath,
    });
    // useServerの戻り値をdisposeするとフリーズするためdisposeしていない。原因は不明。
    useServer(
        {
            schema,
            execute,
            subscribe,
            context: async ctx => {
                const decodedIdToken = await getDecodedIdTokenFromWsContext(ctx);
                const result: ResolverContext = {
                    decodedIdToken,
                    rateLimiter,
                    serverConfig,
                    promiseQueue,
                    connectionManager,
                    // contextは、graphql-wsのJSDocにも書かれている通り、websocketの接続が確立されたときにのみ実行される。WebSocketを通して何らかの通信が行われても、clientが再接続するまではcontextの値は変わらない。
                    // そのため、接続IDが同じならば、（ここでfork()を呼んでいるにも関わらず）同じemが使い回されることになるので注意。Subscriptionのコード内でデータベースにアクセスするならば、そちらでも毎回emはfork()してから使用するほうが無難。
                    em: em.fork(),
                    authorizedUser: null,
                };
                return result;
            },
            onSubscribe: async (ctx, message) => {
                loggerRef.info({ message }, 'graphql-ws onSubscribe');

                // Apollo Clientなどではmessage.payload.operationNameが使えるがurqlではnullishなので、queryを代わりに使っている
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
                } else {
                    loggerRef.warn('(typeof RoomEvent.id) should be string');
                }
            },
            onNext(ctx, message, args, result) {
                loggerRef.info({ message, result }, 'graphql-ws onNext');
            },
            onComplete: (ctx, message) => {
                loggerRef.info({ message }, 'graphql-ws onComplete');
                return connectionManager.onLeaveRoom({ connectionId: message.id });
            },
            onClose: async (ctx, code, reason) => {
                loggerRef.info({ code, reason }, 'graphql-ws onClose');
                for (const key in ctx.subscriptions) {
                    await connectionManager.onLeaveRoom({ connectionId: key });
                }
            },
        },
        wsServer,
    );
    if (httpServerOptions?.keepAliveTimeout != null) {
        httpServer.keepAliveTimeout = httpServerOptions.keepAliveTimeout;
    }
    const server = httpServer.listen(port, () => {
        // TODO: /graphqlが含まれているとAPI_HTTPなどの設定にも/graphqlの部分も入力してしまいそうなので、対処したほうがいいと思われる。また、createServerAsErrorとの統一性も取れていない
        if (!quiet) {
            loggerRef.infoAsNotice(
                `🚀 Server ready at http://localhost:${port}${apolloServer.graphqlPath}`,
            );
            loggerRef.infoAsNotice(
                `🚀 Subscriptions ready at ws://localhost:${port}${subscriptionsPath}`,
            );
        }
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
