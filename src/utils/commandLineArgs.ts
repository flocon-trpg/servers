import yargs from 'yargs';

export const postgresql = 'postgresql';
export const sqlite = 'sqlite';

type DbType = typeof postgresql | typeof sqlite;

const toDbType = (source: string) => {
    switch (source) {
        case postgresql:
            return postgresql;
        case sqlite:
            return sqlite;
        default:
            return undefined;
    }
};

type Main = {
    db?: DbType;
    debug: boolean;
}

const getMain = (): Main => {
    const options =
        yargs(process.argv.slice(2))
            .options({
                'db': {
                    type: 'string',
                    nargs: 1,
                    choices: [postgresql, sqlite],
                },
                'debug': {
                    type: 'boolean',
                }
            }).argv;
    
    const result: Main = {
        debug: options.debug === true,
    };
    const databaseOption = options.db;
    result.db = (() => {
        if (typeof databaseOption === 'string') {
            return toDbType(databaseOption.toString());
        }
        return undefined;
    })();
    return result;
};
let mainCache: Main | null = null;
export const loadAsMain = (): Main => {
    if (mainCache == null) {
        mainCache = getMain();
    }
    return mainCache;
};

type MigrationUp = {
    db: DbType;
}

const getMigrationUp = (): MigrationUp => {
    const options =
        yargs(process.argv.slice(2))
            .options({
                'db': {
                    type: 'string',
                    demandOption: true,
                    nargs: 1,
                    choices: [postgresql, sqlite],
                }
            }).argv;

    const databaseOption = options.db;
    const database = (() => {
        if (typeof databaseOption === 'string') {
            const result = toDbType(databaseOption);
            if (result == null) {
                throw 'This should not happen';
            }
            return result;
        }
        throw 'This should not happen';
    })();
    return {
        db: database,
    };
};
let migrationUpCache: MigrationUp | null = null;
export const loadMigrationUp = (): MigrationUp => {
    if (migrationUpCache == null) {
        migrationUpCache = getMigrationUp();
    }
    return migrationUpCache;
};

type MigrationCreate = {
    db: DbType;
    init: boolean;
}

const getMigrationCreate = (): MigrationCreate => {
    const options =
        yargs(process.argv.slice(2))
            .options({
                'db': {
                    type: 'string',
                    demandOption: true,
                    nargs: 1,
                    choices: [postgresql, sqlite],
                },
                'init': {
                    type: 'boolean',
                }
            }).argv;

    const databaseOption = options.db;
    const database = (() => {
        if (typeof databaseOption === 'string') {
            const result = toDbType(databaseOption);
            if (result == null) {
                throw 'This should not happen';
            }
            return result;
        }
        throw 'This should not happen';
    })();
    return {
        db: database,
        init: options.init === true,
    };
};
let migrationCreateCache: MigrationCreate | null = null;
export const loadMigrationCreate = (): MigrationCreate => {
    if (migrationCreateCache == null) {
        migrationCreateCache = getMigrationCreate();
    }
    return migrationCreateCache;
};