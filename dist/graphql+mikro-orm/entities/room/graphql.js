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
exports.DeleteRoomOperation = exports.deleteRoomOperation = exports.RoomOperationInput = exports.RoomOperation = exports.roomOperation = exports.OperatedBy = exports.RoomGetState = void 0;
const type_graphql_1 = require("type-graphql");
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
    type_graphql_1.Field({ description: 'room.state をJSON化したもの' }),
    __metadata("design:type", String)
], RoomGetState.prototype, "stateJson", void 0);
RoomGetState = __decorate([
    type_graphql_1.ObjectType()
], RoomGetState);
exports.RoomGetState = RoomGetState;
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
    type_graphql_1.Field({ description: 'room.upOperationをJSONにしたもの。idならばnullish。' }),
    __metadata("design:type", String)
], RoomOperation.prototype, "valueJson", void 0);
RoomOperation = __decorate([
    type_graphql_1.ObjectType()
], RoomOperation);
exports.RoomOperation = RoomOperation;
let RoomOperationInput = class RoomOperationInput {
};
__decorate([
    type_graphql_1.Field({ description: 'room.upOperationをJSONにしたもの' }),
    __metadata("design:type", String)
], RoomOperationInput.prototype, "valueJson", void 0);
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
