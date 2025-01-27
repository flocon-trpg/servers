import { filterInt, loggerRef, parseStringToBoolean } from '@flocon-trpg/utils';
import { Ok, Result } from '@kizahasi/result';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReadonlyDeep } from 'type-fest';
import { z } from 'zod';
import { parseError } from '../config/parseError';
import { parseErrorFromBoolean } from '../config/parseErrorFromBoolean';
import { parseErrorFromInteger } from '../config/parseErrorFromInteger';
import {
    ACCESS_CONTROL_ALLOW_ORIGIN,
    AUTO_MIGRATION,
    DATABASE_URL,
    EMBUPLOADER_COUNT_QUOTA,
    EMBUPLOADER_ENABLED,
    EMBUPLOADER_MAX_SIZE,
    EMBUPLOADER_PATH,
    EMBUPLOADER_SIZE_QUOTA,
    ENTRY_PASSWORD,
    FIREBASE_ADMIN_SECRET,
    FIREBASE_PROJECTID,
    FIREBASE_PROJECT_ID,
    FLOCON_ADMIN,
    FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL,
    HEROKU,
    MYSQL,
    POSTGRESQL,
    ROOMHIST_COUNT,
    SQLITE,
} from '../env';

// 環境変数のキーや値を変更したら、あわせて.env.localのテンプレートも変更する必要がある

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

const mysqlDatabase = driverOptionsConfig.merge(dbNamePartial).merge(clientUrlType);

export type MysqlDatabaseConfig = z.TypeOf<typeof mysqlDatabase>;

export const parseMysqlDatabaseConfig = (json: string): Result<MysqlDatabaseConfig> => {
    const jsonObject = tryParseJSON(json);
    if (jsonObject.isError) {
        return Result.error(jsonObject.error);
    }
    const parsed = mysqlDatabase.safeParse(jsonObject.value);
    if (parsed.success) {
        return Result.ok(parsed.data);
    }
    return Result.error(parsed.error.message);
};

const postgresqlDatabase = driverOptionsConfig.merge(dbNamePartial).merge(clientUrlType);

export type PostgresqlDatabaseConfig = z.TypeOf<typeof postgresqlDatabase>;

export const parsePostgresqlDatabaseConfig = (json: string): Result<PostgresqlDatabaseConfig> => {
    const jsonObject = tryParseJSON(json);
    if (jsonObject.isError) {
        return Result.error(jsonObject.error);
    }
    const parsed = postgresqlDatabase.safeParse(jsonObject.value);
    if (parsed.success) {
        return Result.ok(parsed.data);
    }
    return Result.error(parsed.error.message);
};

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

const sqliteDatabase = driverOptionsConfig.and(sqliteDatabaseCore);

export type SqliteDatabaseConfig = z.TypeOf<typeof sqliteDatabase>;

export const parseSqliteDatabaseConfig = (json: string): Result<SqliteDatabaseConfig> => {
    const jsonObject = tryParseJSON(json);
    if (jsonObject.isError) {
        return Result.error(jsonObject.error);
    }
    const parsed = sqliteDatabase.safeParse(jsonObject.value);
    if (parsed.success) {
        return Result.ok(parsed.data);
    }
    return Result.error(parsed.error.message);
};

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
            .partial(),
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

// TODO: ServerConfig関連の型はserver-configのserviceのコードに移動したほうがいいかもしれない
export type ServerConfig = ReadonlyDeep<WritableServerConfig>;

const tryParseJSON = (json: string): Result<unknown> => {
    try {
        return Result.ok(JSON.parse(json));
    } catch (e: unknown) {
        if (e instanceof Error) {
            return Result.error(e.message);
        }
        throw e;
    }
};

// パースなどに失敗したかどうかは確認できるようにしたいがエラーメッセージを表示するとミスで重要な情報が漏れる可能性がある。それを防ぐための型。
type EmptyErrorResult<T> = Result<T, undefined>;

// 誤って source の型が Result<T, TError> になっているときに、型エラーを出すための関数。
const ensureOk = <T>(source: Ok<T> | undefined): T | undefined => {
    return source?.value;
};

/** `process.env` から Flocon で利用される環境変数を取得してパースします。ただし、ログに関する環境変数は対象外です。 */
class ServerConfigParser {
    public readonly [FLOCON_ADMIN]: Result<ReadonlyArray<string>> | undefined;
    public get admins() {
        return this[FLOCON_ADMIN];
    }

    public readonly [ACCESS_CONTROL_ALLOW_ORIGIN]: string | undefined;
    public get accessControlAllowOrigin() {
        return this[ACCESS_CONTROL_ALLOW_ORIGIN];
    }

