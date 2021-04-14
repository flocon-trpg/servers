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
exports.StrParamsOperation = exports.UpdateStrParamOperation = exports.StrParamOperation = exports.StrParamState = exports.StrParamValueState = void 0;
const type_graphql_1 = require("type-graphql");
const Operations_1 = require("../../../../Operations");
let StrParamValueState = class StrParamValueState {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], StrParamValueState.prototype, "isValuePrivate", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], StrParamValueState.prototype, "value", void 0);
StrParamValueState = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('StrParamValueStateInput')
], StrParamValueState);
exports.StrParamValueState = StrParamValueState;
let StrParamState = class StrParamState {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], StrParamState.prototype, "key", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", StrParamValueState)
], StrParamState.prototype, "value", void 0);
StrParamState = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('StrParamStateInput')
], StrParamState);
exports.StrParamState = StrParamState;
let StrParamOperation = class StrParamOperation {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceBooleanUpOperation)
], StrParamOperation.prototype, "isValuePrivate", void 0);
__decorate([
    type_graphql_1.Field(() => [Operations_1.TextUpOperationUnit], { nullable: true }),
    __metadata("design:type", Array)
], StrParamOperation.prototype, "value", void 0);
StrParamOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('StrParamOperationInput')
], StrParamOperation);
exports.StrParamOperation = StrParamOperation;
let UpdateStrParamOperation = class UpdateStrParamOperation {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UpdateStrParamOperation.prototype, "key", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", StrParamOperation)
], UpdateStrParamOperation.prototype, "operation", void 0);
UpdateStrParamOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('UpdateStrParamOperationInput')
], UpdateStrParamOperation);
exports.UpdateStrParamOperation = UpdateStrParamOperation;
let StrParamsOperation = class StrParamsOperation {
};
__decorate([
    type_graphql_1.Field(() => [UpdateStrParamOperation]),
    __metadata("design:type", Array)
], StrParamsOperation.prototype, "update", void 0);
StrParamsOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('StrParamsOperationInput')
], StrParamsOperation);
exports.StrParamsOperation = StrParamsOperation;
