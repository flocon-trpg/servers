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
exports.MyNumberValuesOperation = exports.UpdateMyNumberValueOperation = exports.ReplaceMyNumberValueOperation = exports.MyNumberValueOperation = exports.MyNumberValueState = exports.MyNumberValueStateValue = void 0;
const type_graphql_1 = require("type-graphql");
const Operations_1 = require("../../../../../Operations");
const graphql_1 = require("../../../../piece/graphql");
let MyNumberValueStateValue = class MyNumberValueStateValue {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], MyNumberValueStateValue.prototype, "isValuePrivate", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Number)
], MyNumberValueStateValue.prototype, "valueRangeMin", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Number)
], MyNumberValueStateValue.prototype, "valueRangeMax", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], MyNumberValueStateValue.prototype, "value", void 0);
__decorate([
    type_graphql_1.Field(() => [graphql_1.PieceState]),
    __metadata("design:type", Array)
], MyNumberValueStateValue.prototype, "pieces", void 0);
MyNumberValueStateValue = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('MyNumberValueStateValueInput')
], MyNumberValueStateValue);
exports.MyNumberValueStateValue = MyNumberValueStateValue;
let MyNumberValueState = class MyNumberValueState {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], MyNumberValueState.prototype, "stateId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", MyNumberValueStateValue)
], MyNumberValueState.prototype, "value", void 0);
MyNumberValueState = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('MyNumberValueStateInput')
], MyNumberValueState);
exports.MyNumberValueState = MyNumberValueState;
let MyNumberValueOperation = class MyNumberValueOperation {
};
__decorate([
    type_graphql_1.Field(() => Operations_1.ReplaceBooleanUpOperation, { nullable: true }),
    __metadata("design:type", Operations_1.ReplaceBooleanUpOperation)
], MyNumberValueOperation.prototype, "isValuePrivate", void 0);
__decorate([
    type_graphql_1.Field(() => Operations_1.ReplaceNullableNumberUpOperation, { nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNullableNumberUpOperation)
], MyNumberValueOperation.prototype, "valueRangeMin", void 0);
__decorate([
    type_graphql_1.Field(() => Operations_1.ReplaceNullableNumberUpOperation, { nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNullableNumberUpOperation)
], MyNumberValueOperation.prototype, "valueRangeMax", void 0);
__decorate([
    type_graphql_1.Field(() => Operations_1.ReplaceNumberUpOperation, { nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNumberUpOperation)
], MyNumberValueOperation.prototype, "value", void 0);
__decorate([
    type_graphql_1.Field(() => graphql_1.PiecesOperation),
    __metadata("design:type", graphql_1.PiecesOperation)
], MyNumberValueOperation.prototype, "pieces", void 0);
MyNumberValueOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('MyNumberValueOperationInput')
], MyNumberValueOperation);
exports.MyNumberValueOperation = MyNumberValueOperation;
let ReplaceMyNumberValueOperation = class ReplaceMyNumberValueOperation {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ReplaceMyNumberValueOperation.prototype, "stateId", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", MyNumberValueStateValue)
], ReplaceMyNumberValueOperation.prototype, "newValue", void 0);
ReplaceMyNumberValueOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('ReplaceMyNumberValueOperationInput')
], ReplaceMyNumberValueOperation);
exports.ReplaceMyNumberValueOperation = ReplaceMyNumberValueOperation;
let UpdateMyNumberValueOperation = class UpdateMyNumberValueOperation {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UpdateMyNumberValueOperation.prototype, "stateId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", MyNumberValueOperation)
], UpdateMyNumberValueOperation.prototype, "operation", void 0);
UpdateMyNumberValueOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('UpdateMyNumberValueOperationInput')
], UpdateMyNumberValueOperation);
exports.UpdateMyNumberValueOperation = UpdateMyNumberValueOperation;
let MyNumberValuesOperation = class MyNumberValuesOperation {
};
__decorate([
    type_graphql_1.Field(() => [ReplaceMyNumberValueOperation]),
    __metadata("design:type", Array)
], MyNumberValuesOperation.prototype, "replace", void 0);
__decorate([
    type_graphql_1.Field(() => [UpdateMyNumberValueOperation]),
    __metadata("design:type", Array)
], MyNumberValuesOperation.prototype, "update", void 0);
MyNumberValuesOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('MyNumberValuesOperationInput')
], MyNumberValuesOperation);
exports.MyNumberValuesOperation = MyNumberValuesOperation;
