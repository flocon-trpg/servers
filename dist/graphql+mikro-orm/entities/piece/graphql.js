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
exports.PiecesOperation = exports.UpdatePieceOperation = exports.ReplacePieceOperation = exports.PieceOperation = exports.PieceState = exports.PieceValueState = void 0;
const type_graphql_1 = require("type-graphql");
const Operations_1 = require("../../Operations");
let PieceValueState = class PieceValueState {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], PieceValueState.prototype, "isPrivate", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], PieceValueState.prototype, "isCellMode", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], PieceValueState.prototype, "x", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], PieceValueState.prototype, "y", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], PieceValueState.prototype, "w", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], PieceValueState.prototype, "h", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], PieceValueState.prototype, "cellX", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], PieceValueState.prototype, "cellY", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], PieceValueState.prototype, "cellW", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], PieceValueState.prototype, "cellH", void 0);
PieceValueState = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('PieceValueStateInput')
], PieceValueState);
exports.PieceValueState = PieceValueState;
let PieceState = class PieceState {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], PieceState.prototype, "boardId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], PieceState.prototype, "boardCreatedBy", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", PieceValueState)
], PieceState.prototype, "value", void 0);
PieceState = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('PieceStateInput')
], PieceState);
exports.PieceState = PieceState;
let PieceOperation = class PieceOperation {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceBooleanUpOperation)
], PieceOperation.prototype, "isPrivate", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceBooleanUpOperation)
], PieceOperation.prototype, "isCellMode", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNumberUpOperation)
], PieceOperation.prototype, "x", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNumberUpOperation)
], PieceOperation.prototype, "y", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNumberUpOperation)
], PieceOperation.prototype, "w", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNumberUpOperation)
], PieceOperation.prototype, "h", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNumberUpOperation)
], PieceOperation.prototype, "cellX", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNumberUpOperation)
], PieceOperation.prototype, "cellY", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNumberUpOperation)
], PieceOperation.prototype, "cellW", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNumberUpOperation)
], PieceOperation.prototype, "cellH", void 0);
PieceOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('PieceOperationInput')
], PieceOperation);
exports.PieceOperation = PieceOperation;
let ReplacePieceOperation = class ReplacePieceOperation {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ReplacePieceOperation.prototype, "boardId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ReplacePieceOperation.prototype, "boardCreatedBy", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", PieceValueState)
], ReplacePieceOperation.prototype, "newValue", void 0);
ReplacePieceOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('ReplacePieceOperationInput')
], ReplacePieceOperation);
exports.ReplacePieceOperation = ReplacePieceOperation;
let UpdatePieceOperation = class UpdatePieceOperation {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UpdatePieceOperation.prototype, "boardId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UpdatePieceOperation.prototype, "boardCreatedBy", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", PieceOperation)
], UpdatePieceOperation.prototype, "operation", void 0);
UpdatePieceOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('UpdatePieceOperationInput')
], UpdatePieceOperation);
exports.UpdatePieceOperation = UpdatePieceOperation;
let PiecesOperation = class PiecesOperation {
};
__decorate([
    type_graphql_1.Field(() => [ReplacePieceOperation]),
    __metadata("design:type", Array)
], PiecesOperation.prototype, "replace", void 0);
__decorate([
    type_graphql_1.Field(() => [UpdatePieceOperation]),
    __metadata("design:type", Array)
], PiecesOperation.prototype, "update", void 0);
PiecesOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('PiecesOperationInput')
], PiecesOperation);
exports.PiecesOperation = PiecesOperation;
