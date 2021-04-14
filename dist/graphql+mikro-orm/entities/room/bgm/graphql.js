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
exports.RoomBgmsOperation = exports.UpdateRoomBgmOperation = exports.ReplaceRoomBgmOperation = exports.RoomBgmOperation = exports.RoomBgmState = exports.RoomBgmValueState = void 0;
const type_graphql_1 = require("type-graphql");
const Operations_1 = require("../../../Operations");
const graphql_1 = require("../../filePath/graphql");
let RoomBgmValueState = class RoomBgmValueState {
};
__decorate([
    type_graphql_1.Field(() => [graphql_1.FilePath]),
    __metadata("design:type", Array)
], RoomBgmValueState.prototype, "files", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], RoomBgmValueState.prototype, "volume", void 0);
RoomBgmValueState = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('RoomBgmValueStateInput')
], RoomBgmValueState);
exports.RoomBgmValueState = RoomBgmValueState;
let RoomBgmState = class RoomBgmState {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], RoomBgmState.prototype, "channelKey", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", RoomBgmValueState)
], RoomBgmState.prototype, "value", void 0);
RoomBgmState = __decorate([
    type_graphql_1.ObjectType()
], RoomBgmState);
exports.RoomBgmState = RoomBgmState;
let RoomBgmOperation = class RoomBgmOperation {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceFilePathArrayUpOperation)
], RoomBgmOperation.prototype, "files", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Operations_1.ReplaceNumberUpOperation)
], RoomBgmOperation.prototype, "volume", void 0);
RoomBgmOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('RoomBgmOperationInput')
], RoomBgmOperation);
exports.RoomBgmOperation = RoomBgmOperation;
let ReplaceRoomBgmOperation = class ReplaceRoomBgmOperation {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ReplaceRoomBgmOperation.prototype, "channelKey", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", RoomBgmValueState)
], ReplaceRoomBgmOperation.prototype, "newValue", void 0);
ReplaceRoomBgmOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('ReplaceRoomBgmOperationInput')
], ReplaceRoomBgmOperation);
exports.ReplaceRoomBgmOperation = ReplaceRoomBgmOperation;
let UpdateRoomBgmOperation = class UpdateRoomBgmOperation {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UpdateRoomBgmOperation.prototype, "channelKey", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", RoomBgmOperation)
], UpdateRoomBgmOperation.prototype, "operation", void 0);
UpdateRoomBgmOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('UpdateRoomBgmOperationInput')
], UpdateRoomBgmOperation);
exports.UpdateRoomBgmOperation = UpdateRoomBgmOperation;
let RoomBgmsOperation = class RoomBgmsOperation {
};
__decorate([
    type_graphql_1.Field(() => [ReplaceRoomBgmOperation]),
    __metadata("design:type", Array)
], RoomBgmsOperation.prototype, "replace", void 0);
__decorate([
    type_graphql_1.Field(() => [UpdateRoomBgmOperation]),
    __metadata("design:type", Array)
], RoomBgmsOperation.prototype, "update", void 0);
RoomBgmsOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('RoomBgmsOperationInput')
], RoomBgmsOperation);
exports.RoomBgmsOperation = RoomBgmsOperation;
