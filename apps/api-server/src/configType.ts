import * as t from 'io-ts';

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

export type DatabaseConfig =
    | {
          __type: typeof postgresql;
          dbName: string | undefined;
          clientUrl: string;
          driverOptions: Record<string, unknown> | undefined;
      }
    | {
          __type: typeof sqlite;
          dbName: string;
          driverOptions: Record<string, unknown> | undefined;
      };

export const firebaseAdminSecret = t.type({
    client_email: t.string,
    private_key: t.string,
});

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

export type ServerConfig = {
    admins: string[];
    database: DatabaseConfig;
    entryPassword?: EntryPasswordConfig;
    firebaseAdminSecret?: FirebaseAdminSecretConfig;
    uploader: UploaderConfig;
    autoMigration: boolean;
    accessControlAllowOrigin?: string;
    roomHistCount?: number;

    // rate limitのフォーマットが決まっていない（pointとdurationの指定のカスタマイズ、メソッドごとの消費pointのカスタマイズなど）が、とりあえずテストではrate limitは無効化したいため、experimentalとしている
    disableRateLimitExperimental: boolean;
};