import { toBeNever } from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import * as t from 'io-ts';
import { ReadonlyDeep } from 'type-fest';
import { DATABASE_URL, HEROKU, MYSQL, POSTGRESQL, SQLITE } from './env';
import { createMySQL, createPostgreSQL, createSQLite, DirName } from './mikro-orm';
import { AppConsole } from './utils/appConsole';
import { ORM } from './utils/types';

// これらを変更したら、あわせて.env.localのテンプレートも変更する必要がある

export const postgresql = 'postgresql';
export const sqlite = 'sqlite';
export const mysql = 'mysql';
export const plain = 'plain';
export const bcrypt = 'bcrypt';
export const always = 'always';
export const disabled = 'disabled';
export const none = 'none';

const driverOptionsConfig = t.partial({
    driverOptions: t.record(t.string, t.unknown),
});

const partialDbName = t.partial({
    dbName: t.string,
});

export const mysqlDatabase = t.intersection([
    driverOptionsConfig,
    partialDbName,
    t.type({
        clientUrl: t.string,
    }),
]);

export type MysqlDatabaseConfig = t.TypeOf<typeof mysqlDatabase>;

export const postgresqlDatabase = t.intersection([
    driverOptionsConfig,
    partialDbName,
    t.type({
        clientUrl: t.string,
    }),
]);

export type PostgresqlDatabaseConfig = t.TypeOf<typeof postgresqlDatabase>;

export const sqliteDatabase = t.intersection([
    driverOptionsConfig,
    t.type({
        dbName: t.string,
    }),
]);

export type SqliteDatabaseConfig = t.TypeOf<typeof sqliteDatabase>;

export const firebaseAdminSecret = t.intersection([
    t.type({
        client_email: t.string,
        private_key: t.string,
    }),
    t.partial({
        project_id: t.string,
    }),
]);

export type FirebaseAdminSecretConfig = t.TypeOf<typeof firebaseAdminSecret>;

export const entryPassword = t.union([
    t.type({ type: t.literal(none) }),
    t.type({
        type: t.union([t.literal(plain), t.literal(bcrypt)]),
        value: t.string,
    }),
]);

export type EntryPasswordConfig = {
    type: typeof plain | typeof bcrypt;
    value: string;
};

export type UploaderConfig = {
    enabled: boolean;

    // 1ファイルあたりの最大サイズ。
    // 注意点として、現在のファイルサイズのquotaの仕様では、「もしこのファイルをアップロードしてquotaを超えるようならばアップロードを拒否」ではなく「現在の合計ファイルサイズがquotaを超えているならばどのアップロードも拒否、そうでなければアップロードは許可」となっている（理由は、例えばquotaを100MBに設定していて合計ファイルサイズが99.99MBだったとき、ファイルのアップロードがほぼ常に失敗するため。）。そのため、1ユーザーあたりが保存できるファイルサイズをFとすると、適切な不等式は F < quota ではなく、(F + maxFileSize) < quota となる。よって、もしmaxFileSizeが大きすぎると想定されていたquotaを大きく上回ってしまう可能性がある。
    maxFileSize?: number;

    // 1ユーザーが保存できるファイルの合計サイズ。
    sizeQuota?: number;

    // 1ユーザーが保存できるファイルの合計個数。大量に小さいファイルをアップロードしてサーバーの動作を遅くする攻撃を防ぐ狙いがある。
    countQuota?: number;

    directory?: string;
};

export type WritableServerConfigForMigration = {
    heroku: boolean;

    // HerokuでHeroku Postgresを使うと自動的にセットされる DATABASE_URL を表す。
    herokuDatabaseUrl: string | undefined;

    mysql: MysqlDatabaseConfig | undefined;
    postgresql: PostgresqlDatabaseConfig | undefined;
    sqlite: SqliteDatabaseConfig | undefined;
};

export type ServerConfigForMigration = ReadonlyDeep<WritableServerConfigForMigration>;

export namespace ServerConfigForMigration {
    const createMySQLORM = async (
        mysqlConfig: MysqlDatabaseConfig | undefined,
        databaseArg: typeof mysql | null,
        dirName: DirName,
        debug: boolean
    ): Promise<Result<ORM>> => {
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
        const result = await createMySQL({
            dbName: mysqlConfig.dbName,
            dirName,
            clientUrl: mysqlConfig.clientUrl,
            driverOptions: mysqlConfig.driverOptions,
            debug,
        });
        return Result.ok(result);
    };

    const createSQLiteORM = async (
        sqliteConfig: SqliteDatabaseConfig,
        dirName: DirName,
        debug: boolean
    ): Promise<Result<ORM>> => {
        const result = await createSQLite({ dbName: sqliteConfig.dbName, dirName, debug });
        return Result.ok(result);
    };

