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
exports.LeaveRoomResult = void 0;
const type_graphql_1 = require("type-graphql");
const LeaveRoomFailureType_1 = require("../../enums/LeaveRoomFailureType");
let LeaveRoomResult = class LeaveRoomResult {
};
__decorate([
    (0, type_graphql_1.Field)(() => LeaveRoomFailureType_1.LeaveRoomFailureType, { nullable: true }),
    __metadata("design:type", String)
], LeaveRoomResult.prototype, "failureType", void 0);
LeaveRoomResult = __decorate([
    (0, type_graphql_1.ObjectType)()
], LeaveRoomResult);
exports.LeaveRoomResult = LeaveRoomResult;
