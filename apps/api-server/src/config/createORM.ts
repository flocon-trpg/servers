import { Ok, Result } from '@kizahasi/result';
import { Options as $Options, Connection, IDatabaseDriver, MikroORM } from '@mikro-orm/core';
import { DATABASE_URL, HEROKU, MYSQL, POSTGRESQL, SQLITE } from '../env';
import {
    DirName,
    createMySQLOptions,
    createPostgreSQLOptions,
    createSQLiteOptions,
} from '../mikro-orm';
import { AppConsole } from '../utils/appConsole';
import { ORM } from '../utils/types';
import {
    MysqlDatabaseConfig,
    PostgresqlDatabaseConfig,
    ServerConfig,
    ServerConfigForMigration,
    SqliteDatabaseConfig,
    mysql,
    postgresql,
    sqlite,
} from './types';

type Options = $Options<IDatabaseDriver<Connection>>;

const createMySQLORM = (
    mysqlConfig: MysqlDatabaseConfig | undefined,
    databaseArg: typeof mysql | null,
    dirName: DirName,
    debug: boolean
): Result<Options> => {
    if (mysqlConfig == null) {
        if (databaseArg === mysql) {
            return Result.error(
                `使用するデータベースとしてMySQLが指定されましたが、設定が見つかりませんでした。${MYSQL}の値を設定する必要があります。`
            );
        }
        return Result.error(
            `使用するデータベースとしてPostgreSQLが指定されましたが、${MYSQL}の値が設定されていません。`
        );
    }
    const result = createMySQLOptions({
        dbName: mysqlConfig.dbName,
        dirName,
        clientUrl: mysqlConfig.clientUrl,
        driverOptions: mysqlConfig.driverOptions,
        debug,
    });
    return Result.ok(result);
};

const createSQLiteORM = (
    sqliteConfig: SqliteDatabaseConfig,
    dirName: DirName,
    debug: boolean
): Ok<Options> => {
    const result = createSQLiteOptions({ dbName: sqliteConfig.dbName, dirName, debug });
    return Result.ok(result);
};

const createPostgresORM = (
    postgresConfig: PostgresqlDatabaseConfig | undefined,
    serverConfig: ServerConfigForMigration,
    databaseArg: typeof postgresql | null,
    dirName: DirName,
    debug: boolean
): Result<Options> => {
    if (serverConfig.heroku) {
        if (serverConfig.herokuDatabaseUrl != null) {
            const result = createPostgreSQLOptions({
                clientUrl: serverConfig.herokuDatabaseUrl,
                dbName: undefined,
                driverOptions: {
                    connection: { ssl: { rejectUnauthorized: false } },
                },
                dirName,
                debug,
            });
            return Result.ok(result);
        }
        AppConsole.logJa(
            `${HEROKU}の値がtrueですが、${DATABASE_URL}の値が見つかりませんでした。Heroku以外で動かしている可能性があります。${DATABASE_URL}によるデータベースの参照はスキップされます。`
        );
    }
    if (postgresConfig == null) {
        if (databaseArg === postgresql) {
            return Result.error(
                `使用するデータベースとしてPostgreSQLが指定されましたが、設定が見つかりませんでした。${POSTGRESQL}の値を設定する必要があります。Herokuの場合はHeroku Postgresをインストールしていてなおかつ${DATABASE_URL}の値が設定されていることを確認してください。`
            );
        }
        return Result.error(
            `使用するデータベースとしてPostgreSQLが指定されましたが、${POSTGRESQL}の値が設定されていません。`
        );
    }
    const result = createPostgreSQLOptions({
        dbName: postgresConfig.dbName,
        dirName,
        clientUrl: postgresConfig.clientUrl,
        driverOptions: postgresConfig.driverOptions,
        debug,
    });
    return Result.ok(result);
};

type ExactlyOneServerConfig =
    | {
          type: typeof mysql;
          mysql: NonNullable<ServerConfigForMigration['mysql']>;
          postgresql?: undefined;
          sqlite?: undefined;
      }
    | {
          type: typeof postgresql;
          mysql?: undefined;
          postgresql: NonNullable<ServerConfigForMigration['postgresql']>;
          sqlite?: undefined;
      }
    | {
          type: typeof sqlite;
          mysql?: undefined;
          postgresql?: undefined;
          sqlite: NonNullable<ServerConfigForMigration['sqlite']>;
      }
    | {
          type: 'notOne';
          mysql?: undefined;
          postgresql?: undefined;
          sqlite?: undefined;
      }
    | {
          type: 'notOne';
          mysql?: undefined;
          postgresql: NonNullable<ServerConfig['postgresql']>;
          sqlite: ServerConfigForMigration['sqlite'];
      }
    | {
          type: 'notOne';
          mysql: NonNullable<ServerConfigForMigration['mysql']>;
          postgresql?: undefined;
          sqlite: NonNullable<ServerConfigForMigration['sqlite']>;
      }
    | {
          type: 'notOne';
          mysql: NonNullable<ServerConfigForMigration['mysql']>;
          postgresql: NonNullable<ServerConfig['postgresql']>;
          sqlite?: undefined;
      }
    | {
          type: 'notOne';
          mysql: NonNullable<ServerConfigForMigration['mysql']>;
          postgresql: NonNullable<ServerConfig['postgresql']>;
          sqlite: NonNullable<ServerConfigForMigration['sqlite']>;
      };

