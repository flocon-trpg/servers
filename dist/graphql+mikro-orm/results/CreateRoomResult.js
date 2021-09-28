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
exports.CreateRoomResult = exports.CreateRoomFailureResult = exports.CreateRoomSuccessResult = void 0;
const type_graphql_1 = require("type-graphql");
const CreateRoomFailureType_1 = require("../../enums/CreateRoomFailureType");
const graphql_1 = require("../entities/room/graphql");
let CreateRoomSuccessResult = class CreateRoomSuccessResult {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], CreateRoomSuccessResult.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", graphql_1.RoomGetState)
], CreateRoomSuccessResult.prototype, "room", void 0);
CreateRoomSuccessResult = __decorate([
    (0, type_graphql_1.ObjectType)()
], CreateRoomSuccessResult);
exports.CreateRoomSuccessResult = CreateRoomSuccessResult;
let CreateRoomFailureResult = class CreateRoomFailureResult {
};
__decorate([
    (0, type_graphql_1.Field)(() => CreateRoomFailureType_1.CreateRoomFailureType),
    __metadata("design:type", String)
], CreateRoomFailureResult.prototype, "failureType", void 0);
CreateRoomFailureResult = __decorate([
    (0, type_graphql_1.ObjectType)()
], CreateRoomFailureResult);
exports.CreateRoomFailureResult = CreateRoomFailureResult;
exports.CreateRoomResult = (0, type_graphql_1.createUnionType)({
    name: 'CreateRoomResult',
    types: () => [CreateRoomSuccessResult, CreateRoomFailureResult],
    resolveType: value => {
        if ('room' in value) {
            return CreateRoomSuccessResult;
        }
        if ('failureType' in value) {
            return CreateRoomFailureResult;
        }
        return undefined;
    },
});