    public readonly [AUTO_MIGRATION]: EmptyErrorResult<boolean> | undefined;
    public get autoMigration() {
        return this[AUTO_MIGRATION];
    }

    public readonly [DATABASE_URL]: string | undefined;
    public get databaseUrl() {
        return this[DATABASE_URL];
    }

    public readonly [EMBUPLOADER_COUNT_QUOTA]: EmptyErrorResult<number> | undefined;
    public get uploaderCountQuota() {
        return this[EMBUPLOADER_COUNT_QUOTA];
    }

    public readonly [EMBUPLOADER_ENABLED]: EmptyErrorResult<boolean> | undefined;
    public get uploaderEnabled() {
        return this[EMBUPLOADER_ENABLED];
    }

    public readonly [EMBUPLOADER_MAX_SIZE]: EmptyErrorResult<number> | undefined;
    public get uploaderMaxSize() {
        return this[EMBUPLOADER_MAX_SIZE];
    }

    public readonly [EMBUPLOADER_SIZE_QUOTA]: EmptyErrorResult<number> | undefined;
    public get uploaderSizeQuota() {
        return this[EMBUPLOADER_SIZE_QUOTA];
    }

    public readonly [EMBUPLOADER_PATH]: string | undefined;
    public get uploaderPath() {
        return this[EMBUPLOADER_PATH];
    }

    public readonly [ENTRY_PASSWORD]: EmptyErrorResult<EntryPasswordConfig> | undefined;
    public get entryPassword() {
        return this[ENTRY_PASSWORD];
    }

    public readonly [FIREBASE_ADMIN_SECRET]:
        | EmptyErrorResult<FirebaseAdminSecretConfig>
        | undefined;
    public get firebaseAdminSecret() {
        return this[FIREBASE_ADMIN_SECRET];
    }

    public readonly [FIREBASE_PROJECT_ID]: string | undefined;
    public get firebaseProjectId() {
        return this[FIREBASE_PROJECT_ID];
    }

    public readonly [FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL]:
        | EmptyErrorResult<boolean>
        | undefined;
    public get disableRateLimit() {
        return this[FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL];
    }

    public readonly [HEROKU]: EmptyErrorResult<boolean> | undefined;
    public get heroku() {
        return this[HEROKU];
    }

    public readonly [MYSQL]: EmptyErrorResult<MysqlDatabaseConfig> | undefined;
    public get mysql() {
        return this[MYSQL];
    }

    public readonly [ROOMHIST_COUNT]: EmptyErrorResult<number> | undefined;
    public get roomHistCount() {
        return this[ROOMHIST_COUNT];
    }

    public readonly [POSTGRESQL]: EmptyErrorResult<PostgresqlDatabaseConfig> | undefined;
    public get postgresql() {
        return this[POSTGRESQL];
    }

    public readonly [SQLITE]: EmptyErrorResult<SqliteDatabaseConfig> | undefined;
    public get sqlite() {
        return this[SQLITE];
    }

    public constructor(getValue: (key: string) => string | undefined) {
        const simpleProps = [ACCESS_CONTROL_ALLOW_ORIGIN, DATABASE_URL, EMBUPLOADER_PATH] as const;
        for (const prop of simpleProps) {
            this[prop] = getValue(prop);
        }

        const intProps = [
            EMBUPLOADER_COUNT_QUOTA,
            EMBUPLOADER_MAX_SIZE,
            EMBUPLOADER_SIZE_QUOTA,
            ROOMHIST_COUNT,
        ] as const;
        for (const prop of intProps) {
            const value = getValue(prop);
            if (value == null) {
                this[prop] = undefined;
                continue;
            }
            const intValue = filterInt(value.trim());
            if (intValue == null) {
                this[prop] = Result.error(undefined);
            } else {
                this[prop] = Result.ok(intValue);
            }
        }

        const booleanProps = [
            AUTO_MIGRATION,
            EMBUPLOADER_ENABLED,
            FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL,
            HEROKU,
        ] as const;
        for (const prop of booleanProps) {
            const value = getValue(prop);
            if (value == null) {
                this[prop] = undefined;
                continue;
            }
            const propValue = parseStringToBoolean(value);
            if (propValue.isError) {
                this[prop] = Result.error(undefined);
            } else {
                this[prop] = propValue;
            }
        }

        this[FLOCON_ADMIN] = ServerConfigParser.admin(getValue);
        this[FIREBASE_ADMIN_SECRET] = ServerConfigParser.firebaseAdminSecretProp(getValue);
        this[FIREBASE_PROJECT_ID] = ServerConfigParser.firebaseProjectId(getValue);
        this[ENTRY_PASSWORD] = ServerConfigParser.entryPasswordProp(getValue);
        this[MYSQL] = ServerConfigParser.mysqlProp(getValue);
        this[POSTGRESQL] = ServerConfigParser.postgresqlProp(getValue);
        this[SQLITE] = ServerConfigParser.sqliteProp(getValue);
    }

