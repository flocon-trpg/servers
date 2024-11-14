'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');
var PrereleaseType = require('../../enums/PrereleaseType.js');

exports.Prerelease = class Prerelease {
};
tslib.__decorate([
    typeGraphql.Field(() => PrereleaseType.PrereleaseType),
    tslib.__metadata("design:type", String)
], exports.Prerelease.prototype, "type", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Number)
], exports.Prerelease.prototype, "version", void 0);
exports.Prerelease = tslib.__decorate([
    typeGraphql.ObjectType(),
    typeGraphql.InputType('PrereleaseInput')
], exports.Prerelease);
exports.SemVer = class SemVer {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Number)
], exports.SemVer.prototype, "major", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Number)
], exports.SemVer.prototype, "minor", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Number)
], exports.SemVer.prototype, "patch", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", exports.Prerelease)
], exports.SemVer.prototype, "prerelease", void 0);
exports.SemVer = tslib.__decorate([
    typeGraphql.ObjectType(),
    typeGraphql.InputType('SemVerInput')
], exports.SemVer);
exports.ServerInfo = class ServerInfo {
};
tslib.__decorate([
    typeGraphql.Field(() => exports.SemVer),
    tslib.__metadata("design:type", exports.SemVer)
], exports.ServerInfo.prototype, "version", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Boolean)
], exports.ServerInfo.prototype, "uploaderEnabled", void 0);
exports.ServerInfo = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.ServerInfo);
//# sourceMappingURL=serverInfo.js.map
