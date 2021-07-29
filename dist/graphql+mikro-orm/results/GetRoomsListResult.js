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
exports.GetRoomsListResult = exports.GetRoomsListFailureResult = exports.GetRoomsListSuccessResult = void 0;
const type_graphql_1 = require("type-graphql");
const GetRoomsListFailureType_1 = require("../../enums/GetRoomsListFailureType");
const graphql_1 = require("../entities/roomAsListItem/graphql");
let GetRoomsListSuccessResult = class GetRoomsListSuccessResult {
};
__decorate([
    type_graphql_1.Field(() => [graphql_1.RoomAsListItem]),
    __metadata("design:type", Array)
], GetRoomsListSuccessResult.prototype, "rooms", void 0);
GetRoomsListSuccessResult = __decorate([
    type_graphql_1.ObjectType()
], GetRoomsListSuccessResult);
exports.GetRoomsListSuccessResult = GetRoomsListSuccessResult;
let GetRoomsListFailureResult = class GetRoomsListFailureResult {
};
__decorate([
    type_graphql_1.Field(() => GetRoomsListFailureType_1.GetRoomsListFailureType),
    __metadata("design:type", String)
], GetRoomsListFailureResult.prototype, "failureType", void 0);
GetRoomsListFailureResult = __decorate([
    type_graphql_1.ObjectType()
], GetRoomsListFailureResult);
exports.GetRoomsListFailureResult = GetRoomsListFailureResult;
exports.GetRoomsListResult = type_graphql_1.createUnionType({
    name: 'GetRoomsListResult',
    types: () => [GetRoomsListSuccessResult, GetRoomsListFailureResult],
    resolveType: value => {
        if ('rooms' in value) {
            return GetRoomsListSuccessResult;
        }
        if ('failureType' in value) {
            return GetRoomsListFailureResult;
        }
        return undefined;
    },
});
