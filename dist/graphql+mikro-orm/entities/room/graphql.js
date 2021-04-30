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
exports.DeleteRoomOperation = exports.deleteRoomOperation = exports.RoomOperationInput = exports.RoomOperation = exports.roomOperation = exports.OperatedBy = exports.RoomOperationValueInput = exports.RoomOperationValue = exports.RoomGetState = void 0;
const type_graphql_1 = require("type-graphql");
const Operations_1 = require("../../Operations");
const graphql_1 = require("./board/graphql");
const graphql_2 = require("./character/graphql");
const graphql_3 = require("./participant/graphql");
const graphql_4 = require("./bgm/graphql");
const graphql_5 = require("./paramName/graphql");
const class_validator_1 = require("class-validator");
let RoomGetState = class RoomGetState {
};
__decorate([
    type_graphql_1.Field({ description: 'Current revision of Room. Whenever Room is updated, this value is incremented by 1. This value is required when you apply RoomOperation. / Roomの現在のリビジョン。Roomが更新されるたび、この値は1増加する。RoomOperationを適用する際に必要となる。' }),
    __metadata("design:type", Number)
], RoomGetState.prototype, "revision", void 0);
__decorate([
    type_graphql_1.Field({ description: 'この部屋の作成者。Firebase AuthenticationのUserUidで表現される。' }),
    __metadata("design:type", String)
], RoomGetState.prototype, "createdBy", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], RoomGetState.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field(() => [graphql_1.BoardState]),
    __metadata("design:type", Array)
], RoomGetState.prototype, "boards", void 0);
__decorate([
    type_graphql_1.Field(() => [graphql_2.CharacterState]),
    __metadata("design:type", Array)
], RoomGetState.prototype, "characters", void 0);
__decorate([
    type_graphql_1.Field(() => [graphql_4.RoomBgmState]),
    __metadata("design:type", Array)
], RoomGetState.prototype, "bgms", void 0);
__decorate([
    type_graphql_1.Field(() => [graphql_5.ParamNameState]),
    __metadata("design:type", Array)
], RoomGetState.prototype, "paramNames", void 0);
__decorate([
    type_graphql_1.Field(() => [graphql_3.ParticipantState]),
    __metadata("design:type", Array)
], RoomGetState.prototype, "participants", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], RoomGetState.prototype, "publicChannel1Name", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], RoomGetState.prototype, "publicChannel2Name", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], RoomGetState.prototype, "publicChannel3Name", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], RoomGetState.prototype, "publicChannel4Name", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], RoomGetState.prototype, "publicChannel5Name", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], RoomGetState.prototype, "publicChannel6Name", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], RoomGetState.prototype, "publicChannel7Name", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], RoomGetState.prototype, "publicChannel8Name", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], RoomGetState.prototype, "publicChannel9Name", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], RoomGetState.prototype, "publicChannel10Name", void 0);
RoomGetState = __decorate([
    type_graphql_1.ObjectType()
], RoomGetState);
exports.RoomGetState = RoomGetState;
let RoomOperationValue = class RoomOperationValue {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", graphql_1.BoardsOperation)
], RoomOperationValue.prototype, "boards", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", graphql_2.CharactersOperation)
], RoomOperationValue.prototype, "characters", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", graphql_4.RoomBgmsOperation)
], RoomOperationValue.prototype, "bgms", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", graphql_5.ParamNamesOperation)
], RoomOperationValue.prototype, "paramNames", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", graphql_3.ParticipantsOperation)
], RoomOperationValue.prototype, "participants", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceStringUpOperation)
], RoomOperationValue.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceStringUpOperation)
], RoomOperationValue.prototype, "publicChannel1Name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceStringUpOperation)
], RoomOperationValue.prototype, "publicChannel2Name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceStringUpOperation)
], RoomOperationValue.prototype, "publicChannel3Name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceStringUpOperation)
], RoomOperationValue.prototype, "publicChannel4Name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceStringUpOperation)
], RoomOperationValue.prototype, "publicChannel5Name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceStringUpOperation)
], RoomOperationValue.prototype, "publicChannel6Name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceStringUpOperation)
], RoomOperationValue.prototype, "publicChannel7Name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceStringUpOperation)
], RoomOperationValue.prototype, "publicChannel8Name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceStringUpOperation)
], RoomOperationValue.prototype, "publicChannel9Name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceStringUpOperation)
], RoomOperationValue.prototype, "publicChannel10Name", void 0);
RoomOperationValue = __decorate([
    type_graphql_1.ObjectType()
], RoomOperationValue);
exports.RoomOperationValue = RoomOperationValue;
let RoomOperationValueInput = class RoomOperationValueInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", graphql_1.BoardsOperation)
], RoomOperationValueInput.prototype, "boards", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", graphql_2.CharactersOperation)
], RoomOperationValueInput.prototype, "characters", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", graphql_4.RoomBgmsOperation)
], RoomOperationValueInput.prototype, "bgms", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", graphql_5.ParamNamesOperation)
], RoomOperationValueInput.prototype, "paramNames", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", graphql_3.ParticipantsOperationInput)
], RoomOperationValueInput.prototype, "participants", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceStringUpOperation)
], RoomOperationValueInput.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceStringUpOperation)
], RoomOperationValueInput.prototype, "publicChannel1Name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceStringUpOperation)
], RoomOperationValueInput.prototype, "publicChannel2Name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceStringUpOperation)
], RoomOperationValueInput.prototype, "publicChannel3Name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceStringUpOperation)
], RoomOperationValueInput.prototype, "publicChannel4Name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceStringUpOperation)
], RoomOperationValueInput.prototype, "publicChannel5Name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceStringUpOperation)
], RoomOperationValueInput.prototype, "publicChannel6Name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceStringUpOperation)
], RoomOperationValueInput.prototype, "publicChannel7Name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceStringUpOperation)
], RoomOperationValueInput.prototype, "publicChannel8Name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceStringUpOperation)
], RoomOperationValueInput.prototype, "publicChannel9Name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceStringUpOperation)
], RoomOperationValueInput.prototype, "publicChannel10Name", void 0);
RoomOperationValueInput = __decorate([
    type_graphql_1.InputType()
], RoomOperationValueInput);
exports.RoomOperationValueInput = RoomOperationValueInput;
let OperatedBy = class OperatedBy {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], OperatedBy.prototype, "userUid", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], OperatedBy.prototype, "clientId", void 0);
OperatedBy = __decorate([
    type_graphql_1.ObjectType()
], OperatedBy);
exports.OperatedBy = OperatedBy;
exports.roomOperation = 'RoomOperation';
let RoomOperation = class RoomOperation {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], RoomOperation.prototype, "revisionTo", void 0);
__decorate([
    type_graphql_1.Field(() => OperatedBy, { nullable: true, description: 'operateRoomを呼んだ人物。promoteなどの結果の場合はnullishになる。' }),
    __metadata("design:type", OperatedBy)
], RoomOperation.prototype, "operatedBy", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", RoomOperationValue)
], RoomOperation.prototype, "value", void 0);
RoomOperation = __decorate([
    type_graphql_1.ObjectType()
], RoomOperation);
exports.RoomOperation = RoomOperation;
let RoomOperationInput = class RoomOperationInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", RoomOperationValueInput)
], RoomOperationInput.prototype, "value", void 0);
__decorate([
    type_graphql_1.Field({ description: 'クライアントを識別するID。適当なIDをクライアント側で生成して渡す。Operationごとに変える必要はない' }),
    class_validator_1.MaxLength(10),
    __metadata("design:type", String)
], RoomOperationInput.prototype, "clientId", void 0);
RoomOperationInput = __decorate([
    type_graphql_1.InputType()
], RoomOperationInput);
exports.RoomOperationInput = RoomOperationInput;
exports.deleteRoomOperation = 'DeleteRoomOperation';
let DeleteRoomOperation = class DeleteRoomOperation {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], DeleteRoomOperation.prototype, "deletedBy", void 0);
DeleteRoomOperation = __decorate([
    type_graphql_1.ObjectType()
], DeleteRoomOperation);
exports.DeleteRoomOperation = DeleteRoomOperation;
