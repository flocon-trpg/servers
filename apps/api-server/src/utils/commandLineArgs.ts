import yargs from 'yargs';
import { VERSION } from '../VERSION';

const auto = 'auto';
const mysql = 'mysql';
const postgresql = 'postgresql';
const sqlite = 'sqlite';

type DbType = typeof mysql | typeof postgresql | typeof sqlite;
const allDbOrAutoTypes = [auto, mysql, postgresql, sqlite] as const;

const toDbType = (source: string): DbType | null => {
    switch (source) {
        case mysql:
            return mysql;
        case postgresql:
            return postgresql;
        case sqlite:
            return sqlite;
        case auto:
            return null;
        default:
            throw new Error(`"${source}" is an unrecognized value.`);
    }
};

type Main = {
    // nullのときはautoを表す。
    db: DbType | null;

    debug: boolean;
};
const getMain = async (): Promise<Main> => {
    const options = await yargs(process.argv.slice(2))
        .option('db', {
            type: 'string',
            nargs: 1,
            choices: allDbOrAutoTypes,
            default: auto,
        })
        .option('debug', { type: 'boolean' })
        .version(VERSION.toString()).argv;

    const result: Main = {
        debug: options.debug === true,
        db: toDbType(options.db),
    };
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
    db: DbType | null;
};
const getMigrationUp = async (): Promise<MigrationUpOrCheck> => {
    const options = await yargs(process.argv.slice(2)).option('db', {
        type: 'string',
        nargs: 1,
        choices: allDbOrAutoTypes,
        default: auto,
    }).argv;

    return {
        db: toDbType(options.db),
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
    db: DbType | null;
    count: number;
};
const getMigrationDown = async (): Promise<MigrationDown> => {
    const options = await yargs(process.argv.slice(2))
        .option('db', {
            type: 'string',
            nargs: 1,
            choices: allDbOrAutoTypes,
            default: auto,
        })
        .option('count', {
            type: 'number',
            demandOption: true,
            nargs: 1,
        }).argv;

    const countOption = options.count;
    let count: number;
    if (typeof countOption === 'number') {
        count = countOption;
    } else {
        throw new Error('This should not happen');
    }

    return {
        db: toDbType(options.db),
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
    db: DbType | null;
    init: boolean;
};
const getMigrationCreate = async (): Promise<MigrationCreate> => {
    const options = await yargs(process.argv.slice(2))
        .option('db', {
            type: 'string',
            nargs: 1,
            choices: allDbOrAutoTypes,
            default: auto,
        })
        .option('init', {
            type: 'boolean',
        }).argv;

    return {
        db: toDbType(options.db),
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
