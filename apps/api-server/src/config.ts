import {
    entryPassword,
    EntryPasswordConfig,
    firebaseAdminSecret,
    FirebaseAdminSecretConfig,
    none,
    postgresqlDatabase,
    PostgresqlDatabaseConfig,
    ServerConfig,
    ServerConfigForMigration,
    sqliteDatabase,
    SqliteDatabaseConfig,
    UploaderConfig,
} from './configType';
import * as E from 'fp-ts/Either';
import { formatValidationErrors } from './utils/io-ts-reporters';
import {
    ACCESS_CONTROL_ALLOW_ORIGIN,
    AUTO_MIGRATION,
    FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL,
    EMBUPLOADER_COUNT_QUOTA,
    EMBUPLOADER_MAX_SIZE,
    EMBUPLOADER_PATH,
    EMBUPLOADER_SIZE_QUOTA,
    EMBUPLOADER_ENABLED,
    ENTRY_PASSWORD,
    POSTGRESQL,
    SQLITE,
    loadDotenv,
    FIREBASE_ADMIN_SECRET,
    ROOMHIST_COUNT,
    FIREBASE_PROJECTID,
    HEROKU,
    DATABASE_URL,
} from './env';
import { filterInt, isTruthyString } from '@flocon-trpg/utils';
import { Result, Error } from '@kizahasi/result';

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

const omitErrorMessage = <T, U>(
    source: Result<T, U> | undefined
): EmptyErrorResult<T> | undefined => {
    if (source?.isError) {
        return Result.error(undefined);
    }
    return source;
};

// 環境変数の値に記述ミスがあった場合は続行ではなく停止すべきであるため、ガードとしてこの関数を定義している。
// コードに問題がなければ、この関数でthrowされることはない。
const ensureOk = <T, U>(source: Result<T, U> | undefined): T | undefined => {
    if (source?.isError === true) {
        throw new Error('Assertion failed: Expected ok, but actually error');
    }
    return source?.value;
};

export class ServerConfigBuilder {
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

