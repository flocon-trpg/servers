import { FirebaseConfig, firebaseConfig as firebaseConfigIo } from '@flocon-trpg/core';
import {
    always,
    DatabaseConfig,
    entryPassword,
    EntryPasswordConfig,
    firebaseAdminSecret,
    FirebaseAdminSecretConfig,
    none,
    postgresql,
    postgresqlDatabase,
    PostgresqlDatabaseConfig,
    ServerConfig,
    sqliteDatabase,
    SqliteDatabaseConfig,
} from './configType';
import {
    loadAsMain,
    loadMigrationCreate,
    loadMigrationDown,
    loadMigrationUp,
    sqlite,
} from './utils/commandLineArgs';
import * as E from 'fp-ts/Either';
import { formatValidationErrors } from './utils/io-ts-reporters';
import {
    ACCESS_CONTROL_ALLOW_ORIGIN,
    FLOCON_API_AUTO_MIGRATION,
    FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL,
    EMBUPLOADER_COUNT_QUOTA,
    EMBUPLOADER_MAX_FILE_SIZE,
    EMBUPLOADER_PATH,
    EMBUPLOADER_SIZE_QUOTA,
    EMBUPLOADER_ENABLED,
    ENTRY_PASSWORD,
    POSTGRESQL,
    SQLITE,
    loadDotenv,
    FIREBASE_ADMIN_SECRET,
    NEXT_PUBLIC_FIREBASE_CONFIG,
    FIREBASE_CONFIG,
} from './env';
import { filterInt, isTruthyString } from '@flocon-trpg/utils';

loadDotenv();

const parseJSON = ({ json, name }: { json: string; name: string }): unknown => {
    try {
        return JSON.parse(json);
    } catch {
        throw new Error(`Could not parse ${name} JSON`);
    }
};

const filterNullableInt = (source: string | null | undefined) => {
    if (source == null) {
        return source;
    }
    return filterInt(source);
};

const loadFirebaseConfigCore = (): FirebaseConfig => {
    let env = process.env[FIREBASE_CONFIG];
    let name = FIREBASE_CONFIG;
    if (env == null) {
        env = process.env[NEXT_PUBLIC_FIREBASE_CONFIG];
        name = NEXT_PUBLIC_FIREBASE_CONFIG;
    }
    if (env == null) {
        throw new Error(
            `Firebase config is not found. Set ${NEXT_PUBLIC_FIREBASE_CONFIG} or ${FIREBASE_CONFIG} environment variable.`
        );
    }
    const json = parseJSON({ json: env, name });

    const decoded = E.mapLeft(formatValidationErrors)(firebaseConfigIo.decode(json));
    if (decoded._tag === 'Left') {
        throw new Error(decoded.left);
    }
    return decoded.right;
};

const loadServerConfig = ({
    databaseArg,
    ignoreFirebaseAdminSecret,
    ignoreEntryPassword,
}: {
    databaseArg: typeof postgresql | typeof sqlite | null;
    ignoreFirebaseAdminSecret: boolean;
    ignoreEntryPassword: boolean;
}): ServerConfig => {
    let firebaseAdminSecretConfig: FirebaseAdminSecretConfig | undefined;
    if (ignoreFirebaseAdminSecret) {
        firebaseAdminSecretConfig = undefined;
    } else {
        const firebaseAdminSecretObject = process.env[FIREBASE_ADMIN_SECRET];
        if (firebaseAdminSecretObject == null || firebaseAdminSecretObject.trim() === '') {
            console.log(`${FIREBASE_ADMIN_SECRET} is not found and will be ignored.`);
        } else {
            const json = parseJSON({
                json: firebaseAdminSecretObject,
                name: FIREBASE_ADMIN_SECRET,
            });
            const j = firebaseAdminSecret.decode(json);
            if (j._tag === 'Left') {
                throw new Error(
                    `An error occured while decoding ${FIREBASE_ADMIN_SECRET} JSON (for security reasons, detailed error messages are not shown).`
                );
            }
            firebaseAdminSecretConfig = j.right;
        }
    }

    let entryPasswordConfig: EntryPasswordConfig | undefined;
    if (!ignoreEntryPassword) {
        const entryPasswordObject = process.env[ENTRY_PASSWORD];
        if (entryPasswordObject == null) {
            throw new Error(`${ENTRY_PASSWORD} is required but not found.`);
        } else {
            const json = parseJSON({ json: entryPasswordObject, name: ENTRY_PASSWORD });

            const j = E.mapLeft(formatValidationErrors)(entryPassword.decode(json));
            if (j._tag === 'Left') {
                throw new Error(j.left);
            }
            if (j.right.type === none) {
                entryPasswordConfig = undefined;
            } else {
                entryPasswordConfig = j.right;
            }
        }
    }

    let databaseConfig: DatabaseConfig;
    {
        const psqlObject = process.env[POSTGRESQL];
        const sqliteObject = process.env[SQLITE];

        let psqlConfig: PostgresqlDatabaseConfig | null;
        if (psqlObject == null) {
            psqlConfig = null;
        } else {
            const json = parseJSON({ json: psqlObject, name: POSTGRESQL });
            const j = E.mapLeft(formatValidationErrors)(postgresqlDatabase.decode(json));
            if (j._tag === 'Left') {
                throw new Error(j.left);
            }
            psqlConfig = j.right;
        }

        let sqliteConfig: SqliteDatabaseConfig | null;
        if (sqliteObject == null) {
            sqliteConfig = null;
        } else {
            const json = parseJSON({ json: sqliteObject, name: SQLITE });
            const j = E.mapLeft(formatValidationErrors)(sqliteDatabase.decode(json));
            if (j._tag === 'Left') {
                throw new Error(j.left);
            }
            sqliteConfig = j.right;
        }

        switch (databaseArg) {
            case null:
                databaseConfig = (() => {
                    if (sqliteConfig != null) {
                        if (psqlConfig != null) {
                            throw new Error(
                                `Because both ${POSTGRESQL} and ${SQLITE} are set, you must use --db parameter to specify a database to use.`
                            );
                        }
                        return {
                            ...sqliteConfig,
                            driverOptions: sqliteConfig.driverOptions,
                            __type: sqlite,
                        } as const;
                    }
                    if (psqlConfig == null) {
                        throw new Error(`${POSTGRESQL} or ${SQLITE} is required.`);
                    }
                    return {
                        ...psqlConfig,
                        driverOptions: psqlConfig.driverOptions,
                        dbName: psqlConfig.dbName,
                        __type: postgresql,
                    } as const;
                })();
                break;
            case sqlite: {
                if (sqliteConfig == null) {
                    throw new Error(`${SQLITE} is required.`);
                }
                databaseConfig = {
                    ...sqliteConfig,
                    driverOptions: sqliteConfig.driverOptions,
                    __type: sqlite,
                };
                break;
            }
            case postgresql: {
                if (psqlConfig == null) {
                    throw new Error(`${POSTGRESQL} is required.`);
                }
                databaseConfig = {
                    ...psqlConfig,
                    driverOptions: psqlConfig.driverOptions,
                    dbName: psqlConfig.dbName,
                    __type: postgresql,
                };
                break;
            }
        }
    }

    return {
        admins: [],
        database: databaseConfig,
        entryPassword: entryPasswordConfig,
        firebaseAdminSecret: firebaseAdminSecretConfig,
        uploader: {
            enabled: isTruthyString(process.env[EMBUPLOADER_ENABLED]),
            directory: process.env[EMBUPLOADER_PATH],
            countQuota: filterNullableInt(process.env[EMBUPLOADER_COUNT_QUOTA]) ?? undefined,
            sizeQuota: filterNullableInt(process.env[EMBUPLOADER_SIZE_QUOTA]) ?? undefined,
            maxFileSize: filterNullableInt(process.env[EMBUPLOADER_MAX_FILE_SIZE]) ?? undefined,
        },
        autoMigration: process.env[FLOCON_API_AUTO_MIGRATION] === always,
        accessControlAllowOrigin: process.env[ACCESS_CONTROL_ALLOW_ORIGIN],
        disableRateLimitExperimental:
            process.env[FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL] === 'true',
    };
};

