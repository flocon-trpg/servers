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
exports.BoolParamsOperation = exports.UpdateBoolParamOperation = exports.BoolParamOperation = exports.BoolParamState = exports.BoolParamValueState = void 0;
const type_graphql_1 = require("type-graphql");
const Operations_1 = require("../../../../Operations");
let BoolParamValueState = class BoolParamValueState {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], BoolParamValueState.prototype, "isValuePrivate", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Boolean)
], BoolParamValueState.prototype, "value", void 0);
BoolParamValueState = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('BoolParamValueStateInput')
], BoolParamValueState);
exports.BoolParamValueState = BoolParamValueState;
let BoolParamState = class BoolParamState {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], BoolParamState.prototype, "key", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", BoolParamValueState)
], BoolParamState.prototype, "value", void 0);
BoolParamState = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('BoolParamStateInput')
], BoolParamState);
exports.BoolParamState = BoolParamState;
let BoolParamOperation = class BoolParamOperation {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceBooleanUpOperation)
], BoolParamOperation.prototype, "isValuePrivate", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNullableBooleanUpOperation)
], BoolParamOperation.prototype, "value", void 0);
BoolParamOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('BoolParamOperationInput')
], BoolParamOperation);
exports.BoolParamOperation = BoolParamOperation;
let UpdateBoolParamOperation = class UpdateBoolParamOperation {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UpdateBoolParamOperation.prototype, "key", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", BoolParamOperation)
], UpdateBoolParamOperation.prototype, "operation", void 0);
UpdateBoolParamOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('UpdateBoolParamOperationInput')
], UpdateBoolParamOperation);
exports.UpdateBoolParamOperation = UpdateBoolParamOperation;
let BoolParamsOperation = class BoolParamsOperation {
};
__decorate([
    type_graphql_1.Field(() => [UpdateBoolParamOperation]),
    __metadata("design:type", Array)
], BoolParamsOperation.prototype, "update", void 0);
BoolParamsOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('BoolParamsOperationInput')
], BoolParamsOperation);
exports.BoolParamsOperation = BoolParamsOperation;
