import { FirebaseConfig, firebaseConfig as firebaseConfigIo } from '@kizahasi/flocon-core';
import { DatabaseConfig, postgresql, ServerConfig, serverConfigJson } from './configType';
import {
    loadAsMain,
    loadMigrationCreate,
    loadMigrationDown,
    loadMigrationUp,
    sqlite,
} from './utils/commandLineArgs';
import * as E from 'fp-ts/Either';
import { formatValidationErrors } from './utils/io-ts-reporters';

const loadFirebaseConfig = (): FirebaseConfig => {
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
    const env = process.env['FLOCON_API_CONFIG'];
    if (env == null) {
        throw new Error('Server config is not found. Set FLOCON_API_CONFIG environment variable.');
    }
    const json = JSON.parse(env);

    const j = E.mapLeft(formatValidationErrors)(serverConfigJson.decode(json));
    if (j._tag === 'Left') {
        throw new Error(j.left);
    }
    const right = j.right;

    let database: DatabaseConfig;
    switch (databaseArg) {
        case null:
            database = (() => {
                if (right.database.sqlite != null) {
                    if (right.database.postgresql != null) {
                        throw new Error(
                            'When server config has SQLite and PostgreSQL config, you must use --db parameter.'
                        );
                    }
                    return {
                        ...right.database.sqlite,
                        __type: sqlite,
                    } as const;
                }
                if (right.database.postgresql == null) {
                    throw new Error('database/postgresql or database/sqlite is required.');
                }
                return {
                    ...right.database.postgresql,
                    __type: postgresql,
                } as const;
            })();
            break;
        case sqlite: {
            if (right.database.sqlite == null) {
                throw new Error('database/sqlite is required.');
            }
            database = {
                ...right.database.sqlite,
                __type: sqlite,
            };
            break;
        }
        case postgresql: {
            if (right.database.postgresql == null) {
                throw new Error('database/postgresql is required.');
            }
            database = {
                ...right.database.postgresql,
                __type: postgresql,
            };
            break;
        }
    }

    return {
        admin: right.admin,
        database,
        uploader: right.uploader,
        accessControlAllowOrigin: right.accessControlAllowOrigin,
    };
};

export const firebaseConfig = loadFirebaseConfig();

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
            databaseArg: (await loadMigrationCreate()).db,
        });
    }
    return serverConfigAsMigrationCreateCache;
};

let serverConfigAsMigrationUpCache: ServerConfig | null = null;
export const loadServerConfigAsMigrationUp = async (): Promise<ServerConfig> => {
    if (serverConfigAsMigrationUpCache == null) {
        serverConfigAsMigrationUpCache = loadServerConfig({
            databaseArg: (await loadMigrationUp()).db,
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
            ...loadServerConfig({ databaseArg: loaded.db }),
            count: loaded.count,
        };
    }
    return serverConfigAsMigrationDownCache;
};
