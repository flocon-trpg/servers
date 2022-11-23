'use strict';

var utils = require('@flocon-trpg/utils');
var result = require('@kizahasi/result');
var env = require('../env.js');
var types = require('./types.js');

const ensureOk = (source) => {
    return source?.value;
};
class LogConfigParser {
    get logFormat() {
        return this[env.LOG_FORMAT];
    }
    get logLevel() {
        return this[env.LOG_LEVEL];
    }
    constructor(env$1) {
        this[env.LOG_FORMAT] = LogConfigParser.logFormat(env$1);
        this[env.LOG_LEVEL] = LogConfigParser.logLevel(env$1);
    }
    static logFormat(env$1) {
        const logFormat = env$1[env.LOG_FORMAT];
        if (logFormat == null) {
            return undefined;
        }
        switch (logFormat.toLowerCase().trim()) {
            case 'json':
            case 'pino':
                return result.Result.ok(types.json);
            case 'default':
                return result.Result.ok(types.$default);
        }
        return result.Result.error(`${env.LOG_FORMAT} is invalid. Supported values: "json", "default".`);
    }
    static logLevel(env$1) {
        const logLevel = env$1[env.LOG_LEVEL];
        if (logLevel == null) {
            return undefined;
        }
        return utils.parsePinoLogLevel(logLevel, env.LOG_LEVEL);
    }
    createLogConfig() {
        if (this.logFormat?.isError) {
            return this.logFormat;
        }
        if (this.logLevel?.isError) {
            return this.logLevel;
        }
        const result$1 = {
            logFormat: ensureOk(this.logFormat),
            logLevel: ensureOk(this.logLevel),
        };
        return result.Result.ok(result$1);
    }
    get logConfig() {
        if (this.logConfigCache == null) {
            this.logConfigCache = this.createLogConfig();
        }
        return this.logConfigCache;
    }
}

exports.LogConfigParser = LogConfigParser;
//# sourceMappingURL=logConfigParser.js.map
