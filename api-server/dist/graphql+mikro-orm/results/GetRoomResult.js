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
exports.GetRoomResult = exports.GetRoomFailureResult = exports.GetNonJoinedRoomResult = exports.GetJoinedRoomResult = void 0;
const type_graphql_1 = require("type-graphql");
const GetRoomFailureType_1 = require("../../enums/GetRoomFailureType");
const ParticipantRole_1 = require("../../enums/ParticipantRole");
const graphql_1 = require("../entities/room/graphql");
const graphql_2 = require("../entities/roomAsListItem/graphql");
let GetJoinedRoomResult = class GetJoinedRoomResult {
};
__decorate([
    (0, type_graphql_1.Field)(() => ParticipantRole_1.ParticipantRole, { description: '自分の現在のParticipantRole。' }),
    __metadata("design:type", String)
], GetJoinedRoomResult.prototype, "role", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", graphql_1.RoomGetState)
], GetJoinedRoomResult.prototype, "room", void 0);
GetJoinedRoomResult = __decorate([
    (0, type_graphql_1.ObjectType)()
], GetJoinedRoomResult);
exports.GetJoinedRoomResult = GetJoinedRoomResult;
let GetNonJoinedRoomResult = class GetNonJoinedRoomResult {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", graphql_2.RoomAsListItem)
], GetNonJoinedRoomResult.prototype, "roomAsListItem", void 0);
GetNonJoinedRoomResult = __decorate([
    (0, type_graphql_1.ObjectType)()
], GetNonJoinedRoomResult);
exports.GetNonJoinedRoomResult = GetNonJoinedRoomResult;
let GetRoomFailureResult = class GetRoomFailureResult {
};
__decorate([
    (0, type_graphql_1.Field)(() => GetRoomFailureType_1.GetRoomFailureType),
    __metadata("design:type", String)
], GetRoomFailureResult.prototype, "failureType", void 0);
GetRoomFailureResult = __decorate([
    (0, type_graphql_1.ObjectType)()
], GetRoomFailureResult);
exports.GetRoomFailureResult = GetRoomFailureResult;
exports.GetRoomResult = (0, type_graphql_1.createUnionType)({
    name: 'GetRoomResult',
    types: () => [GetJoinedRoomResult, GetNonJoinedRoomResult, GetRoomFailureResult],
    resolveType: value => {
        if ('room' in value) {
            return GetJoinedRoomResult;
        }
        if ('roomAsListItem' in value) {
            return GetNonJoinedRoomResult;
        }
        if ('failureType' in value) {
            return GetRoomFailureResult;
        }
        return undefined;
    },
});
