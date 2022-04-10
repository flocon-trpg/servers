import yargs from 'yargs';
import { VERSION } from '../VERSION';

const mysql = 'mysql';
const postgresql = 'postgresql';
const sqlite = 'sqlite';

type DbType = typeof mysql | typeof postgresql | typeof sqlite;
const allDbTypes = [mysql, postgresql, sqlite] as const;

const toDbType = (source: string) => {
    switch (source) {
        case mysql:
            return mysql;
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
};
const getMain = async (): Promise<Main> => {
    const options = await yargs(process.argv.slice(2))
        .option('db', {
            type: 'string',
            nargs: 1,
            choices: allDbTypes,
        })
        .option('debug', { type: 'boolean' })
        .version(VERSION.toString()).argv;

    const result: Main = {
        debug: options.debug === true,
    };
    result.db = options.db == null ? undefined : toDbType(options.db);
    return result;
};
let mainCache: Main | null = null;
export const loadAsMain = async (): Promise<Main> => {
    if (mainCache == null) {
        mainCache = await getMain();
    }
    return mainCache;
};

type MigrationUpOrCheck = {
    db?: DbType;
};
const getMigrationUp = async (): Promise<MigrationUpOrCheck> => {
    const options = await yargs(process.argv.slice(2)).options({
        db: {
            type: 'string',
            nargs: 1,
            choices: allDbTypes,
        },
    }).argv;

    return {
        db: options.db == null ? undefined : toDbType(options.db),
    };
};
let migrationUpCache: MigrationUpOrCheck | null = null;
export const loadMigrationUpOrCheck = async (): Promise<MigrationUpOrCheck> => {
    if (migrationUpCache == null) {
        migrationUpCache = await getMigrationUp();
    }
    return migrationUpCache;
};

type MigrationDown = {
    db?: DbType;
    count: number;
};
const getMigrationDown = async (): Promise<MigrationDown> => {
    const options = await yargs(process.argv.slice(2)).options({
        db: {
            type: 'string',
            demandOption: true,
            nargs: 1,
            choices: allDbTypes,
        },
        count: {
            type: 'number',
            demandOption: true,
            nargs: 1,
        },
    }).argv;

    const countOption = options.count;
    let count: number;
    if (typeof countOption === 'number') {
        count = countOption;
    } else {
        throw new Error('This should not happen');
    }

    return {
        db: options.db == null ? undefined : toDbType(options.db),
        count,
    };
};
let migrationDownCache: MigrationDown | null = null;
export const loadMigrationDown = async (): Promise<MigrationDown> => {
    if (migrationDownCache == null) {
        migrationDownCache = await getMigrationDown();
    }
    return migrationDownCache;
};

type MigrationCreate = {
    db?: DbType;
    init: boolean;
};
const getMigrationCreate = async (): Promise<MigrationCreate> => {
    const options = await yargs(process.argv.slice(2)).options({
        db: {
            type: 'string',
            demandOption: true,
            nargs: 1,
            choices: allDbTypes,
        },
        init: {
            type: 'boolean',
        },
    }).argv;

    return {
        db: options.db == null ? undefined : toDbType(options.db),
        init: options.init === true,
    };
};
let migrationCreateCache: MigrationCreate | null = null;
export const loadMigrationCreate = async (): Promise<MigrationCreate> => {
    if (migrationCreateCache == null) {
        migrationCreateCache = await getMigrationCreate();
    }
    return migrationCreateCache;
};
