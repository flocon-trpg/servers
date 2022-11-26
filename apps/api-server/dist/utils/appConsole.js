'use strict';

var utils = require('@flocon-trpg/utils');

exports.AppConsole = void 0;
(function (AppConsole) {
    AppConsole.messageToString = (source) => {
        const icon = source.icon == null ? '' : `${source.icon} `;
        if (source.ja == null) {
            return `${icon}${source.en}`;
        }
        return `${icon}${source.en} / ${icon}${source.ja}`;
    };
    const logCore = (consoleMethodName, message) => {
        const messageStr = AppConsole.messageToString(message);
        if (message.errorObject == null) {
            utils.loggerRef[consoleMethodName](messageStr);
        }
        else {
            utils.loggerRef[consoleMethodName](message.errorObject, messageStr);
        }
    };
    AppConsole.info = (message) => {
        logCore('info', message);
    };
    AppConsole.infoAsNotice = (message) => {
        utils.loggerRef.infoAsNotice(AppConsole.messageToString(message));
    };
    AppConsole.infoAsNoticeJa = (message) => {
        utils.loggerRef.infoAsNotice(message);
    };
    AppConsole.warn = (message) => {
        logCore('warn', message);
    };
    AppConsole.error = (message) => {
        logCore('error', message);
    };
    AppConsole.fatal = (message) => {
        logCore('fatal', message);
    };
})(exports.AppConsole || (exports.AppConsole = {}));
//# sourceMappingURL=appConsole.js.map
