import { Injectable } from '@nestjs/common';
import yargs from 'yargs';
import { VERSION } from '../VERSION';

const auto = 'auto';
const mysql = 'mysql';
const postgresql = 'postgresql';
const sqlite = 'sqlite';

export type DbType = typeof mysql | typeof postgresql | typeof sqlite;
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

type MigrationUpOrCheck = {
    db: DbType | null;
};
const getMigrationUpOrCheck = async (): Promise<MigrationUpOrCheck> => {
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

@Injectable()
export class YargsService {
    #mainCache: Main | null = null;
    #migrationUpOrCheckCache: MigrationUpOrCheck | null = null;
    #migrationDownCache: MigrationDown | null = null;
    #migrationCreateCache: MigrationCreate | null = null;

    async getMain(): Promise<Main> {
        if (this.#mainCache == null) {
            this.#mainCache = await getMain();
        }
        return this.#mainCache;
    }

    async getMigrationUpOrCheck(): Promise<MigrationUpOrCheck> {
        if (this.#migrationUpOrCheckCache == null) {
            this.#migrationUpOrCheckCache = await getMigrationUpOrCheck();
        }
        return this.#migrationUpOrCheckCache;
    }

    async getMigrationDown(): Promise<MigrationDown> {
        if (this.#migrationDownCache == null) {
            this.#migrationDownCache = await getMigrationDown();
        }
        return this.#migrationDownCache;
    }

    async getMigrationCreate(): Promise<MigrationCreate> {
        if (this.#migrationCreateCache == null) {
            this.#migrationCreateCache = await getMigrationCreate();
        }
        return this.#migrationCreateCache;
    }
}
