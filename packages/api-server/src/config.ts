import { FirebaseConfig, firebaseConfig as firebaseConfigIo } from '@flocon-trpg/core';
import {
    always,
    DatabaseConfig,
    entryPassword,
    EntryPasswordConfig,
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
    FLOCON_API_ACCESS_CONTROL_ALLOW_ORIGIN,
    FLOCON_API_AUTO_MIGRATION,
    FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL,
    FLOCON_API_EMBEDDED_UPLOADER_COUNT_QUOTA,
    FLOCON_API_EMBEDDED_UPLOADER_MAX_FILE_SIZE,
    FLOCON_API_EMBEDDED_UPLOADER_PATH,
    FLOCON_API_EMBEDDED_UPLOADER_SIZE_QUOTA,
    FLOCON_API_ENABLE_EMBEDDED_UPLOADER,
    FLOCON_API_ENTRY_PASSWORD,
    FLOCON_API_POSTGRESQL,
    FLOCON_API_SQLITE,
    loadDotenv,
} from './env';
import { filterInt, isTruthyString } from '@flocon-trpg/utils';

loadDotenv();

const filterNullableInt = (source: string | null | undefined) => {
    if (source == null) {
        return source;
    }
    return filterInt(source);
};

const loadFirebaseConfigCore = (): FirebaseConfig => {
    let env = process.env['FLOCON_FIREBASE_CONFIG'];
    if (env == null) {
        env = process.env['NEXT_PUBLIC_FLOCON_FIREBASE_CONFIG'];
    }
    if (env == null) {
        throw new Error(
            'Firebase config is not found. Set FLOCON_FIREBASE_CONFIG or NEXT_PUBLIC_FLOCON_FIREBASE_CONFIG environment variable.'
        );
    }
    const json = JSON.parse(env);

    const decoded = E.mapLeft(formatValidationErrors)(firebaseConfigIo.decode(json));
    if (decoded._tag === 'Left') {
        throw new Error(decoded.left);
    }
    return decoded.right;
};

const loadServerConfig = ({
    databaseArg,
}: {
    databaseArg: typeof postgresql | typeof sqlite | null;
}): ServerConfig => {
    let entryPasswordConfig: EntryPasswordConfig | null;
    {
        const entryPasswordObject = process.env[FLOCON_API_ENTRY_PASSWORD];
        if (entryPasswordObject == null) {
            entryPasswordConfig = null;
        } else {
            const json = JSON.parse(entryPasswordObject);

            const j = E.mapLeft(formatValidationErrors)(entryPassword.decode(json));
            if (j._tag === 'Left') {
                throw new Error(j.left);
            }
            entryPasswordConfig = j.right;
        }
    }

    let databaseConfig: DatabaseConfig;
    {
        const psqlObject = process.env[FLOCON_API_POSTGRESQL];
        const sqliteObject = process.env[FLOCON_API_SQLITE];

        let psqlConfig: PostgresqlDatabaseConfig | null;
        if (psqlObject == null) {
            psqlConfig = null;
        } else {
            const json = JSON.parse(psqlObject);
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
            const json = JSON.parse(sqliteObject);
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
                                'When server config has SQLite and PostgreSQL config, you must use --db parameter.'
                            );
                        }
                        return {
                            ...sqliteConfig,
                            __type: sqlite,
                        } as const;
                    }
                    if (psqlConfig == null) {
                        throw new Error('database/postgresql or database/sqlite is required.');
                    }
                    return {
                        ...psqlConfig,
                        __type: postgresql,
                    } as const;
                })();
                break;
            case sqlite: {
                if (sqliteConfig == null) {
                    throw new Error('database/sqlite is required.');
                }
                databaseConfig = {
                    ...sqliteConfig,
                    __type: sqlite,
                };
                break;
            }
            case postgresql: {
                if (psqlConfig == null) {
                    throw new Error('database/postgresql is required.');
                }
                databaseConfig = {
                    ...psqlConfig,
                    __type: postgresql,
                };
                break;
            }
        }
    }

    return {
        admins: [],
        database: databaseConfig,
        entryPassword: entryPasswordConfig ?? undefined,
        uploader: {
            enabled: isTruthyString(process.env[FLOCON_API_ENABLE_EMBEDDED_UPLOADER]),
            directory: process.env[FLOCON_API_EMBEDDED_UPLOADER_PATH],
            countQuota:
                filterNullableInt(process.env[FLOCON_API_EMBEDDED_UPLOADER_COUNT_QUOTA]) ??
                undefined,
            sizeQuota:
                filterNullableInt(process.env[FLOCON_API_EMBEDDED_UPLOADER_SIZE_QUOTA]) ??
                undefined,
            maxFileSize:
                filterNullableInt(process.env[FLOCON_API_EMBEDDED_UPLOADER_MAX_FILE_SIZE]) ??
                undefined,
        },
        autoMigration: process.env[FLOCON_API_AUTO_MIGRATION] === always,
        accessControlAllowOrigin: process.env[FLOCON_API_ACCESS_CONTROL_ALLOW_ORIGIN],
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
        });
    }
    return serverConfigAsMainCache;
};

let serverConfigAsMigrationCreateCache: ServerConfig | null = null;
export const loadServerConfigAsMigrationCreate = async (): Promise<ServerConfig> => {
    if (serverConfigAsMigrationCreateCache == null) {
        serverConfigAsMigrationCreateCache = loadServerConfig({
            databaseArg: (await loadMigrationCreate()).db ?? null,
        });
    }
    return serverConfigAsMigrationCreateCache;
};

let serverConfigAsMigrationUpCache: ServerConfig | null = null;
export const loadServerConfigAsMigrationUp = async (): Promise<ServerConfig> => {
    if (serverConfigAsMigrationUpCache == null) {
        serverConfigAsMigrationUpCache = loadServerConfig({
            databaseArg: (await loadMigrationUp()).db ?? null,
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
            ...loadServerConfig({ databaseArg: loaded.db ?? null }),
            count: loaded.count,
        };
    }
    return serverConfigAsMigrationDownCache;
};