let firebaseConfig: FirebaseConfig | undefined;

export const loadFirebaseConfig = (): FirebaseConfig => {
    if (firebaseConfig == null) {
        firebaseConfig = loadFirebaseConfigCore();
    }
    return firebaseConfig;
};

let serverConfigAsMainCache: ServerConfig | null = null;
export const loadServerConfigAsMain = async (): Promise<ServerConfig> => {
    if (serverConfigAsMainCache == null) {
        serverConfigAsMainCache = loadServerConfig({
            databaseArg: (await loadAsMain()).db ?? null,
            ignoreEntryPassword: false,
            ignoreFirebaseAdminSecret: false,
        });
    }
    return serverConfigAsMainCache;
};

let serverConfigAsCheckCache: ServerConfig | null = null;
export const loadServerConfigAsCheck = async (): Promise<ServerConfig> => {
    if (serverConfigAsCheckCache == null) {
        serverConfigAsCheckCache = loadServerConfig({
            databaseArg: (await loadAsMain()).db ?? null,
            ignoreEntryPassword: true,
            ignoreFirebaseAdminSecret: true,
        });
    }
    return serverConfigAsCheckCache;
};

let serverConfigAsMigrationCreateCache: ServerConfig | null = null;
export const loadServerConfigAsMigrationCreate = async (): Promise<ServerConfig> => {
    if (serverConfigAsMigrationCreateCache == null) {
        serverConfigAsMigrationCreateCache = loadServerConfig({
            databaseArg: (await loadMigrationCreate()).db ?? null,
            ignoreEntryPassword: true,
            ignoreFirebaseAdminSecret: true,
        });
    }
    return serverConfigAsMigrationCreateCache;
};

let serverConfigAsMigrationUpCache: ServerConfig | null = null;
export const loadServerConfigAsMigrationUp = async (): Promise<ServerConfig> => {
    if (serverConfigAsMigrationUpCache == null) {
        serverConfigAsMigrationUpCache = loadServerConfig({
            databaseArg: (await loadMigrationUp()).db ?? null,
            ignoreEntryPassword: true,
            ignoreFirebaseAdminSecret: true,
        });
    }
    return serverConfigAsMigrationUpCache;
};

let serverConfigAsMigrationDownCache: (ServerConfig & { count: number }) | null = null;
export const loadServerConfigAsMigrationDown = async (): Promise<
    ServerConfig & { count: number }
> => {
    if (serverConfigAsMigrationDownCache == null) {
        const loaded = await loadMigrationDown();
        serverConfigAsMigrationDownCache = {
            ...loadServerConfig({
                databaseArg: loaded.db ?? null,
                ignoreEntryPassword: true,
                ignoreFirebaseAdminSecret: true,
            }),
            count: loaded.count,
        };
    }
    return serverConfigAsMigrationDownCache;
};
