"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("@kizahasi/util");
const VERSION = new util_1.SemVer({
    major: 0,
    minor: 4,
    patch: 0,
    prerelease: {
        type: util_1.alpha,
        version: 1,
    },
});
exports.default = VERSION;
