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
exports.NumParamsOperation = exports.UpdateNumParamOperation = exports.NumParamOperation = exports.NumParamState = exports.NumParamValueState = void 0;
const type_graphql_1 = require("type-graphql");
const Operations_1 = require("../../../../Operations");
let NumParamValueState = class NumParamValueState {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], NumParamValueState.prototype, "isValuePrivate", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Number)
], NumParamValueState.prototype, "value", void 0);
NumParamValueState = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('NumParamValueStateInput')
], NumParamValueState);
exports.NumParamValueState = NumParamValueState;
let NumParamState = class NumParamState {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], NumParamState.prototype, "key", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", NumParamValueState)
], NumParamState.prototype, "value", void 0);
NumParamState = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('NumParamStateInput')
], NumParamState);
exports.NumParamState = NumParamState;
let NumParamOperation = class NumParamOperation {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceBooleanUpOperation)
], NumParamOperation.prototype, "isValuePrivate", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNullableNumberUpOperation)
], NumParamOperation.prototype, "value", void 0);
NumParamOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('NumParamOperationInput')
], NumParamOperation);
exports.NumParamOperation = NumParamOperation;
let UpdateNumParamOperation = class UpdateNumParamOperation {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UpdateNumParamOperation.prototype, "key", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", NumParamOperation)
], UpdateNumParamOperation.prototype, "operation", void 0);
UpdateNumParamOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('UpdateNumParamOperationInput')
], UpdateNumParamOperation);
exports.UpdateNumParamOperation = UpdateNumParamOperation;
let NumParamsOperation = class NumParamsOperation {
};
__decorate([
    type_graphql_1.Field(() => [UpdateNumParamOperation]),
    __metadata("design:type", Array)
], NumParamsOperation.prototype, "update", void 0);
NumParamsOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('NumParamsOperationInput')
], NumParamsOperation);
exports.NumParamsOperation = NumParamsOperation;
