"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const semver_1 = require("./@shared/semver");
const VERSION = new semver_1.SemVer({
    major: 0,
    minor: 1,
    patch: 0,
    prerelease: {
        type: semver_1.alpha,
        version: 5,
    }
});
exports.default = VERSION;