        this[FIREBASE_ADMIN_SECRET] = omitErrorMessage(
            ServerConfigBuilder.firebaseAdminSecretProp(env)
        );
        this[ENTRY_PASSWORD] = omitErrorMessage(ServerConfigBuilder.entryPasswordProp(env));
        this[POSTGRESQL] = omitErrorMessage(ServerConfigBuilder.postgresqlProp(env));
        this[SQLITE] = omitErrorMessage(ServerConfigBuilder.sqliteProp(env));
    }

    private static entryPasswordProp(
        env: typeof process.env
    ): Result<EntryPasswordConfig> | undefined {
        const entryPasswordObject = env[ENTRY_PASSWORD];
        if (entryPasswordObject == null) {
            return undefined;
        }
        const json = tryParseJSON(entryPasswordObject);
        if (json.isError) {
            return json;
        }
        const j = E.mapLeft(formatValidationErrors)(entryPassword.decode(json.value));
        if (j._tag === 'Left') {
            return Result.error(j.left);
        }
        if (j.right.type !== none) {
            return Result.ok(j.right);
        }
        return undefined;
    }

    private static firebaseAdminSecretProp(
        env: typeof process.env
    ): Result<FirebaseAdminSecretConfig> | undefined {
        const firebaseAdminSecretObject = env[FIREBASE_ADMIN_SECRET];
        if (firebaseAdminSecretObject == null) {
            return undefined;
        }
        const json = tryParseJSON(firebaseAdminSecretObject);
        if (json.isError) {
            return json;
        }
        const j = E.mapLeft(formatValidationErrors)(firebaseAdminSecret.decode(json.value));
        if (j._tag === 'Left') {
            return Result.error(j.left);
        }
        return Result.ok(j.right);
    }

    private static sqliteProp(env: typeof process.env): Result<SqliteDatabaseConfig> | undefined {
        const sqliteObject = env[SQLITE];
        if (sqliteObject == null) {
            return undefined;
        }
        const json = tryParseJSON(sqliteObject);
        if (json.isError) {
            return json;
        }
        const j = E.mapLeft(formatValidationErrors)(sqliteDatabase.decode(json.value));
        if (j._tag === 'Left') {
            return Result.error(j.left);
        }
        return Result.ok(j.right);
    }

    private static postgresqlProp(
        env: typeof process.env
    ): Result<PostgresqlDatabaseConfig> | undefined {
        const postgresqlObject = env[POSTGRESQL];
        if (postgresqlObject == null) {
            return undefined;
        }
        const json = tryParseJSON(postgresqlObject);
        if (json.isError) {
            return json;
        }
        const j = E.mapLeft(formatValidationErrors)(postgresqlDatabase.decode(json.value));
        if (j._tag === 'Left') {
            return Result.error(j.left);
        }
        return Result.ok(j.right);
    }

    private parseError(envKey: string): Error<string> {
        return Result.error(`${envKey} の値の記入方法が誤っています。`);
    }

    private createServerConfigForMigration(): Result<ServerConfigForMigration> {
        if (this.sqlite?.isError === true) {
            return this.parseError(SQLITE);
        }
        if (this.postgresql?.isError === true) {
            return this.parseError(POSTGRESQL);
        }

        const result: ServerConfigForMigration = {
            herokuDatabaseUrl: this.databaseUrl,
            heroku: this.heroku ?? false,
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
        if (this.entryPassword?.isError === true) {
            return this.parseError(ENTRY_PASSWORD);
        }
        if (this.firebaseAdminSecret?.isError === true) {
            return this.parseError(FIREBASE_ADMIN_SECRET);
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
        const result: ServerConfig = {
            accessControlAllowOrigin: this.accessControlAllowOrigin,
            admins: [],
            autoMigration: this.autoMigration ?? false,
            herokuDatabaseUrl: this.databaseUrl,
            entryPassword: ensureOk(this.entryPassword),
            firebaseAdminSecret: ensureOk(this.firebaseAdminSecret),
            firebaseProjectId,
            heroku: this.heroku ?? false,
            roomHistCount: ensureOk(this.roomHistCount),
            postgresql: ensureOk(this.postgresql),
            sqlite: ensureOk(this.sqlite),
            uploader: uploaderConfig,
            disableRateLimitExperimental: this.disableRateLimit ?? false,
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

// const parseJSON = ({ json, name }: { json: string; name: string }): unknown => {
//     try {
//         return JSON.parse(json);
//     } catch {
//         throw new Error(`Could not parse ${name} JSON`);
//     }
// };

// const filterNullableInt = (source: string | null | undefined) => {
//     if (source == null) {
//         return source;
//     }
//     return filterInt(source);
// };

// const loadServerConfig = ({
//     databaseArg,
//     ignoreFirebaseAdminSecret,
//     ignoreEntryPassword,
// }: {
//     databaseArg: typeof postgresql | typeof sqlite | null;
//     ignoreFirebaseAdminSecret: boolean;
//     ignoreEntryPassword: boolean;
// }): ServerConfig => {
//     let firebaseAdminSecretConfig: FirebaseAdminSecretConfig | undefined;
//     if (ignoreFirebaseAdminSecret) {
//         firebaseAdminSecretConfig = undefined;
//     } else {
//         const firebaseAdminSecretObject = process.env[FIREBASE_ADMIN_SECRET];
//         if (firebaseAdminSecretObject == null || firebaseAdminSecretObject.trim() === '') {
//             console.log(`${FIREBASE_ADMIN_SECRET} is not found and will be ignored.`);
//         } else {
//             const json = parseJSON({
//                 json: firebaseAdminSecretObject,
//                 name: FIREBASE_ADMIN_SECRET,
//             });
//             const j = firebaseAdminSecret.decode(json);
//             if (j._tag === 'Left') {
//                 throw new Error(
//                     `An error occured while decoding ${FIREBASE_ADMIN_SECRET} JSON (for security reasons, detailed error messages are not shown).`
//                 );
//             }
//             firebaseAdminSecretConfig = j.right;
//         }
//     }

//     let entryPasswordConfig: EntryPasswordConfig | undefined;
//     if (!ignoreEntryPassword) {
//         const entryPasswordObject = process.env[ENTRY_PASSWORD];
//         if (entryPasswordObject == null) {
//             throw new Error(`${ENTRY_PASSWORD} is required but not found.`);
//         } else {
//             const json = parseJSON({ json: entryPasswordObject, name: ENTRY_PASSWORD });

//             const j = E.mapLeft(formatValidationErrors)(entryPassword.decode(json));
//             if (j._tag === 'Left') {
//                 throw new Error(j.left);
//             }
//             if (j.right.type === none) {
//                 entryPasswordConfig = undefined;
//             } else {
//                 entryPasswordConfig = j.right;
//             }
//         }
//     }

//     let databaseConfig: DatabaseConfig;
//     {
//         const psqlObject = process.env[POSTGRESQL];
//         const sqliteObject = process.env[SQLITE];

//         let psqlConfig: PostgresqlDatabaseConfig | null;
//         if (psqlObject == null) {
//             psqlConfig = null;
//         } else {
//             const json = parseJSON({ json: psqlObject, name: POSTGRESQL });
//             const j = E.mapLeft(formatValidationErrors)(postgresqlDatabase.decode(json));
//             if (j._tag === 'Left') {
//                 throw new Error(j.left);
//             }
//             psqlConfig = j.right;
//         }

//         let sqliteConfig: SqliteDatabaseConfig | null;
//         if (sqliteObject == null) {
//             sqliteConfig = null;
//         } else {
//             const json = parseJSON({ json: sqliteObject, name: SQLITE });
//             const j = E.mapLeft(formatValidationErrors)(sqliteDatabase.decode(json));
//             if (j._tag === 'Left') {
//                 throw new Error(j.left);
//             }
//             sqliteConfig = j.right;
//         }

//         switch (databaseArg) {
//             case null:
//                 databaseConfig = (() => {
//                     if (sqliteConfig != null) {
//                         if (psqlConfig != null) {
//                             throw new Error(
//                                 `Because both ${POSTGRESQL} and ${SQLITE} are set, you must use --db parameter to specify a database to use.`
//                             );
//                         }
//                         return {
//                             ...sqliteConfig,
//                             driverOptions: sqliteConfig.driverOptions,
//                             __type: sqlite,
//                         } as const;
//                     }
//                     if (psqlConfig == null) {
//                         throw new Error(`${POSTGRESQL} or ${SQLITE} is required.`);
//                     }
//                     return {
//                         ...psqlConfig,
//                         driverOptions: psqlConfig.driverOptions,
//                         dbName: psqlConfig.dbName,
//                         __type: postgresql,
//                     } as const;
//                 })();
//                 break;
//             case sqlite: {
//                 if (sqliteConfig == null) {
//                     throw new Error(`${SQLITE} is required.`);
//                 }
//                 databaseConfig = {
//                     ...sqliteConfig,
//                     driverOptions: sqliteConfig.driverOptions,
//                     __type: sqlite,
//                 };
//                 break;
//             }
//             case postgresql: {
//                 if (psqlConfig == null) {
//                     throw new Error(`${POSTGRESQL} is required.`);
//                 }
//                 databaseConfig = {
//                     ...psqlConfig,
//                     driverOptions: psqlConfig.driverOptions,
//                     dbName: psqlConfig.dbName,
//                     __type: postgresql,
//                 };
//                 break;
//             }
//         }
//     }

//     return {
//         admins: [],
//         database: databaseConfig,
//         entryPassword: entryPasswordConfig,
//         firebaseAdminSecret: firebaseAdminSecretConfig,
//         uploader: {
//             enabled: isTruthyString(process.env[EMBUPLOADER_ENABLED]),
//             directory: process.env[EMBUPLOADER_PATH],
//             countQuota: filterNullableInt(process.env[EMBUPLOADER_COUNT_QUOTA]) ?? undefined,
//             sizeQuota: filterNullableInt(process.env[EMBUPLOADER_SIZE_QUOTA]) ?? undefined,
//             maxFileSize: filterNullableInt(process.env[EMBUPLOADER_MAX_SIZE]) ?? undefined,
//         },
//         roomHistCount: filterNullableInt(process.env[ROOMHIST_COUNT]) ?? undefined,
//         autoMigration: isTruthyString(process.env[AUTO_MIGRATION]),
//         accessControlAllowOrigin: process.env[ACCESS_CONTROL_ALLOW_ORIGIN],
//         disableRateLimitExperimental:
//             process.env[FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL] === 'true',
//     };
// };

// let firebaseConfig: FirebaseConfig | undefined;

// export const loadFirebaseConfig = (): FirebaseConfig => {
//     if (firebaseConfig == null) {
//         firebaseConfig = loadFirebaseConfigCore();
//     }
//     return firebaseConfig;
// };

// let serverConfigAsMainCache: ServerConfig | null = null;
// export const loadServerConfigAsMain = async (): Promise<ServerConfig> => {
//     if (serverConfigAsMainCache == null) {
//         serverConfigAsMainCache = loadServerConfig({
//             databaseArg: (await loadAsMain()).db ?? null,
//             ignoreEntryPassword: false,
//             ignoreFirebaseAdminSecret: false,
//         });
//     }
//     return serverConfigAsMainCache;
// };

// let serverConfigAsCheckCache: ServerConfig | null = null;
// export const loadServerConfigAsCheck = async (): Promise<ServerConfig> => {
//     if (serverConfigAsCheckCache == null) {
//         serverConfigAsCheckCache = loadServerConfig({
//             databaseArg: (await loadAsMain()).db ?? null,
//             ignoreEntryPassword: true,
//             ignoreFirebaseAdminSecret: true,
//         });
//     }
//     return serverConfigAsCheckCache;
// };

// let serverConfigAsMigrationCreateCache: ServerConfig | null = null;
// export const loadServerConfigAsMigrationCreate = async (): Promise<ServerConfig> => {
//     if (serverConfigAsMigrationCreateCache == null) {
//         serverConfigAsMigrationCreateCache = loadServerConfig({
//             databaseArg: (await loadMigrationCreate()).db ?? null,
//             ignoreEntryPassword: true,
//             ignoreFirebaseAdminSecret: true,
//         });
//     }
//     return serverConfigAsMigrationCreateCache;
// };

// let serverConfigAsMigrationUpCache: ServerConfig | null = null;
// export const loadServerConfigAsMigrationUp = async (): Promise<ServerConfig> => {
//     if (serverConfigAsMigrationUpCache == null) {
//         serverConfigAsMigrationUpCache = loadServerConfig({
//             databaseArg: (await loadMigrationUp()).db ?? null,
//             ignoreEntryPassword: true,
//             ignoreFirebaseAdminSecret: true,
//         });
//     }
//     return serverConfigAsMigrationUpCache;
// };

// let serverConfigAsMigrationDownCache: (ServerConfig & { count: number }) | null = null;
// export const loadServerConfigAsMigrationDown = async (): Promise<
//     ServerConfig & { count: number }
// > => {
//     if (serverConfigAsMigrationDownCache == null) {
//         const loaded = await loadMigrationDown();
//         serverConfigAsMigrationDownCache = {
//             ...loadServerConfig({
//                 databaseArg: loaded.db ?? null,
//                 ignoreEntryPassword: true,
//                 ignoreFirebaseAdminSecret: true,
//             }),
//             count: loaded.count,
//         };
//     }
//     return serverConfigAsMigrationDownCache;
// };
