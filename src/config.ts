import { createFirebaseConfig, FirebaseConfig, JsonObject } from '@kizahasi/util';
import fs from 'fs';
import { loadAsMain, loadMigrationCreate, loadMigrationDown, loadMigrationUp } from './utils/commandLineArgs';

export const postgresql = 'postgresql';
export const sqlite = 'sqlite';

type Database = {
    __type: typeof postgresql;
    postgresql: {
        dbName: string;
        clientUrl: string;
    };
} | {
    __type: typeof sqlite;
    sqlite: {
        dbName: string;
    };
}

// なるべくJSONの構造と一致させている。JSONに存在しないプロパティは__を頭に付けている。
type ServerConfig = {
    globalEntryPhrase?: string;
    database: Database;
}

const loadFirebaseConfig = (): FirebaseConfig => {
    let env = process.env['FLOCON_FIREBASE_CONFIG'];
    if (env == null) {
        env = process.env['NEXT_PUBLIC_FLOCON_FIREBASE_CONFIG'];
    }
    if (env == null) {
        throw new Error('Firebase config is not found. Set FLOCON_FIREBASE_CONFIG or NEXT_PUBLIC_FLOCON_FIREBASE_CONFIG environment variable.');
    }
    const json = JSON.parse(env);

    return createFirebaseConfig(json);
};

const loadServerConfig = ({ databaseArg }: { databaseArg: typeof postgresql | typeof sqlite | null }): ServerConfig => {
    const env = process.env['FLOCON_API_CONFIG'];
    if (env == null) {
        throw new Error('Server config is not found. Set FLOCON_API_CONFIG environment variable.');
    }
    const json = JSON.parse(env);

    const j = JsonObject.init(json);

    const postgresqlJson = j.get('database').tryGet('postgresql');
    const sqliteJson = j.get('database').tryGet('sqlite');

    let database: Database;
    switch (databaseArg) {
        case null:
            database = (() => {
                if (sqliteJson != null) {
                    if (postgresqlJson != null) {
                        throw new Error('When server config has SQLite and PostgreSQL config, you must use --db parameter.');
                    }
                    return {
                        __type: 'sqlite',
                        sqlite: {
                            dbName: sqliteJson.get('dbName').valueAsString(),
                        }
                    } as const;
                }
                if (postgresqlJson == null) {
                    throw new Error('database/postgresql or database/sqlite is required.');
                }
                return {
                    __type: postgresql,
                    postgresql: {
                        dbName: postgresqlJson.get('dbName').valueAsString(),
                        clientUrl: postgresqlJson.get('clientUrl').valueAsString(),
                    }
                } as const;
            })();
            break;
        case sqlite: {
            if (sqliteJson == null) {
                throw new Error('database/sqlite is required.');
            }
            database = {
                __type: sqlite,
                sqlite: {
                    dbName: sqliteJson.get('dbName').valueAsString(),
                }
            };
            break;
        }
        case postgresql: {
            if (postgresqlJson == null) {
                throw new Error('database/postgresql is required.');
            }
            database = {
                __type: postgresql,
                postgresql: {
                    dbName: postgresqlJson.get('dbName').valueAsString(),
                    clientUrl: postgresqlJson.get('clientUrl').valueAsString(),
                }
            };
            break;
        }
    }

    return {
        globalEntryPhrase: j.tryGet('globalEntryPhrase')?.valueAsString() ?? undefined,
        database,
    };
};

export const firebaseConfig = loadFirebaseConfig();

let serverConfigAsMainCache: ServerConfig | null = null;
export const loadServerConfigAsMain = async (): Promise<ServerConfig> => {
    if (serverConfigAsMainCache == null) {
        serverConfigAsMainCache = loadServerConfig({ databaseArg: (await loadAsMain()).db ?? null });
    }
    return serverConfigAsMainCache;
};

let serverConfigAsMigrationCreateCache: ServerConfig | null = null;
export const loadServerConfigAsMigrationCreate = async (): Promise<ServerConfig> => {
    if (serverConfigAsMigrationCreateCache == null) {
        serverConfigAsMigrationCreateCache = loadServerConfig({ databaseArg: (await loadMigrationCreate()).db });
    }
    return serverConfigAsMigrationCreateCache;
};

let serverConfigAsMigrationUpCache: ServerConfig | null = null;
export const loadServerConfigAsMigrationUp = async (): Promise<ServerConfig> => {
    if (serverConfigAsMigrationUpCache == null) {
        serverConfigAsMigrationUpCache = loadServerConfig({ databaseArg: (await loadMigrationUp()).db });
    }
    return serverConfigAsMigrationUpCache;
};

let serverConfigAsMigrationDownCache: ServerConfig & { count: number } | null = null;
export const loadServerConfigAsMigrationDown = async (): Promise<ServerConfig & { count: number }> => {
    if (serverConfigAsMigrationDownCache == null) {
        const loaded = await loadMigrationDown();
        serverConfigAsMigrationDownCache = {
            ...loadServerConfig({ databaseArg: loaded.db }),
            count: loaded.count,
        };
    }
    return serverConfigAsMigrationDownCache;
};