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
exports.ListAvailableGameSystemsResult = exports.AvailableGameSystem = void 0;
const type_graphql_1 = require("type-graphql");
let AvailableGameSystem = class AvailableGameSystem {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], AvailableGameSystem.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], AvailableGameSystem.prototype, "sortKey", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], AvailableGameSystem.prototype, "name", void 0);
AvailableGameSystem = __decorate([
    type_graphql_1.ObjectType()
], AvailableGameSystem);
exports.AvailableGameSystem = AvailableGameSystem;
let ListAvailableGameSystemsResult = class ListAvailableGameSystemsResult {
};
__decorate([
    type_graphql_1.Field(() => [AvailableGameSystem]),
    __metadata("design:type", Array)
], ListAvailableGameSystemsResult.prototype, "value", void 0);
ListAvailableGameSystemsResult = __decorate([
    type_graphql_1.ObjectType()
], ListAvailableGameSystemsResult);
exports.ListAvailableGameSystemsResult = ListAvailableGameSystemsResult;
