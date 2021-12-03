import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import path from 'path';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { DecodedIdToken, ResolverContext } from './graphql+mikro-orm/utils/Contexts';
import { PromiseQueue } from './utils/promiseQueue';
import ws from 'ws';
import { Extra, useServer } from 'graphql-ws/lib/use/ws';
import { execute, GraphQLSchema, subscribe } from 'graphql';
import { BaasType } from './enums/BaasType';
import { User } from './graphql+mikro-orm/entities/user/mikro-orm';
import sanitize from 'sanitize-filename';
import multer from 'multer';
import sharp from 'sharp';
import { File } from './graphql+mikro-orm/entities/file/mikro-orm';
import { getUserIfEntry } from './graphql+mikro-orm/resolvers/utils/helpers';
import { Reference } from '@mikro-orm/core';
import { AppConsole } from './utils/appConsole';
import { ensureDir } from 'fs-extra';
import { FilePermissionType } from './enums/FilePermissionType';
import { easyFlake } from './utils/easyFlake';
import { ServerConfig } from './configType';
import { InMemoryConnectionManager } from './connection/main';
import { EM } from './utils/types';
import { Result } from '@kizahasi/result';
import { Context } from 'graphql-ws';
import { thumbsDir } from './utils/thumbsDir';
import { RateLimiterAbstract, RateLimiterMemory } from 'rate-limiter-flexible';
import { consume } from './rateLimit/consume';

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
}: {
    serverConfig: ServerConfig;
    promiseQueue: PromiseQueue;
    connectionManager: InMemoryConnectionManager;
    em: EM;
    schema: GraphQLSchema;
    debug: boolean;
    getDecodedIdTokenFromExpressRequest: (
        req: ExpressContext['req']
    ) => Promise<Result<Readonly<DecodedIdToken>, unknown> | undefined>;
    getDecodedIdTokenFromWsContext: (
        context: Context<Extra>
    ) => Promise<Result<Readonly<DecodedIdToken>, unknown> | undefined>;
    port: string | number;
}) => {
    let rateLimiter: RateLimiterAbstract | null = null;
    if (!serverConfig.disableRateLimitExperimental) {
        rateLimiter = new RateLimiterMemory({
            // TODO: 値をちゃんと決める
            duration: 60,
            points: 600,
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

    // The ApolloServer constructor requires two parameters: your schema
    // definition and your set of resolvers.
    const apolloServer = new ApolloServer({
        schema,
        context,
        debug,
    });
    await apolloServer.start();

    const app = express();

    // 先に書くほど優先度が高いようなので、applyMiddlewareを先に書くと、/graphqlが上書きされない。
    apolloServer.applyMiddleware({ app });

    if (serverConfig.accessControlAllowOrigin == null) {
        AppConsole.log({
            en: '"accessControlAllowOrigin" config was not found. "Access-Control-Allow-Origin" header will be empty.',
            ja: '"accessControlAllowOrigin" のコンフィグが見つかりませんでした。"Access-Control-Allow-Origin" ヘッダーは空になります。',
        });
    } else {
        AppConsole.log({
            en: `"accessControlAllowOrigin" config was found. "Access-Control-Allow-Origin" header will be "${serverConfig.accessControlAllowOrigin}".`,
            ja: `"accessControlAllowOrigin" のコンフィグが見つかりました。"Access-Control-Allow-Origin" ヘッダーは "${serverConfig.accessControlAllowOrigin}" になります。`,
        });
        const accessControlAllowOrigin = serverConfig.accessControlAllowOrigin;
        app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', accessControlAllowOrigin);
            res.header(
                'Access-Control-Allow-Headers',
                'Origin, X-Requested-With, Content-Type, Accept, Authorization'
            );
            next();
        });
    }

    const directory = serverConfig.uploader.directory;
    if (directory != null) {
        AppConsole.log({
            en: `The uploader of API server is enabled.`,
            ja: `APIサーバーのアップローダーは有効化されています。`,
        });

        await ensureDir(path.resolve(directory));
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, path.resolve(directory));
            },
            filename: function (req, file, cb) {
                cb(null, easyFlake() + path.extname(file.originalname));
            },
        });

        app.post(
            '/uploader/upload/:permission',
            async (req, res, next) => {
                const decodedIdToken = await getDecodedIdTokenFromExpressRequest(req);
                if (decodedIdToken == null || decodedIdToken.isError) {
                    res.status(403).send('Invalid Authorization header');
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
                        fileSize: serverConfig.uploader.maxFileSize,
                    },
                    fileFilter: (req, file, cb) => {
                        if (
                            serverConfig.uploader.countQuota != null &&
                            serverConfig.uploader.countQuota <= filesCount
                        ) {
                            cb(null, false);
                            res.status(400).send('File count quota exceeded');
                            return;
                        }
                        const totalSize = files.reduce((seed, elem) => seed + elem.size, 0);
                        if (
                            serverConfig.uploader.sizeQuota != null &&
                            serverConfig.uploader.sizeQuota <= totalSize
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
            async (req, res) => {
                const forkedEm: EM = res.locals.forkedEm;
                const user: User = res.locals.user;

                let permissionParam: 'unlisted' | 'public';
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
                const thumbDir = path.join(path.dirname(file.path), thumbsDir);
                await ensureDir(thumbDir);
                const thumbPath = path.join(thumbDir, thumbFileName);
                const thumbnailSaved = await sharp(file.path)
                    .resize(80)
                    .webp()
                    .toFile(thumbPath)
                    .then(() => true)
                    .catch(err => {
                        // 画像かどうかに関わらず全てのファイルをsharpに渡すため、mp3などといった画像でないファイルの場合はほぼ確実にこの関数が実行される

                        console.log(err);
                        return false;
                    });
                const permission =
                    permissionParam === 'public'
                        ? FilePermissionType.Entry
                        : FilePermissionType.Private;
                const entity = new File({
                    ...file,
                    screenname: file.originalname,
                    createdBy: Reference.create<User, 'userUid'>(user),
                    thumbFilename: thumbnailSaved ? thumbFileName : undefined,
                    filesize: file.size,
                    deletePermission: permission,
                    listPermission: permission,
                    renamePermission: permission,
                });
                await forkedEm.persistAndFlush(entity);
                res.sendStatus(200);
            }
        );
    } else {
        AppConsole.log({
            en: `The uploader of API server is disabled.`,
            ja: `APIサーバーのアップローダーは無効化されています。`,
        });
    }

    app.get('/uploader/:type/:file_name', async (req, res) => {
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
            res.status(403).send('Invalid Authorization header');
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

        // SVGを直接開くことによるXSSを防いでいる https://qiita.com/itizawa/items/e98ecd67910492d5c2af ただし、現状では必要ないかもしれない
        res.header('Content-Security-Policy', "script-src 'unsafe-hashes'");
        res.sendFile(filepath, () => {
            res.end();
        });
    });

    // https://github.com/enisdenjo/graphql-ws のコードを使用
    const server = app.listen(port, () => {
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
                    const decodedIdToken = await getDecodedIdTokenFromWsContext(ctx);
                    const result: ResolverContext = {
                        decodedIdToken,
                        rateLimiter,
                        serverConfig,
                        promiseQueue,
                        connectionManager,
                        // subscriptionsのcontextは、websocketの接続が確立されるたびに作成される。そのため、接続IDが同じならば、（ここでfork()を読んでいるにも関わらず）同じemが使い回されることになるので注意。Subscriptionのコード内でデータベースにアクセスするならば、メソッド内に毎回forkするコードを書いておくほうが無難かもしれない。
                        em: em.fork(),
                        authorizedUser: null,
                    };
                    return result;
                },
                onSubscribe: async (ctx, message) => {
                    if (message.payload.operationName?.toLowerCase() !== 'roomevent') {
                        return;
                    }
                    const decodedIdToken = await getDecodedIdTokenFromWsContext(ctx);
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

        console.log(`🚀 Server ready at http://localhost:${port}${apolloServer.graphqlPath}`);
        console.log(`🚀 Subscriptions ready at ws://localhost:${port}${subscriptionsPath}`);
    });
    return server;
};
