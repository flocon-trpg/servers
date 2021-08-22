import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import path from 'path';
import admin from 'firebase-admin';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { ResolverContext } from './graphql+mikro-orm/utils/Contexts';
import { buildSchema } from './buildSchema';
import { PromiseQueue } from './utils/PromiseQueue';
import { prepareORM } from './mikro-orm';
import { firebaseConfig, loadServerConfigAsMain } from './config';
import ws from 'ws';
import { Extra, useServer } from 'graphql-ws/lib/use/ws';
import { execute, subscribe } from 'graphql';
import { checkMigrationsBeforeStart } from './migrate';
import { InMemoryConnectionManager, pubSub } from './connection/main';
import { Result } from '@kizahasi/result';
import { authToken } from '@kizahasi/util';
import { Context } from 'graphql-ws/lib/server';
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
import { v4 } from 'uuid';
import { FilePermissionType } from './enums/FilePermissionType';
import { ServerConfig } from './configType';

const logEntryPasswordConfig = (serverConfig: ServerConfig) => {
    if (serverConfig.entryPassword == null) {
        AppConsole.log({
            icon: '🔓',
            en: 'Entry password is disabled.',
            ja: 'エントリーパスワードは無効化されています。',
        });
    } else {
        AppConsole.log({
            icon: '🔐',
            en: 'Entry password is enabled.',
            ja: 'エントリーパスワードは有効化されています。',
        });
    }
};

const main = async (params: { debug: boolean }): Promise<void> => {
    admin.initializeApp({
        projectId: firebaseConfig.projectId,
    });

    const connectionManager = new InMemoryConnectionManager();

    const schema = await buildSchema({ emitSchemaFile: false, pubSub });
    const serverConfig = await loadServerConfigAsMain();
    const dbType = serverConfig.database.__type;
    const orm = await prepareORM(serverConfig.database, params.debug);
    await checkMigrationsBeforeStart(orm, dbType);
    logEntryPasswordConfig(serverConfig);

    const getDecodedIdToken = async (
        idToken: string
    ): Promise<Result<admin.auth.DecodedIdToken & { type: BaasType.Firebase }, unknown>> => {
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
        Result<admin.auth.DecodedIdToken & { type: BaasType.Firebase }, unknown> | undefined
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
            em: orm.em.fork(),
            authorizedUser: null,
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
                cb(null, v4() + path.extname(file.originalname));
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

            const decodedIdToken = await getDecodedIdTokenFromBearer(req.headers.authorization);
            if (decodedIdToken == null || decodedIdToken.isError) {
                res.status(403).send('Invalid Authorization header');
                return;
            }

            const userUid = decodedIdToken.value.uid;
            const em = orm.em.fork();
            const user = await getUserIfEntry({
                em,
                userUid,
                baasType: BaasType.Firebase,
            });
            if (user == null) {
                res.status(403).send('Requires entry');
                return;
            }
            const [files, filesCount] = await em.findAndCount(File, {
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
                    await em.persistAndFlush(entity);
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

        const decodedIdToken = await getDecodedIdTokenFromBearer(req.headers.authorization);
        if (decodedIdToken == null || decodedIdToken.isError) {
            res.status(403).send('Invalid Authorization header');
            return;
        }

        const em = orm.em.fork();
        const user = await em.findOne(User, { userUid: decodedIdToken.value.uid });
        if (user?.isEntry !== true) {
            res.status(403).send('Requires entry');
            return;
        }

        const fileEntity = await em.findOne(File, { filename });
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
                    const result: ResolverContext = {
                        decodedIdToken,
                        promiseQueue,
                        connectionManager,
                        em: orm.em.fork(),
                        authorizedUser: null,
                    };
                    return result;
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
