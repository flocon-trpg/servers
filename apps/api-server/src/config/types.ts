import { LevelWithSilent } from 'pino';
import { ReadonlyDeep } from 'type-fest';
import { z } from 'zod';

// これらを変更したら、あわせて.env.localのテンプレートも変更する必要がある

export const postgresql = 'postgresql';
export const sqlite = 'sqlite';
export const mysql = 'mysql';
export const plain = 'plain';
export const bcrypt = 'bcrypt';
export const always = 'always';
export const disabled = 'disabled';
export const none = 'none';

const driverOptionsConfig = z
    .object({
        driverOptions: z.record(z.unknown()),
    })
    .partial();

const clientUrlType = z.object({
    clientUrl: z.string(),
});

const dbNamePartial = z
    .object({
        dbName: z.string(),
    })
    .partial();

export const mysqlDatabase = driverOptionsConfig.merge(dbNamePartial).merge(clientUrlType);

export type MysqlDatabaseConfig = z.TypeOf<typeof mysqlDatabase>;

export const postgresqlDatabase = driverOptionsConfig.merge(dbNamePartial).merge(clientUrlType);

export type PostgresqlDatabaseConfig = z.TypeOf<typeof postgresqlDatabase>;

const sqliteDatabaseCore = z.union([
    z.object({
        dbName: z.string(),
        clientUrl: z.undefined(),
    }),
    z.object({
        dbName: z.undefined(),
        clientUrl: z.string(),
    }),
    z.object({
        dbName: z.string(),
        clientUrl: z.string(),
    }),
]);

export const sqliteDatabase = driverOptionsConfig.and(sqliteDatabaseCore);

export type SqliteDatabaseConfig = z.TypeOf<typeof sqliteDatabase>;

export const firebaseAdminSecret = z
    .object({
        client_email: z.string(),
        private_key: z.string(),
    })
    .merge(
        z
            .object({
                project_id: z.string(),
            })
            .partial()
    );

export type FirebaseAdminSecretConfig = z.TypeOf<typeof firebaseAdminSecret>;

export const entryPassword = z.union([
    z.object({ type: z.literal(none) }),
    z.object({
        type: z.union([z.literal(plain), z.literal(bcrypt)]),
        value: z.string(),
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

    // DATABASE_URL を表す。Herokuやfly.ioなどではDATABASE_URLに値が自動的にセットされることがある。
    databaseUrl: string | undefined;

    mysql: MysqlDatabaseConfig | undefined;
    postgresql: PostgresqlDatabaseConfig | undefined;
    sqlite: SqliteDatabaseConfig | undefined;
};

export type ServerConfigForMigration = ReadonlyDeep<WritableServerConfigForMigration>;
export type WritableServerConfig = {
    admins: string[];
    entryPassword: EntryPasswordConfig | undefined;
    firebaseAdminSecret: FirebaseAdminSecretConfig | undefined;
    firebaseProjectId: string | undefined;
    uploader: UploaderConfig | undefined;
    autoMigration: boolean;
    accessControlAllowOrigin: string | undefined;
    roomHistCount: number | undefined;

    // rate limitのフォーマットが決まっていない（pointとdurationの指定のカスタマイズ、メソッドごとの消費pointのカスタマイズなど）が、とりあえずテストではrate limitは無効化したいため、experimentalとしている
    disableRateLimitExperimental: boolean;
} & WritableServerConfigForMigration;

export type ServerConfig = ReadonlyDeep<WritableServerConfig>;

export const json = 'json';
export const $default = 'default';
export type LogFormat = typeof json | typeof $default;

export type WritableLogConfig = {
    logFormat: LogFormat | undefined;
    logLevel: LevelWithSilent | undefined;
};

export type LogConfig = ReadonlyDeep<WritableLogConfig>;
