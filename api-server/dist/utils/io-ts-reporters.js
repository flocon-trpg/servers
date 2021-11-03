"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatValidationErrors = void 0;
const io_ts_reporters_1 = require("io-ts-reporters");
const formatValidationErrors = (errors, options) => {
    var _a;
    const errorArray = (0, io_ts_reporters_1.formatValidationErrors)(errors, options);
    return (_a = errorArray[0]) !== null && _a !== void 0 ? _a : 'unknown encode error';
};
exports.formatValidationErrors = formatValidationErrors;
