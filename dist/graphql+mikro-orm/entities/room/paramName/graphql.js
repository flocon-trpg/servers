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
exports.ParamNamesOperation = exports.UpdateParamNameOperation = exports.ReplaceParamNameOperation = exports.ParamNameOperation = exports.ParamNameState = exports.ParamNameValueState = void 0;
const type_graphql_1 = require("type-graphql");
const RoomParameterNameType_1 = require("../../../../enums/RoomParameterNameType");
const Operations_1 = require("../../../Operations");
let ParamNameValueState = class ParamNameValueState {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ParamNameValueState.prototype, "name", void 0);
ParamNameValueState = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('ParamNameValueStateInput')
], ParamNameValueState);
exports.ParamNameValueState = ParamNameValueState;
let ParamNameState = class ParamNameState {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ParamNameState.prototype, "key", void 0);
__decorate([
    type_graphql_1.Field(() => RoomParameterNameType_1.RoomParameterNameType),
    __metadata("design:type", String)
], ParamNameState.prototype, "type", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", ParamNameValueState)
], ParamNameState.prototype, "value", void 0);
ParamNameState = __decorate([
    type_graphql_1.ObjectType()
], ParamNameState);
exports.ParamNameState = ParamNameState;
let ParamNameOperation = class ParamNameOperation {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceStringUpOperation)
], ParamNameOperation.prototype, "name", void 0);
ParamNameOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('ParamNameOperationInput')
], ParamNameOperation);
exports.ParamNameOperation = ParamNameOperation;
let ReplaceParamNameOperation = class ReplaceParamNameOperation {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ReplaceParamNameOperation.prototype, "key", void 0);
__decorate([
    type_graphql_1.Field(() => RoomParameterNameType_1.RoomParameterNameType),
    __metadata("design:type", String)
], ReplaceParamNameOperation.prototype, "type", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", ParamNameValueState)
], ReplaceParamNameOperation.prototype, "newValue", void 0);
ReplaceParamNameOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('ReplaceParamNameOperationInput')
], ReplaceParamNameOperation);
exports.ReplaceParamNameOperation = ReplaceParamNameOperation;
let UpdateParamNameOperation = class UpdateParamNameOperation {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UpdateParamNameOperation.prototype, "key", void 0);
__decorate([
    type_graphql_1.Field(() => RoomParameterNameType_1.RoomParameterNameType),
    __metadata("design:type", String)
], UpdateParamNameOperation.prototype, "type", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", ParamNameOperation)
], UpdateParamNameOperation.prototype, "operation", void 0);
UpdateParamNameOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('UpdateParamNameOperationInput')
], UpdateParamNameOperation);
exports.UpdateParamNameOperation = UpdateParamNameOperation;
let ParamNamesOperation = class ParamNamesOperation {
};
__decorate([
    type_graphql_1.Field(() => [ReplaceParamNameOperation]),
    __metadata("design:type", Array)
], ParamNamesOperation.prototype, "replace", void 0);
__decorate([
    type_graphql_1.Field(() => [UpdateParamNameOperation]),
    __metadata("design:type", Array)
], ParamNamesOperation.prototype, "update", void 0);
ParamNamesOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('ParamNamesOperationInput')
], ParamNamesOperation);
exports.ParamNamesOperation = ParamNamesOperation;
