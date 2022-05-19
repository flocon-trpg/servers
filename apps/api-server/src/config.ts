import {
    EntryPasswordConfig,
    FirebaseAdminSecretConfig,
    MysqlDatabaseConfig,
    PostgresqlDatabaseConfig,
    ServerConfig,
    ServerConfigForMigration,
    SqliteDatabaseConfig,
    UploaderConfig,
    entryPassword,
    firebaseAdminSecret,
    mysqlDatabase,
    none,
    postgresqlDatabase,
    sqliteDatabase,
} from './configType';
import * as E from 'fp-ts/Either';
import { formatValidationErrors } from './utils/io-ts-reporters';
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
    FLOCON_ADMIN,
    FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL,
    HEROKU,
    MYSQL,
    POSTGRESQL,
    ROOMHIST_COUNT,
    SQLITE,
    loadDotenv,
} from './env';
import { filterInt, isTruthyString } from '@flocon-trpg/utils';
import { Error, Result } from '@kizahasi/result';

loadDotenv();

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

// パースなどに失敗したかどうかは確認できるようにしたいがエラーメッセージを表示するとミスで重要な情報が漏れる可能性があるため、エラーメッセージだけ除去している
type EmptyErrorResult<T> = Result<T, undefined>;

// 環境変数の値に記述ミスがあった場合は続行ではなく停止すべきであるため、ガードとしてこの関数を定義している。
// コードに問題がなければ、この関数でthrowされることはない。
const ensureOk = <T, U>(source: Result<T, U> | undefined): T | undefined => {
    if (source?.isError === true) {
        throw new Error('Assertion failed: Expected ok, but actually error');
    }
    return source?.value;
};

export class ServerConfigBuilder {
    public readonly [FLOCON_ADMIN]: Result<ReadonlyArray<string>> | undefined;
    public get admins() {
        return this[FLOCON_ADMIN];
    }

    public readonly [ACCESS_CONTROL_ALLOW_ORIGIN]: string | undefined;
    public get accessControlAllowOrigin() {
        return this[ACCESS_CONTROL_ALLOW_ORIGIN];
    }

    public readonly [AUTO_MIGRATION]: boolean | undefined;
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

    public readonly [EMBUPLOADER_ENABLED]: boolean | undefined;
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

    // GCEなどといった、Google Admin SDKのデータが自動的に取得できる環境ではFIREBASE_ADMIN_SECRETではなくこれを用いるほうが簡便であるため定義している
    public readonly [FIREBASE_PROJECTID]: string | undefined;
    public get firebaseProjectId() {
        return this[FIREBASE_PROJECTID];
    }

    public readonly [FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL]: boolean | undefined;
    public get disableRateLimit() {
        return this[FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL];
    }

    public readonly [HEROKU]: boolean | undefined;
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

    public constructor(env: typeof process.env) {
        const simpleProps = [
            ACCESS_CONTROL_ALLOW_ORIGIN,
            DATABASE_URL,
            EMBUPLOADER_PATH,
            FIREBASE_PROJECTID,
        ] as const;
        for (const prop of simpleProps) {
            this[prop] = env[prop];
        }

        const intProps = [
            EMBUPLOADER_COUNT_QUOTA,
            EMBUPLOADER_MAX_SIZE,
            EMBUPLOADER_SIZE_QUOTA,
            ROOMHIST_COUNT,
        ] as const;
        for (const prop of intProps) {
            const value = env[prop];
            if (value == null) {
                this[prop] = undefined;
                continue;
            }
            const intValue = filterInt(value);
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
            const value = env[prop];
            if (value == null) {
                this[prop] = undefined;
                continue;
            }
            this[prop] = isTruthyString(value);
        }

        this[FLOCON_ADMIN] = ServerConfigBuilder.admin(env);
        this[FIREBASE_ADMIN_SECRET] = ServerConfigBuilder.firebaseAdminSecretProp(env);
        this[ENTRY_PASSWORD] = ServerConfigBuilder.entryPasswordProp(env);
        this[MYSQL] = ServerConfigBuilder.mysqlProp(env);
        this[POSTGRESQL] = ServerConfigBuilder.postgresqlProp(env);
        this[SQLITE] = ServerConfigBuilder.sqliteProp(env);
    }

    private static admin(env: typeof process.env): Result<ReadonlyArray<string>> {
        const adminValue = env[FLOCON_ADMIN];
        if (adminValue == null) {
            return Result.ok([]);
        }

        if (/[^a-zA-Z0-9 ,]/.test(adminValue)) {
            return Result.error(
                `${FLOCON_ADMIN} contains invalid characters. Valid characters are [^a-zA-Z0-9 ,]. Make sure firebase UIDs are set. To set multiple UIDs, separate them by commas.`
            );
        }

        return Result.ok(
            adminValue
                .split(',')
                .map(s => s.trim())
                .filter(s => s !== '')
        );
    }

    private static entryPasswordProp(
        env: typeof process.env
    ): Result<EntryPasswordConfig, undefined> | undefined {
        const entryPasswordObject = env[ENTRY_PASSWORD];
        if (entryPasswordObject == null) {
            return undefined;
        }
        const json = tryParseJSON(entryPasswordObject);
        if (json.isError) {
            return Result.error(undefined);
        }
        const j = E.mapLeft(formatValidationErrors)(entryPassword.decode(json.value));
        if (j._tag === 'Left') {
            return Result.error(undefined);
        }
        if (j.right.type !== none) {
            return Result.ok(j.right);
        }
        return undefined;
    }

