import { Result } from '@kizahasi/result';
import * as t from 'io-ts';
import { DATABASE_URL, HEROKU, POSTGRESQL, SQLITE } from './env';
import { createPostgreSQL, createSQLite } from './mikro-orm';
import { AppConsole } from './utils/appConsole';
import { ORM } from './utils/types';

// これらを変更したら、あわせて.env.localのテンプレートも変更する必要がある

export const postgresql = 'postgresql';
export const sqlite = 'sqlite';
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

export type ServerConfigForMigration = {
    heroku: boolean;

    // HerokuでHeroku Postgresを使うと自動的にセットされる DATABASE_URL を表す。
    herokuDatabaseUrl: string | undefined;

    postgresql: PostgresqlDatabaseConfig | undefined;
    sqlite: SqliteDatabaseConfig | undefined;
};

export namespace ServerConfigForMigration {
    const createSQLiteORM = async (sqliteConfig: SqliteDatabaseConfig): Promise<Result<ORM>> => {
        const result = await createSQLite({ dbName: sqliteConfig.dbName });
        return Result.ok(result);
    };

    const createPostgresORM = async (
        postgresConfig: PostgresqlDatabaseConfig | undefined,
        serverConfig: ServerConfigForMigration,
        databaseArg: typeof postgresql | null,
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
            clientUrl: postgresConfig.clientUrl,
            driverOptions: postgresConfig.driverOptions,
            debug,
        });
        return Result.ok(result);
    };

    const createORMCore = async (
        serverConfig: ServerConfigForMigration,
        databaseArg: typeof postgresql | typeof sqlite | null,
        debug: boolean
    ): Promise<Result<ORM>> => {
        switch (databaseArg) {
            case null:
                if (serverConfig.sqlite != null) {
                    if (serverConfig.postgresql != null) {
                        return Result.error(
                            `Because both ${POSTGRESQL} and ${SQLITE} are set, you must use --db parameter to specify a database to use.`
                        );
                    }
                    return await createSQLiteORM(serverConfig.sqlite);
                }
                return await createPostgresORM(
                    serverConfig.postgresql,
                    serverConfig,
                    databaseArg,
                    debug
                );
            case sqlite: {
                if (serverConfig.sqlite == null) {
                    return Result.error(
                        `使用するデータベースとしてSQLiteが指定されましたが、${SQLITE}の値が設定されていません。`
                    );
                }
                return await createSQLiteORM(serverConfig.sqlite);
            }
            case postgresql: {
                return await createPostgresORM(
                    serverConfig.postgresql,
                    serverConfig,
                    databaseArg,
                    debug
                );
            }
        }
    };

    export async function createORM(
        serverConfig: ServerConfigForMigration,
        databaseArg: typeof postgresql | typeof sqlite | null,
        debug: boolean
    ) {
        try {
            return await createORMCore(serverConfig, databaseArg, debug);
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

export type ServerConfig = {
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
} & ServerConfigForMigration;

export namespace ServerConfig {
    export async function createORM(
        serverConfig: ServerConfigForMigration,
        databaseArg: typeof postgresql | typeof sqlite | null,
        debug: boolean
    ) {
        return await ServerConfigForMigration.createORM(serverConfig, databaseArg, debug);
    }
}