    const createPostgresORM = async (
        postgresConfig: PostgresqlDatabaseConfig | undefined,
        serverConfig: ServerConfigForMigration,
        databaseArg: typeof postgresql | null,
        dirName: DirName,
        debug: boolean
    ): Promise<Result<ORM>> => {
        if (serverConfig.heroku) {
            if (serverConfig.herokuDatabaseUrl != null) {
                const result = await createPostgreSQL({
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
                `${HEROKU}の値がtrueですが、${DATABASE_URL}の値が見つかりませんでした。${DATABASE_URL}によるデータベースの参照はスキップします…`
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
        const result = await createPostgreSQL({
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

    const createORMCore = async (
        serverConfig: ServerConfigForMigration,
        databaseArg: typeof postgresql | typeof sqlite | typeof mysql | null,
        dirName: DirName,
        debug: boolean
    ): Promise<Result<ORM>> => {
        switch (databaseArg) {
            case null: {
                const exactlyOneServerConfigResult = isExactlyOneServerConfig(serverConfig);
                switch (exactlyOneServerConfigResult.type) {
                    case mysql:
                        return await createMySQLORM(
                            exactlyOneServerConfigResult.mysql,
                            databaseArg,
                            dirName,
                            debug
                        );
                    case postgresql:
                        return await createPostgresORM(
                            exactlyOneServerConfigResult.postgresql,
                            serverConfig,
                            databaseArg,
                            dirName,
                            debug
                        );
                    case sqlite:
                        return await createSQLiteORM(
                            exactlyOneServerConfigResult.sqlite,
                            dirName,
                            debug
                        );
                    default: {
                        if (exactlyOneServerConfigResult.mysql == null) {
                            if (exactlyOneServerConfigResult.postgresql == null) {
                                return Result.error('Database config not found.');
                            }
                            return Result.error(
                                `Because ${POSTGRESQL} and ${SQLITE} are set, you must use --db parameter to specify a database to use.`
                            );
                        }
                        if (exactlyOneServerConfigResult.postgresql == null) {
                            return Result.error(
                                `Because ${MYSQL} and ${SQLITE} are set, you must use --db parameter to specify a database to use.`
                            );
                        }
                        if (exactlyOneServerConfigResult.sqlite == null) {
                            return Result.error(
                                `Because ${MYSQL} and ${POSTGRESQL} are set, you must use --db parameter to specify a database to use.`
                            );
                        }
                        return Result.error(
                            `Because ${MYSQL}, ${POSTGRESQL}, and ${SQLITE} are set, you must use --db parameter to specify a database to use.`
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
                return await createMySQLORM(serverConfig.mysql, databaseArg, dirName, debug);
            }
            case sqlite: {
                if (serverConfig.sqlite == null) {
                    return Result.error(
                        `使用するデータベースとしてSQLiteが指定されましたが、${SQLITE}の値が設定されていません。`
                    );
                }
                return await createSQLiteORM(serverConfig.sqlite, dirName, debug);
            }
            case postgresql: {
                return await createPostgresORM(
                    serverConfig.postgresql,
                    serverConfig,
                    databaseArg,
                    dirName,
                    debug
                );
            }
            default:
                toBeNever(databaseArg);
        }
    };

    export async function createORM(
        serverConfig: ServerConfigForMigration,
        databaseArg: typeof postgresql | typeof sqlite | typeof mysql | null,
        dirName: DirName,
        debug: boolean
    ) {
        try {
            return await createORMCore(serverConfig, databaseArg, dirName, debug);
        } catch (e) {
            AppConsole.error({
                en: 'Could not connect to the database!',
                ja: 'データベースに接続できませんでした',
            });
            // TODO: 適度にcatchする
            throw e;
        }
    }
}

export type WritableServerConfig = {
    admins: string[];
    entryPassword: EntryPasswordConfig | undefined;
    firebaseAdminSecret: Omit<FirebaseAdminSecretConfig, 'project_id'> | undefined;
    firebaseProjectId: string;
    uploader: UploaderConfig | undefined;
    autoMigration: boolean;
    accessControlAllowOrigin: string | undefined;
    roomHistCount: number | undefined;

    // rate limitのフォーマットが決まっていない（pointとdurationの指定のカスタマイズ、メソッドごとの消費pointのカスタマイズなど）が、とりあえずテストではrate limitは無効化したいため、experimentalとしている
    disableRateLimitExperimental: boolean;
} & WritableServerConfigForMigration;

export type ServerConfig = ReadonlyDeep<WritableServerConfig>;

export namespace ServerConfig {
    export async function createORM(
        serverConfig: ServerConfigForMigration,
        databaseArg: typeof postgresql | typeof sqlite | typeof mysql | null,
        dirName: DirName,
        debug: boolean
    ) {
        return await ServerConfigForMigration.createORM(serverConfig, databaseArg, dirName, debug);
    }
}
