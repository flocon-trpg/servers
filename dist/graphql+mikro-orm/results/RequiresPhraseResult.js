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
exports.RequiresPhraseResult = exports.RequiresPhraseFailureResult = exports.RequiresPhraseSuccessResult = void 0;
const type_graphql_1 = require("type-graphql");
const RequiresPhraseFailureType_1 = require("../../enums/RequiresPhraseFailureType");
let RequiresPhraseSuccessResult = class RequiresPhraseSuccessResult {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], RequiresPhraseSuccessResult.prototype, "value", void 0);
RequiresPhraseSuccessResult = __decorate([
    type_graphql_1.ObjectType()
], RequiresPhraseSuccessResult);
exports.RequiresPhraseSuccessResult = RequiresPhraseSuccessResult;
let RequiresPhraseFailureResult = class RequiresPhraseFailureResult {
};
__decorate([
    type_graphql_1.Field(() => RequiresPhraseFailureType_1.RequiresPhraseFailureType),
    __metadata("design:type", String)
], RequiresPhraseFailureResult.prototype, "failureType", void 0);
RequiresPhraseFailureResult = __decorate([
    type_graphql_1.ObjectType()
], RequiresPhraseFailureResult);
exports.RequiresPhraseFailureResult = RequiresPhraseFailureResult;
exports.RequiresPhraseResult = type_graphql_1.createUnionType({
    name: 'RequiresPhraseResult',
    types: () => [RequiresPhraseSuccessResult, RequiresPhraseFailureResult],
    resolveType: value => {
        if ('value' in value) {
            return RequiresPhraseSuccessResult;
        }
        if ('failureType' in value) {
            return RequiresPhraseFailureResult;
        }
        return undefined;
    }
});