    private static admin(
        getValue: (key: string) => string | undefined,
    ): Result<ReadonlyArray<string>> {
        const adminValue = getValue(FLOCON_ADMIN);
        if (adminValue == null) {
            return Result.ok([]);
        }

        if (/[^a-zA-Z0-9 ,]/.test(adminValue)) {
            return Result.error(
                `${FLOCON_ADMIN} contains invalid characters. Valid characters are [^a-zA-Z0-9 ,]. Make sure firebase UIDs are set. To set multiple UIDs, separate them by commas.`,
            );
        }

        return Result.ok(
            adminValue
                .split(',')
                .map(s => s.trim())
                .filter(s => s !== ''),
        );
    }

    private static entryPasswordProp(
        getValue: (key: string) => string | undefined,
    ): Result<EntryPasswordConfig, undefined> | undefined {
        const entryPasswordObject = getValue(ENTRY_PASSWORD);
        if (entryPasswordObject == null) {
            return undefined;
        }
        const json = tryParseJSON(entryPasswordObject);
        if (json.isError) {
            return Result.error(undefined);
        }
        const j = entryPassword.safeParse(json.value);
        if (!j.success) {
            return Result.error(undefined);
        }
        if (j.data.type !== none) {
            return Result.ok(j.data);
        }
        return undefined;
    }

    private static firebaseAdminSecretProp(
        getValue: (key: string) => string | undefined,
    ): Result<FirebaseAdminSecretConfig, undefined> | undefined {
        const firebaseAdminSecretObject = getValue(FIREBASE_ADMIN_SECRET);
        if (firebaseAdminSecretObject == null) {
            return undefined;
        }
        const json = tryParseJSON(firebaseAdminSecretObject);
        if (json.isError) {
            return Result.error(undefined);
        }
        const j = firebaseAdminSecret.safeParse(json.value);
        if (!j.success) {
            return Result.error(undefined);
        }
        return Result.ok(j.data);
    }

    private static firebaseProjectId(
        getValue: (key: string) => string | undefined,
    ): string | undefined {
        const project_id = getValue(FIREBASE_PROJECT_ID);
        const projectid = getValue(FIREBASE_PROJECTID);
        if (project_id != null && projectid != null) {
            loggerRef.warn(
                `${FIREBASE_PROJECT_ID} と ${FIREBASE_PROJECTID} が両方ともセットされているため、${FIREBASE_PROJECT_ID} の値のみが参照されます。`,
            );
        }
        return project_id ?? projectid;
    }

    private static mysqlProp(
        getValue: (key: string) => string | undefined,
    ): Result<MysqlDatabaseConfig, undefined> | undefined {
        const text = getValue(MYSQL);
        if (text == null) {
            return undefined;
        }
        const result = parseMysqlDatabaseConfig(text);
        if (result.isError) {
            return Result.error(undefined);
        }
        return result;
    }

    private static postgresqlProp(
        getValue: (key: string) => string | undefined,
    ): Result<PostgresqlDatabaseConfig, undefined> | undefined {
        const text = getValue(POSTGRESQL);
        if (text == null) {
            return undefined;
        }
        const result = parsePostgresqlDatabaseConfig(text);
        if (result.isError) {
            return Result.error(undefined);
        }
        return result;
    }

    private static sqliteProp(
        getValue: (key: string) => string | undefined,
    ): Result<SqliteDatabaseConfig, undefined> | undefined {
        const text = getValue(SQLITE);
        if (text == null) {
            return undefined;
        }
        const result = parseSqliteDatabaseConfig(text);
        if (result.isError) {
            return Result.error(undefined);
        }
        return result;
    }

    private createServerConfigForMigration(): Result<ServerConfigForMigration> {
        if (this.heroku?.isError === true) {
            return parseErrorFromBoolean(HEROKU);
        }
        if (this.mysql?.isError === true) {
            return parseError(MYSQL);
        }
        if (this.sqlite?.isError === true) {
            return parseError(SQLITE);
        }
        if (this.postgresql?.isError === true) {
            return parseError(POSTGRESQL);
        }

        const result: ServerConfigForMigration = {
            databaseUrl: this.databaseUrl,
            heroku: ensureOk(this.heroku) ?? false,
            mysql: ensureOk(this.mysql),
            postgresql: ensureOk(this.postgresql),
            sqlite: ensureOk(this.sqlite),
        };
        return Result.ok(result);
    }

