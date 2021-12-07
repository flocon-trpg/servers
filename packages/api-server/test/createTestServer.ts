import { createPostgreSQL, createSQLite } from '../src/mikro-orm';
import { PromiseQueue } from '../src/utils/promiseQueue';
import { InMemoryConnectionManager } from '../src/connection/main';
import { BaasType } from '../src/enums/BaasType';
import { DatabaseConfig, postgresql, ServerConfig, sqlite } from '../src/configType';
import { buildSchema } from '../src/buildSchema';
import { PubSub } from 'graphql-subscriptions';
import { createServer } from '../src/createServer';
import { Result } from '@kizahasi/result';
import { Resources } from './resources';

// github actionsではlocalhost:5432ではなくpostgres:5432のようにしないとデータベースが見つからない
const postgresClientUrl = 'postgresql://postgres:postgres@postgres:5432';

const PostgreSQLConfig = {
    dbName: 'test',
    clientUrl: postgresClientUrl,
    debug: true,
    driverOptions: undefined,
    dir: 'src',
} as const;

export type DbConfig =
    | {
          type: 'SQLite';
          dbName: string;
      }
    | {
          type: 'PostgreSQL';
      };

const createSQLiteConfig = (dbName: string) => {
    return { dbName, dir: 'src', debug: true } as const;
};

export const createOrm = async (dbCofig: DbConfig) => {
    switch (dbCofig.type) {
        case 'PostgreSQL':
            return await createPostgreSQL(PostgreSQLConfig);
        case 'SQLite':
            return await createSQLite(createSQLiteConfig(dbCofig.dbName));
    }
};

const createDatabaseConfig = (dbConfig: DbConfig): DatabaseConfig => {
    switch (dbConfig.type) {
        case 'PostgreSQL':
            return {
                __type: postgresql,
                clientUrl: postgresClientUrl,
                dbName: 'test',
                driverOptions: undefined,
            };
        case 'SQLite':
            return {
                __type: sqlite,
                dbName: dbConfig.dbName,
                driverOptions: undefined,
            };
    }
};

export const createTestServer = async (
    dbConfig: DbConfig,
    entryPasswordConfig: ServerConfig['entryPassword']
) => {
    const promiseQueue = new PromiseQueue({ queueLimit: 2 });
    const connectionManager = new InMemoryConnectionManager();

    const $orm = await createOrm(dbConfig);
    const databaseConfig = createDatabaseConfig(dbConfig);
    const serverConfig: ServerConfig = {
        accessControlAllowOrigin: '*',
        admins: [],
        database: databaseConfig,
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

    // テスト終了時のための後処理
    result.on('close', () => {
        const main = async () => {
            await $orm.close();
        };
        main();
    });

    return result;
};
