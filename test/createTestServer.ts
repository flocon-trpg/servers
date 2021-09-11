import { createPostgreSQL, createSQLite } from '../src/mikro-orm';
import { EM, ORM } from '../src/utils/types';
import { PromiseQueue } from '../src/utils/promiseQueue';
import { InMemoryConnectionManager } from '../src/connection/main';
import { BaasType } from '../src/enums/BaasType';
import { DatabaseConfig, plain, postgresql, ServerConfig, sqlite } from '../src/configType';
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
};

let sqliteIndex = 0;
const createSQLiteConfig = () => {
    sqliteIndex++;
    return { dbName: `./test${sqliteIndex}.sqlite3`, debug: true };
};

export const createTestServer = async (
    orm: 'SQLite' | 'PostgreSQL',
    entryPasswordConfig: ServerConfig['entryPassword']
) => {
    const promiseQueue = new PromiseQueue({ queueLimit: 2 });
    const connectionManager = new InMemoryConnectionManager();

    let $orm: ORM;
    let databaseConfig: DatabaseConfig;
    switch (orm) {
        case 'PostgreSQL':
            $orm = await createPostgreSQL(PostgreSQLConfig);
            databaseConfig = {
                __type: postgresql,
                clientUrl: postgresClientUrl,
                dbName: 'test',
            };
            break;
        case 'SQLite':
            $orm = await createSQLite(createSQLiteConfig());
            databaseConfig = {
                __type: sqlite,
                dbName: './test.sqlite3',
            };
            break;
    }
    const adminConfig: ServerConfig['admin'] = undefined;
    const serverConfig: ServerConfig = {
        accessControlAllowOrigin: '*',
        admin: adminConfig,
        database: databaseConfig,
        entryPassword: entryPasswordConfig,
        uploader: {
            enabled: true,
            maxFileSize: 1000 * 1000,
            sizeQuota: 100 * 1000 * 1000,
            countQuota: 10,
            directory: './uploader',
        },
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
