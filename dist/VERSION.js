"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERSION = void 0;
const util_1 = require("@kizahasi/util");
exports.VERSION = new util_1.SemVer({
    major: 0,
    minor: 4,
    patch: 0,
    prerelease: {
        type: util_1.alpha,
        version: 9,
    },
});