    private serverConfigForMigrationCache: Result<ServerConfigForMigration> | undefined;
    public get serverConfigForMigration() {
        if (this.serverConfigForMigrationCache == null) {
            this.serverConfigForMigrationCache = this.createServerConfigForMigration();
        }
        return this.serverConfigForMigrationCache;
    }

    private createServerConfig(): Result<ReadonlyDeep<ServerConfig>> {
        if (this.admins?.isError === true) {
            return this.admins;
        }
        if (this.autoMigration?.isError === true) {
            return parseErrorFromBoolean(AUTO_MIGRATION);
        }
        if (this.disableRateLimit?.isError === true) {
            return parseErrorFromBoolean(FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL);
        }
        if (this.entryPassword?.isError === true) {
            return parseError(ENTRY_PASSWORD);
        }
        if (this.firebaseAdminSecret?.isError === true) {
            return parseError(FIREBASE_ADMIN_SECRET);
        }
        if (this.heroku?.isError === true) {
            return parseErrorFromBoolean(HEROKU);
        }
        if (this.mysql?.isError === true) {
            return parseError(MYSQL);
        }
        if (this.postgresql?.isError === true) {
            return parseError(POSTGRESQL);
        }
        if (this.roomHistCount?.isError === true) {
            return parseError(ROOMHIST_COUNT);
        }
        if (this.sqlite?.isError === true) {
            return parseError(SQLITE);
        }

        if (this.uploaderCountQuota?.isError === true) {
            return parseErrorFromInteger(EMBUPLOADER_COUNT_QUOTA);
        }
        if (this.uploaderEnabled?.isError === true) {
            return parseErrorFromBoolean(EMBUPLOADER_ENABLED);
        }
        if (this.uploaderSizeQuota?.isError === true) {
            return parseErrorFromInteger(EMBUPLOADER_SIZE_QUOTA);
        }
        if (this.uploaderMaxSize?.isError === true) {
            return parseErrorFromInteger(EMBUPLOADER_MAX_SIZE);
        }

        const uploaderConfig: UploaderConfig = {
            enabled: ensureOk(this.uploaderEnabled) ?? false,
            directory: this.uploaderPath,
            countQuota: ensureOk(this.uploaderCountQuota),
            sizeQuota: ensureOk(this.uploaderSizeQuota),
            maxFileSize: ensureOk(this.uploaderMaxSize),
        };
        const result: ServerConfig = {
            accessControlAllowOrigin: this.accessControlAllowOrigin,
            admins: ensureOk(this.admins) ?? [],
            autoMigration: ensureOk(this.autoMigration) ?? false,
            databaseUrl: this.databaseUrl,
            entryPassword: ensureOk(this.entryPassword),
            firebaseAdminSecret: ensureOk(this.firebaseAdminSecret),
            firebaseProjectId: this.firebaseProjectId,
            heroku: ensureOk(this.heroku) ?? false,
            mysql: ensureOk(this.mysql),
            roomHistCount: ensureOk(this.roomHistCount),
            postgresql: ensureOk(this.postgresql),
            sqlite: ensureOk(this.sqlite),
            uploader: uploaderConfig,
            disableRateLimitExperimental: ensureOk(this.disableRateLimit) ?? false,
        };
        return Result.ok(result);
    }

    private serverConfigCache: Result<ServerConfig> | undefined;
    public get serverConfig() {
        if (this.serverConfigCache == null) {
            this.serverConfigCache = this.createServerConfig();
        }
        return this.serverConfigCache;
    }
}

@Injectable()
export class ServerConfigService {
    #serverConfigParser: ServerConfigParser;
    constructor(configService: ConfigService) {
        this.#serverConfigParser = new ServerConfigParser(key =>
            configService.get<string | undefined>(key),
        );
    }

    getValue(): Result<ServerConfig> {
        return this.#serverConfigParser.serverConfig;
    }

    getValueForce(): ServerConfig {
        const result = this.getValue();
        if (result.isError) {
            throw new Error('serverConfig has errors. ' + result.error);
        }
        return result.value;
    }

    getValueForMigration(): Result<ServerConfigForMigration> {
        return this.#serverConfigParser.serverConfigForMigration;
    }

    getValueForMigrationForce(): ServerConfigForMigration {
        const result = this.getValueForMigration();
        if (result.isError) {
            throw new Error('serverConfigForMigration has errors. ' + result.error);
        }
        return result.value;
    }
}
