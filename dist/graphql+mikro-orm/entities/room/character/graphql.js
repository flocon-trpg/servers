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
exports.CharactersOperation = exports.UpdateCharacterOperation = exports.ReplaceCharacterOperation = exports.CharacterOperation = exports.CharacterState = exports.CharacterValueState = void 0;
const type_graphql_1 = require("type-graphql");
const Operations_1 = require("../../../Operations");
const graphql_1 = require("./boolParam/graphql");
const graphql_2 = require("../../filePath/graphql");
const graphql_3 = require("./numParam/graphql");
const graphql_4 = require("../../piece/graphql");
const graphql_5 = require("./strParam/graphql");
const graphql_6 = require("../../boardLocation/graphql");
let CharacterValueState = class CharacterValueState {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], CharacterValueState.prototype, "isPrivate", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], CharacterValueState.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field(() => graphql_2.FilePath, { nullable: true }),
    __metadata("design:type", graphql_2.FilePath)
], CharacterValueState.prototype, "image", void 0);
__decorate([
    type_graphql_1.Field(() => graphql_2.FilePath, { nullable: true }),
    __metadata("design:type", graphql_2.FilePath)
], CharacterValueState.prototype, "tachieImage", void 0);
__decorate([
    type_graphql_1.Field(() => [graphql_1.BoolParamState]),
    __metadata("design:type", Array)
], CharacterValueState.prototype, "boolParams", void 0);
__decorate([
    type_graphql_1.Field(() => [graphql_3.NumParamState]),
    __metadata("design:type", Array)
], CharacterValueState.prototype, "numParams", void 0);
__decorate([
    type_graphql_1.Field(() => [graphql_3.NumParamState]),
    __metadata("design:type", Array)
], CharacterValueState.prototype, "numMaxParams", void 0);
__decorate([
    type_graphql_1.Field(() => [graphql_5.StrParamState]),
    __metadata("design:type", Array)
], CharacterValueState.prototype, "strParams", void 0);
__decorate([
    type_graphql_1.Field(() => [graphql_4.PieceState]),
    __metadata("design:type", Array)
], CharacterValueState.prototype, "pieces", void 0);
__decorate([
    type_graphql_1.Field(() => [graphql_6.BoardLocationState]),
    __metadata("design:type", Array)
], CharacterValueState.prototype, "tachieLocations", void 0);
CharacterValueState = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('CharacterValueStateInput')
], CharacterValueState);
exports.CharacterValueState = CharacterValueState;
let CharacterState = class CharacterState {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], CharacterState.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], CharacterState.prototype, "createdBy", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", CharacterValueState)
], CharacterState.prototype, "value", void 0);
CharacterState = __decorate([
    type_graphql_1.ObjectType()
], CharacterState);
exports.CharacterState = CharacterState;
let CharacterOperation = class CharacterOperation {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceBooleanUpOperation)
], CharacterOperation.prototype, "isPrivate", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceStringUpOperation)
], CharacterOperation.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNullableFilePathUpOperation)
], CharacterOperation.prototype, "image", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNullableFilePathUpOperation)
], CharacterOperation.prototype, "tachieImage", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", graphql_1.BoolParamsOperation)
], CharacterOperation.prototype, "boolParams", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", graphql_3.NumParamsOperation)
], CharacterOperation.prototype, "numParams", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", graphql_3.NumParamsOperation)
], CharacterOperation.prototype, "numMaxParams", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", graphql_5.StrParamsOperation)
], CharacterOperation.prototype, "strParams", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", graphql_4.PiecesOperation)
], CharacterOperation.prototype, "pieces", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", graphql_6.BoardLocationsOperation)
], CharacterOperation.prototype, "tachieLocations", void 0);
CharacterOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('CharacterOperationInput')
], CharacterOperation);
exports.CharacterOperation = CharacterOperation;
let ReplaceCharacterOperation = class ReplaceCharacterOperation {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ReplaceCharacterOperation.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ReplaceCharacterOperation.prototype, "createdBy", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", CharacterValueState)
], ReplaceCharacterOperation.prototype, "newValue", void 0);
ReplaceCharacterOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('ReplaceCharacterOperationInput')
], ReplaceCharacterOperation);
exports.ReplaceCharacterOperation = ReplaceCharacterOperation;
let UpdateCharacterOperation = class UpdateCharacterOperation {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UpdateCharacterOperation.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UpdateCharacterOperation.prototype, "createdBy", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", CharacterOperation)
], UpdateCharacterOperation.prototype, "operation", void 0);
UpdateCharacterOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('UpdateCharacterOperationInput')
], UpdateCharacterOperation);
exports.UpdateCharacterOperation = UpdateCharacterOperation;
let CharactersOperation = class CharactersOperation {
};
__decorate([
    type_graphql_1.Field(() => [ReplaceCharacterOperation]),
    __metadata("design:type", Array)
], CharactersOperation.prototype, "replace", void 0);
__decorate([
    type_graphql_1.Field(() => [UpdateCharacterOperation]),
    __metadata("design:type", Array)
], CharactersOperation.prototype, "update", void 0);
CharactersOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('CharactersOperationInput')
], CharactersOperation);
exports.CharactersOperation = CharactersOperation;
