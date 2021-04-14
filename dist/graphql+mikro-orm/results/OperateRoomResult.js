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
exports.OperateRoomResult = exports.OperateRoomFailureResult = exports.OperateRoomNonJoinedResult = exports.OperateRoomIdResult = exports.OperateRoomSuccessResult = void 0;
const type_graphql_1 = require("type-graphql");
const OperateRoomFailureType_1 = require("../../enums/OperateRoomFailureType");
const graphql_1 = require("../entities/room/graphql");
const graphql_2 = require("../entities/roomAsListItem/graphql");
let OperateRoomSuccessResult = class OperateRoomSuccessResult {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", graphql_1.RoomOperation)
], OperateRoomSuccessResult.prototype, "operation", void 0);
OperateRoomSuccessResult = __decorate([
    type_graphql_1.ObjectType()
], OperateRoomSuccessResult);
exports.OperateRoomSuccessResult = OperateRoomSuccessResult;
let OperateRoomIdResult = class OperateRoomIdResult {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], OperateRoomIdResult.prototype, "requestId", void 0);
OperateRoomIdResult = __decorate([
    type_graphql_1.ObjectType()
], OperateRoomIdResult);
exports.OperateRoomIdResult = OperateRoomIdResult;
let OperateRoomNonJoinedResult = class OperateRoomNonJoinedResult {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", graphql_2.RoomAsListItem)
], OperateRoomNonJoinedResult.prototype, "roomAsListItem", void 0);
OperateRoomNonJoinedResult = __decorate([
    type_graphql_1.ObjectType()
], OperateRoomNonJoinedResult);
exports.OperateRoomNonJoinedResult = OperateRoomNonJoinedResult;
let OperateRoomFailureResult = class OperateRoomFailureResult {
};
__decorate([
    type_graphql_1.Field(() => OperateRoomFailureType_1.OperateRoomFailureType),
    __metadata("design:type", String)
], OperateRoomFailureResult.prototype, "failureType", void 0);
OperateRoomFailureResult = __decorate([
    type_graphql_1.ObjectType()
], OperateRoomFailureResult);
exports.OperateRoomFailureResult = OperateRoomFailureResult;
exports.OperateRoomResult = type_graphql_1.createUnionType({
    name: 'OperateRoomResult',
    types: () => [OperateRoomSuccessResult, OperateRoomFailureResult, OperateRoomNonJoinedResult, OperateRoomIdResult],
    resolveType: value => {
        if ('operation' in value) {
            return OperateRoomSuccessResult;
        }
        if ('failureType' in value) {
            return OperateRoomFailureResult;
        }
        if ('roomAsListItem' in value) {
            return OperateRoomNonJoinedResult;
        }
        if ('requestId' in value) {
            return OperateRoomIdResult;
        }
        return undefined;
    }
});
