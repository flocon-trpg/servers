'use strict';

var utils = require('@flocon-trpg/utils');
var pino = require('pino');

let isLoggerInitialized = false;
const initializeLogger = (logConfigResult) => {
    if (isLoggerInitialized) {
        utils.loggerRef.warn('initializeLogger has been called multiple times.');
    }
    if (logConfigResult.isError) {
        throw new Error(logConfigResult.error);
    }
    isLoggerInitialized = true;
    const logLevel = logConfigResult.value.logLevel ?? 'info';
    switch (logConfigResult.value.logFormat) {
        case 'json': {
            utils.loggerRef.value = pino.pino({ level: logLevel });
            break;
        }
        case 'default':
        case undefined: {
            utils.loggerRef.value = utils.createDefaultLogger({ logLevel });
            break;
        }
    }
};

exports.initializeLogger = initializeLogger;
//# sourceMappingURL=initializeLogger.js.map
