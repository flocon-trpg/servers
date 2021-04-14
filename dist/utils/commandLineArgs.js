"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMigrationCreate = exports.loadMigrationDown = exports.loadMigrationUp = exports.loadAsMain = exports.sqlite = exports.postgresql = void 0;
const yargs_1 = __importDefault(require("yargs"));
exports.postgresql = 'postgresql';
exports.sqlite = 'sqlite';
const toDbType = (source) => {
    switch (source) {
        case exports.postgresql:
            return exports.postgresql;
        case exports.sqlite:
            return exports.sqlite;
        default:
            return undefined;
    }
};
const getMain = () => {
    const options = yargs_1.default(process.argv.slice(2))
        .options({
        'db': {
            type: 'string',
            nargs: 1,
            choices: [exports.postgresql, exports.sqlite],
        },
        'debug': {
            type: 'boolean',
        }
    }).argv;
    const result = {
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
let mainCache = null;
const loadAsMain = () => {
    if (mainCache == null) {
        mainCache = getMain();
    }
    return mainCache;
};
exports.loadAsMain = loadAsMain;
const getMigrationUp = () => {
    const options = yargs_1.default(process.argv.slice(2))
        .options({
        'db': {
            type: 'string',
            demandOption: true,
            nargs: 1,
            choices: [exports.postgresql, exports.sqlite],
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
let migrationUpCache = null;
const loadMigrationUp = () => {
    if (migrationUpCache == null) {
        migrationUpCache = getMigrationUp();
    }
    return migrationUpCache;
};
exports.loadMigrationUp = loadMigrationUp;
const getMigrationDown = () => {
    const options = yargs_1.default(process.argv.slice(2))
        .options({
        'db': {
            type: 'string',
            demandOption: true,
            nargs: 1,
            choices: [exports.postgresql, exports.sqlite],
        },
        'count': {
            type: 'number',
            demandOption: true,
            nargs: 1,
        },
    }).argv;
    const databaseOption = options.db;
    let database;
    if (typeof databaseOption === 'string') {
        const result = toDbType(databaseOption);
        if (result == null) {
            throw 'This should not happen';
        }
        database = result;
    }
    else {
        throw 'This should not happen';
    }
    const countOption = options.count;
    let count;
    if (typeof countOption === 'number') {
        count = countOption;
    }
    else {
        throw 'This should not happen';
    }
    return {
        db: database,
        count,
    };
};
let migrationDownCache = null;
const loadMigrationDown = () => {
    if (migrationDownCache == null) {
        migrationDownCache = getMigrationDown();
    }
    return migrationDownCache;
};
exports.loadMigrationDown = loadMigrationDown;
const getMigrationCreate = () => {
    const options = yargs_1.default(process.argv.slice(2))
        .options({
        'db': {
            type: 'string',
            demandOption: true,
            nargs: 1,
            choices: [exports.postgresql, exports.sqlite],
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
let migrationCreateCache = null;
const loadMigrationCreate = () => {
    if (migrationCreateCache == null) {
        migrationCreateCache = getMigrationCreate();
    }
    return migrationCreateCache;
};
exports.loadMigrationCreate = loadMigrationCreate;
