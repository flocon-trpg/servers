'use strict';

var utils = require('@flocon-trpg/utils');
var pino = require('pino');

const notice = 'notice';
const defaultTransport = './transport/defaultTransport.js';
let isInitialized = false;
const createUninitializeLogger = () => {
    return pino.pino({
        transport: { target: defaultTransport },
    });
};
const logger = {
    get() {
        if (!isInitialized) {
            isInitialized = true;
            utils.loggerRef.value = createUninitializeLogger();
        }
        return utils.loggerRef.value;
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
    if (isInitialized) {
        logger.warn('initializeLogger was called multiple times.');
    }
    if (logConfigResult.isError) {
        throw new Error(logConfigResult.error);
    }
    const logLevel = logConfigResult.value.logLevel ?? 'info';
    switch (logConfigResult.value.logFormat) {
        case 'json': {
            isInitialized = true;
            utils.loggerRef.value = pino.pino({ level: logLevel });
            break;
        }
        case 'default':
        case undefined: {
            isInitialized = true;
            utils.loggerRef.value = pino.pino({
                level: logLevel,
                transport: { target: defaultTransport },
            });
            break;
        }
    }
};

exports.initializeLogger = initializeLogger;
exports.logger = logger;
exports.notice = notice;
//# sourceMappingURL=logger.js.map
