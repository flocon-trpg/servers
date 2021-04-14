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
exports.BoardLocationsOperation = exports.UpdateBoardLocationOperation = exports.ReplaceBoardLocationOperation = exports.BoardLocationOperation = exports.BoardLocationState = exports.BoardLocationValueState = void 0;
const type_graphql_1 = require("type-graphql");
const Operations_1 = require("../../Operations");
let BoardLocationValueState = class BoardLocationValueState {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], BoardLocationValueState.prototype, "isPrivate", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], BoardLocationValueState.prototype, "x", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], BoardLocationValueState.prototype, "y", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], BoardLocationValueState.prototype, "w", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], BoardLocationValueState.prototype, "h", void 0);
BoardLocationValueState = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('BoardLocationValueStateInput')
], BoardLocationValueState);
exports.BoardLocationValueState = BoardLocationValueState;
let BoardLocationState = class BoardLocationState {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], BoardLocationState.prototype, "boardId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], BoardLocationState.prototype, "boardCreatedBy", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", BoardLocationValueState)
], BoardLocationState.prototype, "value", void 0);
BoardLocationState = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('BoardLocationStateInput')
], BoardLocationState);
exports.BoardLocationState = BoardLocationState;
let BoardLocationOperation = class BoardLocationOperation {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceBooleanUpOperation)
], BoardLocationOperation.prototype, "isPrivate", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNumberUpOperation)
], BoardLocationOperation.prototype, "x", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNumberUpOperation)
], BoardLocationOperation.prototype, "y", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNumberUpOperation)
], BoardLocationOperation.prototype, "w", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNumberUpOperation)
], BoardLocationOperation.prototype, "h", void 0);
BoardLocationOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('BoardLocationOperationInput')
], BoardLocationOperation);
exports.BoardLocationOperation = BoardLocationOperation;
let ReplaceBoardLocationOperation = class ReplaceBoardLocationOperation {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ReplaceBoardLocationOperation.prototype, "boardId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ReplaceBoardLocationOperation.prototype, "boardCreatedBy", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", BoardLocationValueState)
], ReplaceBoardLocationOperation.prototype, "newValue", void 0);
ReplaceBoardLocationOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('ReplaceBoardLocationOperationInput')
], ReplaceBoardLocationOperation);
exports.ReplaceBoardLocationOperation = ReplaceBoardLocationOperation;
let UpdateBoardLocationOperation = class UpdateBoardLocationOperation {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UpdateBoardLocationOperation.prototype, "boardId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UpdateBoardLocationOperation.prototype, "boardCreatedBy", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", BoardLocationOperation)
], UpdateBoardLocationOperation.prototype, "operation", void 0);
UpdateBoardLocationOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('UpdateBoardLocationOperationInput')
], UpdateBoardLocationOperation);
exports.UpdateBoardLocationOperation = UpdateBoardLocationOperation;
let BoardLocationsOperation = class BoardLocationsOperation {
};
__decorate([
    type_graphql_1.Field(() => [ReplaceBoardLocationOperation]),
    __metadata("design:type", Array)
], BoardLocationsOperation.prototype, "replace", void 0);
__decorate([
    type_graphql_1.Field(() => [UpdateBoardLocationOperation]),
    __metadata("design:type", Array)
], BoardLocationsOperation.prototype, "update", void 0);
BoardLocationsOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('BoardLocationsOperationInput')
], BoardLocationsOperation);
exports.BoardLocationsOperation = BoardLocationsOperation;
