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
exports.BoardsOperation = exports.UpdateBoardOperation = exports.ReplaceBoardOperation = exports.BoardOperation = exports.BoardState = exports.BoardValueState = void 0;
const type_graphql_1 = require("type-graphql");
const Operations_1 = require("../../../Operations");
const graphql_1 = require("../../filePath/graphql");
let BoardValueState = class BoardValueState {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], BoardValueState.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], BoardValueState.prototype, "cellWidth", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], BoardValueState.prototype, "cellHeight", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], BoardValueState.prototype, "cellRowCount", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], BoardValueState.prototype, "cellColumnCount", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], BoardValueState.prototype, "cellOffsetX", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], BoardValueState.prototype, "cellOffsetY", void 0);
__decorate([
    type_graphql_1.Field(() => graphql_1.FilePath, { nullable: true }),
    __metadata("design:type", graphql_1.FilePath)
], BoardValueState.prototype, "backgroundImage", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], BoardValueState.prototype, "backgroundImageZoom", void 0);
BoardValueState = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('BoardValueStateInput')
], BoardValueState);
exports.BoardValueState = BoardValueState;
let BoardState = class BoardState {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], BoardState.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], BoardState.prototype, "createdBy", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", BoardValueState)
], BoardState.prototype, "value", void 0);
BoardState = __decorate([
    type_graphql_1.ObjectType()
], BoardState);
exports.BoardState = BoardState;
let BoardOperation = class BoardOperation {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceStringUpOperation)
], BoardOperation.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNumberUpOperation)
], BoardOperation.prototype, "cellWidth", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNumberUpOperation)
], BoardOperation.prototype, "cellHeight", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNumberUpOperation)
], BoardOperation.prototype, "cellRowCount", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNumberUpOperation)
], BoardOperation.prototype, "cellColumnCount", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNumberUpOperation)
], BoardOperation.prototype, "cellOffsetX", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNumberUpOperation)
], BoardOperation.prototype, "cellOffsetY", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNullableFilePathUpOperation)
], BoardOperation.prototype, "backgroundImage", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNumberUpOperation)
], BoardOperation.prototype, "backgroundImageZoom", void 0);
BoardOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('BoardOperationInput')
], BoardOperation);
exports.BoardOperation = BoardOperation;
let ReplaceBoardOperation = class ReplaceBoardOperation {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ReplaceBoardOperation.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ReplaceBoardOperation.prototype, "createdBy", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", BoardValueState)
], ReplaceBoardOperation.prototype, "newValue", void 0);
ReplaceBoardOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('ReplaceBoardOperationInput')
], ReplaceBoardOperation);
exports.ReplaceBoardOperation = ReplaceBoardOperation;
let UpdateBoardOperation = class UpdateBoardOperation {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UpdateBoardOperation.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UpdateBoardOperation.prototype, "createdBy", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", BoardOperation)
], UpdateBoardOperation.prototype, "operation", void 0);
UpdateBoardOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('UpdateBoardOperationInput')
], UpdateBoardOperation);
exports.UpdateBoardOperation = UpdateBoardOperation;
let BoardsOperation = class BoardsOperation {
};
__decorate([
    type_graphql_1.Field(() => [ReplaceBoardOperation]),
    __metadata("design:type", Array)
], BoardsOperation.prototype, "replace", void 0);
__decorate([
    type_graphql_1.Field(() => [UpdateBoardOperation]),
    __metadata("design:type", Array)
], BoardsOperation.prototype, "update", void 0);
BoardsOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('BoardsOperationInput')
], BoardsOperation);
exports.BoardsOperation = BoardsOperation;
