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
exports.GetUploadedFilesResult = exports.GetUploadedFilesFailureResult = exports.GetUploadedFilesSuccessResult = void 0;
const type_graphql_1 = require("type-graphql");
const GetFileItemsFailureType_1 = require("../../enums/GetFileItemsFailureType");
const graphql_1 = require("../entities/file/graphql");
let GetUploadedFilesSuccessResult = class GetUploadedFilesSuccessResult {
};
__decorate([
    (0, type_graphql_1.Field)(() => [graphql_1.FileItem]),
    __metadata("design:type", Array)
], GetUploadedFilesSuccessResult.prototype, "files", void 0);
GetUploadedFilesSuccessResult = __decorate([
    (0, type_graphql_1.ObjectType)()
], GetUploadedFilesSuccessResult);
exports.GetUploadedFilesSuccessResult = GetUploadedFilesSuccessResult;
let GetUploadedFilesFailureResult = class GetUploadedFilesFailureResult {
};
__decorate([
    (0, type_graphql_1.Field)(() => GetFileItemsFailureType_1.GetFileItemsFailureType),
    __metadata("design:type", String)
], GetUploadedFilesFailureResult.prototype, "failureType", void 0);
GetUploadedFilesFailureResult = __decorate([
    (0, type_graphql_1.ObjectType)()
], GetUploadedFilesFailureResult);
exports.GetUploadedFilesFailureResult = GetUploadedFilesFailureResult;
exports.GetUploadedFilesResult = (0, type_graphql_1.createUnionType)({
    name: 'GetUploadedFilesResult',
    types: () => [GetUploadedFilesSuccessResult, GetUploadedFilesFailureResult],
    resolveType: value => {
        if ('files' in value) {
            return GetUploadedFilesSuccessResult;
        }
        if ('failureType' in value) {
            return GetUploadedFilesFailureResult;
        }
        return undefined;
    },
});
