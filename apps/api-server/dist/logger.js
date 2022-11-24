'use strict';

var utils = require('@flocon-trpg/utils');
var pino = require('pino');

const notice = 'notice';
const defaultTransport = './transport/defaultTransport.js';
const createUninitializeLogger = () => {
    return pino.pino({
        transport: { target: defaultTransport },
    });
};
let currentLogger = null;
const logger = {
    get() {
        if (currentLogger == null) {
            currentLogger = createUninitializeLogger();
            utils.loggerRef.value = currentLogger;
        }
        return currentLogger;
    },
    get trace() {
        const logger = this.get();
        return logger.trace.bind(logger);
    },
    get debug() {
        const logger = this.get();
        return logger.debug.bind(logger);
    },
    get info() {
        const logger = this.get();
        return logger.info.bind(logger);
    },
    infoAsNotice(message) {
        const logger = this.get();
        return logger.info({ [notice]: true }, message);
    },
    get warn() {
        const logger = this.get();
        return logger.warn.bind(logger);
    },
    get error() {
        const logger = this.get();
        return logger.error.bind(logger);
    },
    get fatal() {
        const logger = this.get();
        return logger.error.bind(logger);
    },
};
const initializeLogger = (logConfigResult) => {
    if (currentLogger != null) {
        logger.warn('initializeLogger was called multiple times.');
    }
    if (logConfigResult.isError) {
        throw new Error(logConfigResult.error);
    }
    const logLevel = logConfigResult.value.logLevel ?? 'info';
    switch (logConfigResult.value.logFormat) {
        case 'json': {
            currentLogger = pino.pino({ level: logLevel });
            utils.loggerRef.value = currentLogger;
            break;
        }
        case 'default':
        case undefined: {
            currentLogger = pino.pino({
                level: logLevel,
                transport: { target: defaultTransport },
            });
            utils.loggerRef.value = currentLogger;
            break;
        }
    }
};

exports.initializeLogger = initializeLogger;
exports.logger = logger;
exports.notice = notice;
//# sourceMappingURL=logger.js.map
