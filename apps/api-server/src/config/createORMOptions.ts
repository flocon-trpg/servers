import { Ok, Result } from '@kizahasi/result';
import { Options as $Options, Connection, IDatabaseDriver } from '@mikro-orm/core';
import { DATABASE_URL, HEROKU, MYSQL, POSTGRESQL, SQLITE } from '../env';
import {
    DirName,
    createMySQLOptions,
    createPostgreSQLOptions,
    createSQLiteOptions,
} from '../mikro-orm';
import { AppConsole } from '../utils/appConsole';
import { determineDatabaseUrl } from './determineDatabaseUrl';
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

const createMySQLOptionsResult = (
    mysqlConfig: MysqlDatabaseConfig | undefined,
    databaseArg: typeof mysql | null,
    dirName: DirName
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
    });
    return Result.ok(result);
};

const createSQLiteOptionsResult = (
    sqliteConfig: SqliteDatabaseConfig,
    dirName: DirName
): Ok<Options> => {
    const result = createSQLiteOptions({ sqliteConfig, dirName });
    return Result.ok(result);
};

const createPostgresOptionsResult = (
    postgresConfig: PostgresqlDatabaseConfig | undefined,
    serverConfig: ServerConfigForMigration,
    databaseArg: typeof postgresql | null,
    dirName: DirName
): Result<Options> => {
    if (serverConfig.heroku) {
        if (serverConfig.databaseUrl != null) {
            const result = createPostgreSQLOptions({
                clientUrl: serverConfig.databaseUrl,
                dbName: undefined,
                driverOptions: {
                    connection: { ssl: { rejectUnauthorized: false } },
                },
                dirName,
            });
            return Result.ok(result);
        }
        AppConsole.infoAsNoticeJa(
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
    });
    return Result.ok(result);
};

const notOne = 'notOne';

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
          type: typeof notOne;
          mysql?: undefined;
          postgresql?: undefined;
          sqlite?: undefined;
      }
    | {
          type: typeof notOne;
          mysql?: undefined;
          postgresql: NonNullable<ServerConfig['postgresql']>;
          sqlite: ServerConfigForMigration['sqlite'];
      }
    | {
          type: typeof notOne;
          mysql: NonNullable<ServerConfigForMigration['mysql']>;
          postgresql?: undefined;
          sqlite: NonNullable<ServerConfigForMigration['sqlite']>;
      }
    | {
          type: typeof notOne;
          mysql: NonNullable<ServerConfigForMigration['mysql']>;
          postgresql: NonNullable<ServerConfig['postgresql']>;
          sqlite?: undefined;
      }
    | {
          type: typeof notOne;
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
                    type: notOne,
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
                    type: notOne,
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
                    type: notOne,
                    mysql: serverConfig.mysql,
                    sqlite: serverConfig.sqlite,
                };
            }
        } else {
            if (serverConfig.sqlite == null) {
                return {
                    type: notOne,
                    mysql: serverConfig.mysql,
                    postgresql: serverConfig.postgresql,
                };
            } else {
                return {
                    type: notOne,
                    mysql: serverConfig.mysql,
                    postgresql: serverConfig.postgresql,
                    sqlite: serverConfig.sqlite,
                };
            }
        }
    }
};

const seeDatabaseUrl = 'seeDatabaseUrl';

const createORMOptionsWithoutDatabaseUrl = (
    serverConfig: ServerConfigForMigration,
    databaseArg: typeof postgresql | typeof sqlite | typeof mysql | null,
    dirName: DirName
): Result<Options | typeof seeDatabaseUrl> => {
    switch (databaseArg) {
        case null: {
            const exactlyOneServerConfigResult = isExactlyOneServerConfig(serverConfig);
            switch (exactlyOneServerConfigResult.type) {
                case mysql:
                    return createMySQLOptionsResult(
                        exactlyOneServerConfigResult.mysql,
                        databaseArg,
                        dirName
                    );
                case postgresql:
                    return createPostgresOptionsResult(
                        exactlyOneServerConfigResult.postgresql,
                        serverConfig,
                        databaseArg,
                        dirName
                    );
                case sqlite:
                    return createSQLiteOptionsResult(exactlyOneServerConfigResult.sqlite, dirName);
                default: {
                    if (exactlyOneServerConfigResult.mysql == null) {
                        if (exactlyOneServerConfigResult.postgresql == null) {
                            return Result.ok(seeDatabaseUrl);
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
            return createMySQLOptionsResult(serverConfig.mysql, databaseArg, dirName);
        }
        case sqlite: {
            if (serverConfig.sqlite == null) {
                return Result.error(
                    `使用するデータベースとしてSQLiteが指定されましたが、${SQLITE}の値が設定されていません。`
                );
            }
            return createSQLiteOptionsResult(serverConfig.sqlite, dirName);
        }
        case postgresql: {
            return createPostgresOptionsResult(
                serverConfig.postgresql,
                serverConfig,
                databaseArg,
                dirName
            );
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
    dirName: DirName
): Result<Options> => {
    const ormOptionsBaseResult = createORMOptionsWithoutDatabaseUrl(
        serverConfig,
        databaseArg,
        dirName
    );
    if (ormOptionsBaseResult.isError) {
        return ormOptionsBaseResult;
    }
    const ormOptionsBase = ormOptionsBaseResult.value;

    if (ormOptionsBase === seeDatabaseUrl) {
        if (serverConfig.databaseUrl == null) {
            return Result.error('Database config not found.');
        }
        const databaseUrlResult = determineDatabaseUrl(serverConfig.databaseUrl);
        if (databaseUrlResult.isError) {
            // TODO: jaの文字列も返す
            return Result.error(databaseUrlResult.error.en);
        }
        switch (databaseUrlResult.value.type) {
            case mysql:
                return Result.ok(
                    createMySQLOptions({
                        clientUrl: databaseUrlResult.value.mysql.clientUrl,
                        dirName,
                        dbName: undefined,
                        driverOptions: undefined,
                    })
                );
            case postgresql:
                return Result.ok(
                    createPostgreSQLOptions({
                        clientUrl: databaseUrlResult.value.postgresql.clientUrl,
                        dirName,
                        dbName: undefined,
                        driverOptions: serverConfig.heroku
                            ? {
                                  connection: { ssl: { rejectUnauthorized: false } },
                              }
                            : undefined,
                    })
                );
            case sqlite:
                return Result.ok(
                    createSQLiteOptions({
                        sqliteConfig: {
                            dbName: databaseUrlResult.value.sqlite.dbName,
                        },
                        dirName,
                    })
                );
        }
    }

    if (serverConfig.databaseUrl != null) {
        AppConsole.infoAsNoticeJa(
            `${MYSQL}, ${POSTGRESQL}, ${SQLITE} においてデータベースが設定されているため、${DATABASE_URL} の値は無視されました。`
        );
    }

    return Result.ok(ormOptionsBase);
};
