'use strict';

var entity$4 = require('./entities/file/entity.js');
var entity$5 = require('./entities/fileTag/entity.js');
var entity$3 = require('./entities/participant/entity.js');
var entity = require('./entities/room/entity.js');
var entity$1 = require('./entities/roomMessage/entity.js');
var entity$2 = require('./entities/user/entity.js');
var logger = require('./logger.js');

const entities = [
    entity.Room,
    entity.RoomOp,
    entity$1.RoomPubMsg,
    entity$1.RoomPrvMsg,
    entity$1.DicePieceLog,
    entity$1.StringPieceLog,
    entity$1.RoomPubCh,
    entity$1.RoomSe,
    entity$2.User,
    entity$3.Participant,
    entity$4.File,
    entity$5.FileTag,
];
const migrations = ({ dirName, dbType, }) => {
    return {
        path: `./${dirName}/__migrations__/${dbType}`,
    };
};
const loggerFactory = () => {
    const logBase = (methodName, namespace, message, context) => {
        const text = message;
        if (context == null) {
            logger.logger[methodName]({ namespace }, text);
        }
        else {
            logger.logger[methodName]({
                context: {
                    ...context,
                    level: undefined,
                },
                namespace,
            }, text);
        }
    };
    return {
        log(namespace, message, context) {
            logBase('debug', namespace, message, context);
        },
        error(namespace, message, context) {
            logBase('error', namespace, message, context);
        },
        warn(namespace, message, context) {
            logBase('warn', namespace, message, context);
        },
        logQuery(context) {
            let methodName;
            switch (context.level) {
                case 'error':
                    methodName = 'error';
                    break;
                case 'info':
                case undefined:
                    methodName = 'info';
                    break;
                case 'warning':
                    methodName = 'warn';
                    break;
            }
            logger.logger[methodName]({
                ...context,
                level: undefined,
            }, 'MikroORM logQuery');
        },
        setDebugMode() {
            return;
        },
        isEnabled() {
            return true;
        },
    };
};
const optionsBase = {
    loggerFactory,
    debug: true,
};
const createSQLiteOptions = ({ sqliteConfig, dirName, }) => {
    return {
        ...optionsBase,
        entities,
        dbName: sqliteConfig.dbName,
        clientUrl: sqliteConfig.clientUrl,
        migrations: migrations({ dbType: 'sqlite', dirName }),
        type: 'sqlite',
        forceUndefined: true,
    };
};
const createPostgreSQLOptions = ({ dbName, dirName, clientUrl, driverOptions, }) => {
    const opts = {
        ...optionsBase,
        entities,
        dbName,
        migrations: {
            ...migrations({ dbType: 'postgresql', dirName }),
            disableForeignKeys: false,
        },
        type: 'postgresql',
        forceUndefined: true,
        clientUrl,
    };
    if (driverOptions != null) {
        opts.driverOptions = driverOptions;
    }
    return opts;
};
const createMySQLOptions = ({ dbName, dirName, clientUrl, driverOptions, }) => {
    const opts = {
        ...optionsBase,
        entities,
        dbName,
        migrations: migrations({ dbType: 'mysql', dirName }),
        type: 'mysql',
        forceUndefined: true,
        clientUrl,
    };
    if (driverOptions != null) {
        opts.driverOptions = driverOptions;
    }
    return opts;
};

exports.createMySQLOptions = createMySQLOptions;
exports.createPostgreSQLOptions = createPostgreSQLOptions;
exports.createSQLiteOptions = createSQLiteOptions;
//# sourceMappingURL=mikro-orm.js.map
