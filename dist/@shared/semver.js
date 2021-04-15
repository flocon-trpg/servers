"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemVer = exports.differentPrereleaseVersion = exports.webServerRequiresUpdate = exports.apiServerRequiresUpdate = exports.ok = exports.rc = exports.beta = exports.alpha = void 0;
exports.alpha = 'alpha';
exports.beta = 'beta';
exports.rc = 'rc';
exports.ok = 'ok';
exports.apiServerRequiresUpdate = 'apiServerRequiresUpdate';
exports.webServerRequiresUpdate = 'webServerRequiresUpdate';
exports.differentPrereleaseVersion = 'differentPrereleaseVersion';
class SemVer {
    constructor(option) {
        var _a;
        SemVer.requireToBeNonNegativeInteger(option.major, 'major');
        SemVer.requireToBeNonNegativeInteger(option.minor, 'minor');
        SemVer.requireToBeNonNegativeInteger(option.patch, 'patch');
        if (option.prerelease != null) {
            SemVer.requireToBePositiveInteger(option.prerelease.version, 'prerelease version');
        }
        this.major = option.major;
        this.minor = option.minor;
        this.patch = option.patch;
        this.prerelease = (_a = option.prerelease) !== null && _a !== void 0 ? _a : null;
    }
    static requireToBePositiveInteger(source, propName) {
        if (!Number.isInteger(source)) {
            throw `Semver error: ${propName} must be integer. Actual value is "${source}"`;
        }
        if (source <= 0) {
            throw `Semver error: ${propName} must be positive. Actual value is "${source}"`;
        }
    }
    static requireToBeNonNegativeInteger(source, propName) {
        if (!Number.isInteger(source)) {
            throw `Semver error: ${propName} must be integer. Actual value is "${source}"`;
        }
        if (source < 0) {
            throw `Semver error: ${propName} must not be negative. Actual value is "${source}"`;
        }
    }
    toString() {
        if (this.prerelease == null) {
            return `${this.major}.${this.minor}.${this.patch}`;
        }
        return `${this.major}.${this.minor}.${this.patch}-${this.prerelease.type}.${this.prerelease.version}`;
    }
    static compareNumbers(left, operator, right) {
        switch (operator) {
            case '=':
                return left === right;
            case '<':
                return left < right;
            case '<=':
                return left <= right;
            case '>':
                return left > right;
            case '>=':
                return left >= right;
        }
    }
    static prereleaseTypeToNumber(type) {
        if (type == null) {
            return 0;
        }
        switch (type) {
            case exports.rc:
                return -1;
            case exports.beta:
                return -2;
            case exports.alpha:
                return -3;
        }
    }
    static compareCore(left, operator, right) {
        var _a, _b, _c, _d, _e, _f;
        if (left.major !== right.major) {
            return SemVer.compareNumbers(left.major, operator, right.major);
        }
        if (left.minor !== right.minor) {
            return SemVer.compareNumbers(left.minor, operator, right.minor);
        }
        if (left.patch !== right.patch) {
            return SemVer.compareNumbers(left.patch, operator, right.patch);
        }
        const leftPreleaseTypeAsNumber = SemVer.prereleaseTypeToNumber((_a = left.prerelease) === null || _a === void 0 ? void 0 : _a.type);
        const rightPreleaseTypeAsNumber = SemVer.prereleaseTypeToNumber((_b = right.prerelease) === null || _b === void 0 ? void 0 : _b.type);
        if (leftPreleaseTypeAsNumber !== rightPreleaseTypeAsNumber) {
            return SemVer.compareNumbers(leftPreleaseTypeAsNumber, operator, rightPreleaseTypeAsNumber);
        }
        return SemVer.compareNumbers((_d = (_c = left.prerelease) === null || _c === void 0 ? void 0 : _c.version) !== null && _d !== void 0 ? _d : -1, operator, (_f = (_e = right.prerelease) === null || _e === void 0 ? void 0 : _e.version) !== null && _f !== void 0 ? _f : -1);
    }
    static compare(left, operator, right) {
        switch (operator) {
            case '=':
            case '<':
            case '>':
                return SemVer.compareCore(left, operator, right);
            case '<=':
                return !SemVer.compareCore(left, '>', right);
            case '>=':
                return !SemVer.compareCore(left, '<', right);
        }
    }
    static check({ api, web }) {
        var _a, _b;
        if (SemVer.compare(api, '=', web)) {
            return exports.ok;
        }
        if (api.major === web.major) {
            if (api.minor < web.minor) {
                return exports.apiServerRequiresUpdate;
            }
            if (((_a = api.prerelease) === null || _a === void 0 ? void 0 : _a.type) === exports.alpha || ((_b = web.prerelease) === null || _b === void 0 ? void 0 : _b.type) === exports.alpha) {
                return exports.differentPrereleaseVersion;
            }
            return exports.ok;
        }
        if (api.major > web.major) {
            return exports.webServerRequiresUpdate;
        }
        if (api.major < web.major) {
            return exports.apiServerRequiresUpdate;
        }
        return exports.ok;
    }
}
exports.SemVer = SemVer;
