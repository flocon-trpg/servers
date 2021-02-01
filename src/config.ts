import fs from 'fs';
import { createFirebaseConfig, FirebaseConfig } from './@shared/config';
import { JSONObject } from './@shared/JSONObject';

export const postgresql = 'postgresql';
export const sqlite = 'sqlite';

type Database = {
    __type: 'postgresql';
    postgresql: {
        dbName: string;
        clientUrl: string;
    };
} | {
    __type: 'sqlite';
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
    const file = fs.readFileSync('./firebase-config.json').toString();
    const json = JSON.parse(file.toString());

    return createFirebaseConfig(json);
};

const loadServerConfig = (): ServerConfig => {
    const file = fs.readFileSync('./server-config.json').toString();
    const json = JSON.parse(file.toString());

    const j = JSONObject.init(json);

    const postgresql = j.get('database').tryGet('postgresql');
    const sqlite = j.get('database').tryGet('sqlite');
    let database: Database;
    if (postgresql == null) {
        if (sqlite == null) {
            throw 'database/postgresql or database/sqlite is required.';
        }
        database = {
            __type: 'sqlite',
            sqlite: {
                dbName: sqlite.get('dbName').valueAsString(),
            }
        };
    } else {
        if (sqlite != null) {
            throw 'You cannot set database/postgresql and database/sqlite together.';
        }
        database = {
            __type: 'postgresql',
            postgresql: {
                dbName: postgresql.get('dbName').valueAsString(),
                clientUrl: postgresql.get('clientUrl').valueAsString(),
            }
        };
    }

    return {
        globalEntryPhrase: j.tryGet('globalEntryPhrase')?.valueAsString() ?? undefined,
        database,
    };
};

export const firebaseConfig = loadFirebaseConfig();
export const serverConfig = loadServerConfig();