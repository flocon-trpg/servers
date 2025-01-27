import { loggerRef, parseStringToBoolean } from '@flocon-trpg/utils';
import {
    ServerConfig,
    parseMysqlDatabaseConfig,
    parsePostgresqlDatabaseConfig,
    parseSqliteDatabaseConfig,
} from '../../../server-config/server-config.service';

const SQLITE_TEST = 'SQLITE_TEST';
const POSTGRESQL_TEST = 'POSTGRESQL_TEST';
const MYSQL_TEST = 'MYSQL_TEST';

// CONSIDER: Node.js 22 現在ではフラグを指定しないと .env 系のファイルは process.env に読み込まれないはずだが、これらの関数を実行した際はなぜか読み込まれる。NestJS のConfigModule を実行すると process.env に値がセットされる(https://qiita.com/piggydev/items/e76adcc3a65364f98537#inject-%E3%81%97%E3%81%AA%E3%81%84)みたいなので、それによってセットされた値が残ったりしているのかもしれない。現時点では .env 系のファイルは使えるが、Flocon のテストコードや NestJS の仕様が変わったときに .env 系のファイルが読み込まれなくなるかもしれないので注意！
// これらのコードの値も process.env ではなく ConfigService を使って読み込むようにするのがベストだと思うが、それには await が必要になりそうなので、jest では top-level await を使わない限り不可能だと思われる。

export const getSqliteTestConfig = (): ServerConfig['sqlite'] | undefined => {
    const defaultSqliteConfig: ServerConfig['sqlite'] = {
        dbName: './__test__.sqlite3',
    };

    const sqliteTest = process.env[SQLITE_TEST];
    if (sqliteTest == null) {
        return defaultSqliteConfig;
    }

    switch (parseStringToBoolean(sqliteTest).value) {
        case false: {
            loggerRef.info(`Skips SQLite tests because ${SQLITE_TEST} env is falsy.`);
            return undefined;
        }
        case true: {
            return defaultSqliteConfig;
        }
        case undefined: {
            const config = parseSqliteDatabaseConfig(sqliteTest);
            if (config.isError) {
                throw new Error(`Error at ${SQLITE_TEST}: ${config.error}`);
            }
            return config.value;
        }
    }
};

export const getPostgresqlTestConfig = (): ServerConfig['postgresql'] | undefined => {
    const postgresqlTest = process.env[POSTGRESQL_TEST];
    if (postgresqlTest == null) {
        loggerRef.info(`Skips PostgreSQL tests because ${POSTGRESQL_TEST} env is not set.`);
        return undefined;
    }
    switch (parseStringToBoolean(postgresqlTest).value) {
        case false:
        case true: {
            throw new Error(
                `\`${postgresqlTest}\` is invalid. ${POSTGRESQL_TEST} does not support boolean-like value.`,
            );
        }
        case undefined: {
            const config = parsePostgresqlDatabaseConfig(postgresqlTest);
            if (config.isError) {
                throw new Error(`Error at ${POSTGRESQL_TEST}: ${config.error}`);
            }
            return config.value;
        }
    }
};

export const getMysqlTestConfig = (): ServerConfig['mysql'] | undefined => {
    const mysqlTest = process.env[MYSQL_TEST];
    if (mysqlTest == null) {
        loggerRef.info(`Skips MySQL tests because ${MYSQL_TEST} env is not set.`);
        return undefined;
    }
    switch (parseStringToBoolean(mysqlTest).value) {
        case false:
        case true: {
            throw new Error(
                `\`${mysqlTest}\` is invalid. ${MYSQL_TEST} does not support boolean-like value.`,
            );
        }
        case undefined: {
            const config = parseMysqlDatabaseConfig(mysqlTest);
            if (config.isError) {
                throw new Error(`Error at ${MYSQL_TEST}: ${config.error}`);
            }
            return config.value;
        }
    }
};