    private static firebaseAdminSecretProp(
        env: typeof process.env
    ): Result<FirebaseAdminSecretConfig, undefined> | undefined {
        const firebaseAdminSecretObject = env[FIREBASE_ADMIN_SECRET];
        if (firebaseAdminSecretObject == null) {
            return undefined;
        }
        const json = tryParseJSON(firebaseAdminSecretObject);
        if (json.isError) {
            return Result.error(undefined);
        }
        const j = E.mapLeft(formatValidationErrors)(firebaseAdminSecret.decode(json.value));
        if (j._tag === 'Left') {
            return Result.error(undefined);
        }
        return Result.ok(j.right);
    }

    private static mysqlProp(
        env: typeof process.env
    ): Result<MysqlDatabaseConfig, undefined> | undefined {
        const mysqlObject = env[MYSQL];
        if (mysqlObject == null) {
            return undefined;
        }
        const json = tryParseJSON(mysqlObject);
        if (json.isError) {
            return Result.error(undefined);
        }
        const j = E.mapLeft(formatValidationErrors)(mysqlDatabase.decode(json.value));
        if (j._tag === 'Left') {
            return Result.error(undefined);
        }
        return Result.ok(j.right);
    }

    private static postgresqlProp(
        env: typeof process.env
    ): Result<PostgresqlDatabaseConfig, undefined> | undefined {
        const postgresqlObject = env[POSTGRESQL];
        if (postgresqlObject == null) {
            return undefined;
        }
        const json = tryParseJSON(postgresqlObject);
        if (json.isError) {
            return Result.error(undefined);
        }
        const j = E.mapLeft(formatValidationErrors)(postgresqlDatabase.decode(json.value));
        if (j._tag === 'Left') {
            return Result.error(undefined);
        }
        return Result.ok(j.right);
    }

    private static sqliteProp(
        env: typeof process.env
    ): Result<SqliteDatabaseConfig, undefined> | undefined {
        const sqliteObject = env[SQLITE];
        if (sqliteObject == null) {
            return undefined;
        }
        const json = tryParseJSON(sqliteObject);
        if (json.isError) {
            return Result.error(undefined);
        }
        const j = E.mapLeft(formatValidationErrors)(sqliteDatabase.decode(json.value));
        if (j._tag === 'Left') {
            return Result.error(undefined);
        }
        return Result.ok(j.right);
    }

    private parseError(envKey: string): Error<string> {
        // TODO: 英語でも出力する（ADMINのエラーメッセージは英語なため整合性が取れていない）
        return Result.error(`${envKey} の値の記入方法が誤っています。`);
    }

    private createServerConfigForMigration(): Result<ServerConfigForMigration> {
        if (this.mysql?.isError === true) {
            return this.parseError(MYSQL);
        }
        if (this.sqlite?.isError === true) {
            return this.parseError(SQLITE);
        }
        if (this.postgresql?.isError === true) {
            return this.parseError(POSTGRESQL);
        }

        const result: ServerConfigForMigration = {
            herokuDatabaseUrl: this.databaseUrl,
            heroku: this.heroku ?? false,
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

    private createServerConfig(): Result<ServerConfig> {
        if (this.admins?.isError === true) {
            return this.admins;
        }
        if (this.entryPassword?.isError === true) {
            return this.parseError(ENTRY_PASSWORD);
        }
        if (this.firebaseAdminSecret?.isError === true) {
            return this.parseError(FIREBASE_ADMIN_SECRET);
        }
        if (this.mysql?.isError === true) {
            return this.parseError(MYSQL);
        }
        if (this.postgresql?.isError === true) {
            return this.parseError(POSTGRESQL);
        }
        if (this.roomHistCount?.isError === true) {
            return this.parseError(ROOMHIST_COUNT);
        }
        if (this.sqlite?.isError === true) {
            return this.parseError(SQLITE);
        }

        if (this.uploaderCountQuota?.isError === true) {
            return this.parseError(EMBUPLOADER_COUNT_QUOTA);
        }
        if (this.uploaderSizeQuota?.isError === true) {
            return this.parseError(EMBUPLOADER_SIZE_QUOTA);
        }
        if (this.uploaderMaxSize?.isError === true) {
            return this.parseError(EMBUPLOADER_MAX_SIZE);
        }

        let firebaseProjectId: string | undefined = undefined;
        if (this.firebaseProjectId == null) {
            firebaseProjectId = this.firebaseAdminSecret?.value?.project_id;
        } else {
            firebaseProjectId = this.firebaseProjectId;
        }

        if (firebaseProjectId == null) {
            return Result.error(
                `FirebaseのプロジェクトIDを取得できませんでした。${FIREBASE_PROJECTID} にプロジェクトIDをセットしてください。`
            );
        }

        const uploaderConfig: UploaderConfig = {
            enabled: this.uploaderEnabled ?? false,
            directory: this.uploaderPath,
            countQuota: ensureOk(this.uploaderCountQuota),
            sizeQuota: ensureOk(this.uploaderSizeQuota),
            maxFileSize: ensureOk(this.uploaderMaxSize),
        };
        const nonFrozenResult: ServerConfig = {
            accessControlAllowOrigin: this.accessControlAllowOrigin,
            admins: ensureOk(this.admins) ?? [],
            autoMigration: this.autoMigration ?? false,
            herokuDatabaseUrl: this.databaseUrl,
            entryPassword: ensureOk(this.entryPassword),
            firebaseAdminSecret: ensureOk(this.firebaseAdminSecret),
            firebaseProjectId,
            heroku: this.heroku ?? false,
            mysql: ensureOk(this.mysql),
            roomHistCount: ensureOk(this.roomHistCount),
            postgresql: ensureOk(this.postgresql),
            sqlite: ensureOk(this.sqlite),
            uploader: uploaderConfig,
            disableRateLimitExperimental: this.disableRateLimit ?? false,
        };
        const result = Object.freeze(nonFrozenResult);
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
