"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerInfo = exports.SemVer = exports.Prerelease = void 0;
const type_graphql_1 = require("type-graphql");
const PrereleaseType_1 = require("../../../enums/PrereleaseType");
let Prerelease = class Prerelease {
};
__decorate([
    (0, type_graphql_1.Field)(() => PrereleaseType_1.PrereleaseType),
    __metadata("design:type", String)
], Prerelease.prototype, "type", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], Prerelease.prototype, "version", void 0);
Prerelease = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, type_graphql_1.InputType)('PrereleaseInput')
], Prerelease);
exports.Prerelease = Prerelease;
let SemVer = class SemVer {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], SemVer.prototype, "major", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], SemVer.prototype, "minor", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], SemVer.prototype, "patch", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Prerelease)
], SemVer.prototype, "prerelease", void 0);
SemVer = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, type_graphql_1.InputType)('SemVerInput')
], SemVer);
exports.SemVer = SemVer;
let ServerInfo = class ServerInfo {
};
__decorate([
    (0, type_graphql_1.Field)(() => SemVer),
    __metadata("design:type", SemVer)
], ServerInfo.prototype, "version", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], ServerInfo.prototype, "uploaderEnabled", void 0);
ServerInfo = __decorate([
    (0, type_graphql_1.ObjectType)()
], ServerInfo);
exports.ServerInfo = ServerInfo;
