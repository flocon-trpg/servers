'use strict';

var yargs = require('yargs');
var VERSION = require('../VERSION.js');

const auto = 'auto';
const mysql = 'mysql';
const postgresql = 'postgresql';
const sqlite = 'sqlite';
const allDbOrAutoTypes = [auto, mysql, postgresql, sqlite];
const toDbType = (source) => {
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
const getMain = async () => {
    const options = await yargs(process.argv.slice(2))
        .option('db', {
        type: 'string',
        nargs: 1,
        choices: allDbOrAutoTypes,
        default: auto,
    })
        .option('debug', { type: 'boolean' })
        .version(VERSION.VERSION.toString()).argv;
    const result = {
        debug: options.debug === true,
        db: toDbType(options.db),
    };
    return result;
};
let mainCache = null;
const loadAsMain = async () => {
    if (mainCache == null) {
        mainCache = await getMain();
    }
    return mainCache;
};
const getMigrationUp = async () => {
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
let migrationUpCache = null;
const loadMigrationUpOrCheck = async () => {
    if (migrationUpCache == null) {
        migrationUpCache = await getMigrationUp();
    }
    return migrationUpCache;
};
const getMigrationDown = async () => {
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
    let count;
    if (typeof countOption === 'number') {
        count = countOption;
    }
    else {
        throw new Error('This should not happen');
    }
    return {
        db: toDbType(options.db),
        count,
    };
};
let migrationDownCache = null;
const loadMigrationDown = async () => {
    if (migrationDownCache == null) {
        migrationDownCache = await getMigrationDown();
    }
    return migrationDownCache;
};
const getMigrationCreate = async () => {
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
let migrationCreateCache = null;
const loadMigrationCreate = async () => {
    if (migrationCreateCache == null) {
        migrationCreateCache = await getMigrationCreate();
    }
    return migrationCreateCache;
};

exports.loadAsMain = loadAsMain;
exports.loadMigrationCreate = loadMigrationCreate;
exports.loadMigrationDown = loadMigrationDown;
exports.loadMigrationUpOrCheck = loadMigrationUpOrCheck;
//# sourceMappingURL=commandLineArgs.js.map
