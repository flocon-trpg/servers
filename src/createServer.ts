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
    const context = async (context: ExpressContext): Promise<ResolverContext> => {
        return {
            decodedIdToken: await getDecodedIdTokenFromExpressRequest(context.req),
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

    if (serverConfig.uploader?.enabled === true) {
        AppConsole.log({
            en: `The uploader of API server is enabled.`,
            ja: `APIサーバーのアップローダーが有効化されます。`,
        });

        const uploaderConfig = serverConfig.uploader;

        await ensureDir(path.resolve(uploaderConfig.directory));
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, path.resolve(uploaderConfig.directory));
            },
            filename: function (req, file, cb) {
                cb(null, easyFlake() + path.extname(file.originalname));
            },
        });

        app.post('/uploader/upload/:permission', async (req, res, next) => {
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

            const decodedIdToken = await getDecodedIdTokenFromExpressRequest(req);
            if (decodedIdToken == null || decodedIdToken.isError) {
                res.status(403).send('Invalid Authorization header');
                return;
            }

            const userUid = decodedIdToken.value.uid;
            const forkedEm = em.fork();
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
            const [files, filesCount] = await forkedEm.findAndCount(File, {
                createdBy: { userUid: user.userUid },
            });
            const upload = multer({
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
                    const thumbDir = path.join(path.dirname(file.path), 'thumbs');
                    const thumbPath = path.join(thumbDir, thumbFileName);
                    await ensureDir(thumbDir);
                    const thumbnailSaved = await sharp(file.path)
                        .resize(80)
                        .webp()
                        .toFile(thumbPath)
                        .then(() => true)
                        .catch(() => false);
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
                    next();
                };
                main();
            });
        });
    }

    // サムネイルはすべてwebpだが、file_nameは元画像の名前を指定する必要がある。そのため例えば、/uploader/thumbs/image.png で得られるファイルはpngでなくwebpとなる。
    app.get('/uploader/:type/:file_name', async (req, res, next) => {
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

        if (serverConfig.uploader?.enabled !== true) {
            res.status(403).send('Flocon uploader is disabled by server config');
            return;
        }

        const filename = sanitize(req.params.file_name);

        const decodedIdToken = await getDecodedIdTokenFromExpressRequest(req);
        if (decodedIdToken == null || decodedIdToken.isError) {
            res.status(403).send('Invalid Authorization header');
            return;
        }

        const forkedEm = em.fork();
        const user = await forkedEm.findOne(User, { userUid: decodedIdToken.value.uid });
        if (user?.isEntry !== true) {
            res.status(403).send('Requires entry');
            return;
        }

        const fileEntity = await forkedEm.findOne(File, { filename });
        if (fileEntity == null) {
            res.sendStatus(404);
            return;
        }

        let filepath: string;
        if (typeParam === 'files') {
            filepath = path.join(path.resolve(serverConfig.uploader.directory), filename);
        } else {
            if (fileEntity.thumbFilename == null) {
                res.sendStatus(404);
                next();
                return;
            }
            filepath = path.join(
                path.resolve(serverConfig.uploader.directory),
                'thumb',
                sanitize(fileEntity.thumbFilename)
            );
        }
        // SVGを直接開くことによるXSSを防いでいる https://qiita.com/itizawa/items/e98ecd67910492d5c2af ただし、現状では必要ないかもしれない
        res.header('Content-Security-Policy', "script-src 'unsafe-hashes'");
        res.sendFile(filepath, () => {
            res.end();
            next();
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
                        serverConfig,
                        promiseQueue,
                        connectionManager,
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
