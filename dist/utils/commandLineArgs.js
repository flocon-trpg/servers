"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMigrationCreate = exports.loadMigrationDown = exports.loadMigrationUp = exports.loadAsMain = exports.sqlite = exports.postgresql = void 0;
const yargs_1 = __importDefault(require("yargs"));
const VERSION_1 = require("../VERSION");
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
const getMain = async () => {
    const options = await (0, yargs_1.default)(process.argv.slice(2))
        .options({
        db: {
            type: 'string',
            nargs: 1,
            choices: [exports.postgresql, exports.sqlite],
        },
        debug: {
            type: 'boolean',
        },
    })
        .version(VERSION_1.VERSION.toString()).argv;
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
const loadAsMain = async () => {
    if (mainCache == null) {
        mainCache = await getMain();
    }
    return mainCache;
};
exports.loadAsMain = loadAsMain;
const getMigrationUp = async () => {
    const options = await (0, yargs_1.default)(process.argv.slice(2)).options({
        db: {
            type: 'string',
            demandOption: true,
            nargs: 1,
            choices: [exports.postgresql, exports.sqlite],
        },
    }).argv;
    const databaseOption = options.db;
    const database = (() => {
        if (typeof databaseOption === 'string') {
            const result = toDbType(databaseOption);
            if (result == null) {
                throw new Error('This should not happen');
            }
            return result;
        }
        throw new Error('This should not happen');
    })();
    return {
        db: database,
    };
};
let migrationUpCache = null;
const loadMigrationUp = async () => {
    if (migrationUpCache == null) {
        migrationUpCache = await getMigrationUp();
    }
    return migrationUpCache;
};
exports.loadMigrationUp = loadMigrationUp;
const getMigrationDown = async () => {
    const options = await (0, yargs_1.default)(process.argv.slice(2)).options({
        db: {
            type: 'string',
            demandOption: true,
            nargs: 1,
            choices: [exports.postgresql, exports.sqlite],
        },
        count: {
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
            throw new Error('This should not happen');
        }
        database = result;
    }
    else {
        throw new Error('This should not happen');
    }
    const countOption = options.count;
    let count;
    if (typeof countOption === 'number') {
        count = countOption;
    }
    else {
        throw new Error('This should not happen');
    }
    return {
        db: database,
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
exports.loadMigrationDown = loadMigrationDown;
const getMigrationCreate = async () => {
    const options = await (0, yargs_1.default)(process.argv.slice(2)).options({
        db: {
            type: 'string',
            demandOption: true,
            nargs: 1,
            choices: [exports.postgresql, exports.sqlite],
        },
        init: {
            type: 'boolean',
        },
    }).argv;
    const databaseOption = options.db;
    const database = (() => {
        if (typeof databaseOption === 'string') {
            const result = toDbType(databaseOption);
            if (result == null) {
                throw new Error('This should not happen');
            }
            return result;
        }
        throw new Error('This should not happen');
    })();
    return {
        db: database,
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
exports.loadMigrationCreate = loadMigrationCreate;
