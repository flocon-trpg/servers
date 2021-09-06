"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConsole = void 0;
var AppConsole;
(function (AppConsole) {
    const messageToString = (source) => {
        const icon = source.icon == null ? '' : `${source.icon} `;
        if (source.ja == null) {
            return `${icon}${source.en}`;
        }
        return `${icon}${source.en} / ${icon}${source.ja}`;
    };
    AppConsole.log = (message) => {
        console.log(messageToString(message));
    };
    AppConsole.warn = (message) => {
        console.warn(messageToString(message));
    };
})(AppConsole = exports.AppConsole || (exports.AppConsole = {}));