const isExactlyOneServerConfig = (
    serverConfig: ServerConfigForMigration
): ExactlyOneServerConfig => {
    if (serverConfig.mysql == null) {
        if (serverConfig.postgresql == null) {
            if (serverConfig.sqlite == null) {
                return {
                    type: 'notOne',
                    mysql: undefined,
                    postgresql: undefined,
                    sqlite: undefined,
                };
            } else {
                return { type: sqlite, sqlite: serverConfig.sqlite };
            }
        } else {
            if (serverConfig.sqlite == null) {
                return { type: postgresql, postgresql: serverConfig.postgresql };
            } else {
                return {
                    type: 'notOne',
                    mysql: undefined,
                    postgresql: serverConfig.postgresql,
                    sqlite: serverConfig.sqlite,
                };
            }
        }
    } else {
        if (serverConfig.postgresql == null) {
            if (serverConfig.sqlite == null) {
                return {
                    type: mysql,
                    mysql: serverConfig.mysql,
                    postgresql: undefined,
                    sqlite: undefined,
                };
            } else {
                return {
                    type: 'notOne',
                    mysql: serverConfig.mysql,
                    sqlite: serverConfig.sqlite,
                };
            }
        } else {
            if (serverConfig.sqlite == null) {
                return {
                    type: 'notOne',
                    mysql: serverConfig.mysql,
                    postgresql: serverConfig.postgresql,
                };
            } else {
                return {
                    type: 'notOne',
                    mysql: serverConfig.mysql,
                    postgresql: serverConfig.postgresql,
                    sqlite: serverConfig.sqlite,
                };
            }
        }
    }
};

/**
 * @example
 * ```typescript
 * const orm = await createORM(createORMOptions(serverConfig, databaseArg, dirName, debug));
 * ```
 */
export const createORMOptions = (
    serverConfig: ServerConfigForMigration,
    databaseArg: typeof postgresql | typeof sqlite | typeof mysql | null,
    dirName: DirName,
    debug: boolean
): Result<Options> => {
    switch (databaseArg) {
        case null: {
            if (serverConfig.heroku) {
                return createPostgresORM(
                    serverConfig.postgresql,
                    serverConfig,
                    databaseArg,
                    dirName,
                    debug
                );
            }
            const exactlyOneServerConfigResult = isExactlyOneServerConfig(serverConfig);
            switch (exactlyOneServerConfigResult.type) {
                case mysql:
                    return createMySQLORM(
                        exactlyOneServerConfigResult.mysql,
                        databaseArg,
                        dirName,
                        debug
                    );
                case postgresql:
                    return createPostgresORM(
                        exactlyOneServerConfigResult.postgresql,
                        serverConfig,
                        databaseArg,
                        dirName,
                        debug
                    );
                case sqlite:
                    return createSQLiteORM(exactlyOneServerConfigResult.sqlite, dirName, debug);
                default: {
                    if (exactlyOneServerConfigResult.mysql == null) {
                        if (exactlyOneServerConfigResult.postgresql == null) {
                            return Result.error('Database config not found.');
                        }
                        return Result.error(
                            `Because ${POSTGRESQL} and ${SQLITE} are set in config, you must use --db parameter to specify a database to use.`
                        );
                    }
                    if (exactlyOneServerConfigResult.postgresql == null) {
                        return Result.error(
                            `Because ${MYSQL} and ${SQLITE} are set in config, you must use --db parameter to specify a database to use.`
                        );
                    }
                    if (exactlyOneServerConfigResult.sqlite == null) {
                        return Result.error(
                            `Because ${MYSQL} and ${POSTGRESQL} are set in config, you must use --db parameter to specify a database to use.`
                        );
                    }
                    return Result.error(
                        `Because ${MYSQL}, ${POSTGRESQL}, and ${SQLITE} are set in config, you must use --db parameter to specify a database to use.`
                    );
                }
            }
        }
        case mysql: {
            if (serverConfig.mysql == null) {
                return Result.error(
                    `使用するデータベースとしてMySQLが指定されましたが、${MYSQL}の値が設定されていません。`
                );
            }
            return createMySQLORM(serverConfig.mysql, databaseArg, dirName, debug);
        }
        case sqlite: {
            if (serverConfig.sqlite == null) {
                return Result.error(
                    `使用するデータベースとしてSQLiteが指定されましたが、${SQLITE}の値が設定されていません。`
                );
            }
            return createSQLiteORM(serverConfig.sqlite, dirName, debug);
        }
        case postgresql: {
            return createPostgresORM(
                serverConfig.postgresql,
                serverConfig,
                databaseArg,
                dirName,
                debug
            );
        }
    }
};

export const createORM = async (options: Result<Options>): Promise<Result<ORM>> => {
    if (options.isError) {
        return options;
    }
    try {
        const result = await MikroORM.init(options.value);
        return Result.ok(result);
    } catch (e) {
        AppConsole.error({
            en: 'Could not connect to the database!',
            ja: 'データベースに接続できませんでした',
        });
        // TODO: 適度にcatchする
        throw e;
    }
};
