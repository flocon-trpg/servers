import {
    createMySQLOptions,
    createPostgreSQLOptions,
    createSQLiteOptions,
} from '../../../src/mikro-orm';
import { PromiseQueue } from '../../../src/utils/promiseQueue';
import { InMemoryConnectionManager } from '../../../src/connection/main';
import { BaasType } from '../../../src/enums/BaasType';
import { ServerConfig, WritableServerConfig } from '../../../src/config/types';
import { buildSchema } from '../../../src/buildSchema';
import { PubSub } from 'graphql-subscriptions';
import { createServer } from '../../../src/createServer';
import { Result } from '@kizahasi/result';
import { Resources } from './resources';
import { mySQLClientUrl, postgresClientUrl } from './databaseConfig';
import { MikroORM } from '@mikro-orm/core';

const PostgreSQLConfig = {
    dbName: 'test',
    dirName: 'src',
    clientUrl: postgresClientUrl,
    // debug: trueだとGitHub Actionsのログのサイズが巨大（10MB以上）になるのでfalseにしている
    debug: false,
    driverOptions: undefined,
} as const;

const MySQLConfig = {
    dbName: 'test',
    dirName: 'src',
    clientUrl: mySQLClientUrl,
    // debug: trueだとGitHub Actionsのログのサイズが巨大（10MB以上）になるのでfalseにしている
    debug: false,
    driverOptions: undefined,
} as const;

export type DbConfig =
    | {
          type: 'SQLite';
          dbName: string;
      }
    | {
          type: 'PostgreSQL';
      }
    | { type: 'MySQL' };

const createSQLiteConfig = (dbName: string): Parameters<typeof createSQLiteOptions>[0] => {
    return {
        dbName,
        dirName: 'src',
        // debug: trueだとGitHub Actionsのログのサイズが巨大（10MB以上）になるのでfalseにしている
        debug: false,
    } as const;
};

const createOrmOpts = (dbConfig: DbConfig) => {
    switch (dbConfig.type) {
        case 'MySQL':
            return createMySQLOptions(MySQLConfig);
        case 'PostgreSQL':
            return createPostgreSQLOptions(PostgreSQLConfig);
        case 'SQLite':
            return createSQLiteOptions(createSQLiteConfig(dbConfig.dbName));
    }
};

export const createOrm = async (dbConfig: DbConfig) => {
    return await MikroORM.init(createOrmOpts(dbConfig));
};

const setDatabaseConfig = (target: WritableServerConfig, dbConfig: DbConfig): void => {
    switch (dbConfig.type) {
        case 'MySQL':
            target.mysql = {
                clientUrl: mySQLClientUrl,
                dbName: 'test',
                driverOptions: undefined,
            };
            return;
        case 'PostgreSQL':
            target.postgresql = {
                clientUrl: postgresClientUrl,
                dbName: 'test',
                driverOptions: undefined,
            };
            return;
        case 'SQLite':
            target.sqlite = {
                dbName: dbConfig.dbName,
                driverOptions: undefined,
            };
            return;
    }
};

export const createTestServer = async ({
    dbConfig,
    entryPasswordConfig,
    admins,
}: {
    dbConfig: DbConfig;
    entryPasswordConfig: ServerConfig['entryPassword'];
    admins?: ServerConfig['admins'];
}) => {
    const promiseQueue = new PromiseQueue({ queueLimit: 2 });
    const connectionManager = new InMemoryConnectionManager();

    const $orm = await createOrm(dbConfig);
    const serverConfig: WritableServerConfig = {
        accessControlAllowOrigin: '*',
        admins: admins == null ? [] : [...admins /* ReadonlyArrayをArrayに変換しているだけ */],
        firebaseAdminSecret: undefined,
        firebaseProjectId: 'FAKE_FIREBASE_PROJECTID',
        heroku: false,
        herokuDatabaseUrl: undefined,
        mysql: undefined,
        postgresql: undefined,
        sqlite: undefined,
        roomHistCount: undefined,
        entryPassword: entryPasswordConfig,
        autoMigration: false,
        uploader: {
            enabled: true,
            maxFileSize: 1000 * 1000,
            sizeQuota: 100 * 1000 * 1000,
            countQuota: 10,
            directory: './uploader',
        },
        disableRateLimitExperimental: true,
    };
    setDatabaseConfig(serverConfig, dbConfig);

    const schema = await buildSchema(serverConfig)({
        emitSchemaFile: false,
        pubSub: new PubSub(),
    });

    const result = await createServer({
        serverConfig,
        promiseQueue,
        connectionManager,
        em: $orm.em,
        schema,
        debug: true,
        quiet: true,
        getDecodedIdTokenFromWsContext: async context => {
            const uid = context.connectionParams?.[Resources.testAuthorizationHeader] as
                | string
                | undefined;
            if (uid == null) {
                return undefined;
            }
            return Result.ok({
                type: BaasType.Firebase,
                firebase: {
                    sign_in_provider: 'FAKE_SIGN_IN_PROVIDER',
                },
                uid,
            });
        },
        getDecodedIdTokenFromExpressRequest: async req => {
            const uid = req.headers[Resources.testAuthorizationHeader];
            if (typeof uid !== 'string') {
                return undefined;
            }
            return Result.ok({
                type: BaasType.Firebase,
                firebase: {
                    sign_in_provider: 'FAKE_SIGN_IN_PROVIDER',
                },
                uid,
            });
        },
        port: 4000,
    });

    return {
        close: async () => {
            await result.close();
            await $orm.close();
        },
    };
};
