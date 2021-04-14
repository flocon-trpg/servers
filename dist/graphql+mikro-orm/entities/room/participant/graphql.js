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
exports.ParticipantsOperationInput = exports.ParticipantsOperation = exports.UpdateParticipantOperationInput = exports.UpdateParticipantOperation = exports.ReplaceParticipantOperation = exports.ParticipantOperationInput = exports.ParticipantOperation = exports.ParticipantState = exports.ParticipantValueState = void 0;
const type_graphql_1 = require("type-graphql");
const ParticipantRole_1 = require("../../../../enums/ParticipantRole");
const Operations_1 = require("../../../Operations");
const graphql_1 = require("./myValue/number/graphql");
let ParticipantValueState = class ParticipantValueState {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ParticipantValueState.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field(() => ParticipantRole_1.ParticipantRole, { nullable: true }),
    __metadata("design:type", String)
], ParticipantValueState.prototype, "role", void 0);
__decorate([
    type_graphql_1.Field(() => [graphql_1.MyNumberValueState]),
    __metadata("design:type", Array)
], ParticipantValueState.prototype, "myNumberValues", void 0);
ParticipantValueState = __decorate([
    type_graphql_1.ObjectType()
], ParticipantValueState);
exports.ParticipantValueState = ParticipantValueState;
let ParticipantState = class ParticipantState {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ParticipantState.prototype, "userUid", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", ParticipantValueState)
], ParticipantState.prototype, "value", void 0);
ParticipantState = __decorate([
    type_graphql_1.ObjectType()
], ParticipantState);
exports.ParticipantState = ParticipantState;
let ParticipantOperation = class ParticipantOperation {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceStringUpOperation)
], ParticipantOperation.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNullableParticipantRoleUpOperation)
], ParticipantOperation.prototype, "role", void 0);
__decorate([
    type_graphql_1.Field(() => graphql_1.MyNumberValuesOperation),
    __metadata("design:type", graphql_1.MyNumberValuesOperation)
], ParticipantOperation.prototype, "myNumberValues", void 0);
ParticipantOperation = __decorate([
    type_graphql_1.ObjectType()
], ParticipantOperation);
exports.ParticipantOperation = ParticipantOperation;
let ParticipantOperationInput = class ParticipantOperationInput {
};
__decorate([
    type_graphql_1.Field(() => graphql_1.MyNumberValuesOperation),
    __metadata("design:type", graphql_1.MyNumberValuesOperation)
], ParticipantOperationInput.prototype, "myNumberValues", void 0);
ParticipantOperationInput = __decorate([
    type_graphql_1.InputType()
], ParticipantOperationInput);
exports.ParticipantOperationInput = ParticipantOperationInput;
let ReplaceParticipantOperation = class ReplaceParticipantOperation {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ReplaceParticipantOperation.prototype, "userUid", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", ParticipantValueState)
], ReplaceParticipantOperation.prototype, "newValue", void 0);
ReplaceParticipantOperation = __decorate([
    type_graphql_1.ObjectType()
], ReplaceParticipantOperation);
exports.ReplaceParticipantOperation = ReplaceParticipantOperation;
let UpdateParticipantOperation = class UpdateParticipantOperation {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UpdateParticipantOperation.prototype, "userUid", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", ParticipantOperation)
], UpdateParticipantOperation.prototype, "operation", void 0);
UpdateParticipantOperation = __decorate([
    type_graphql_1.ObjectType()
], UpdateParticipantOperation);
exports.UpdateParticipantOperation = UpdateParticipantOperation;
let UpdateParticipantOperationInput = class UpdateParticipantOperationInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UpdateParticipantOperationInput.prototype, "userUid", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", ParticipantOperationInput)
], UpdateParticipantOperationInput.prototype, "operation", void 0);
UpdateParticipantOperationInput = __decorate([
    type_graphql_1.InputType()
], UpdateParticipantOperationInput);
exports.UpdateParticipantOperationInput = UpdateParticipantOperationInput;
let ParticipantsOperation = class ParticipantsOperation {
};
__decorate([
    type_graphql_1.Field(() => [ReplaceParticipantOperation]),
    __metadata("design:type", Array)
], ParticipantsOperation.prototype, "replace", void 0);
__decorate([
    type_graphql_1.Field(() => [UpdateParticipantOperation]),
    __metadata("design:type", Array)
], ParticipantsOperation.prototype, "update", void 0);
ParticipantsOperation = __decorate([
    type_graphql_1.ObjectType()
], ParticipantsOperation);
exports.ParticipantsOperation = ParticipantsOperation;
let ParticipantsOperationInput = class ParticipantsOperationInput {
};
__decorate([
    type_graphql_1.Field(() => [UpdateParticipantOperationInput]),
    __metadata("design:type", Array)
], ParticipantsOperationInput.prototype, "update", void 0);
ParticipantsOperationInput = __decorate([
    type_graphql_1.InputType()
], ParticipantsOperationInput);
exports.ParticipantsOperationInput = ParticipantsOperationInput;
