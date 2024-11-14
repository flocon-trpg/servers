'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');
var messageAnalyzer = require('../../utils/messageAnalyzer.js');

let AvailableGameSystem = class AvailableGameSystem {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], AvailableGameSystem.prototype, "id", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], AvailableGameSystem.prototype, "sortKey", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], AvailableGameSystem.prototype, "name", void 0);
AvailableGameSystem = tslib.__decorate([
    typeGraphql.ObjectType()
], AvailableGameSystem);
let GetAvailableGameSystemsResult = class GetAvailableGameSystemsResult {
};
tslib.__decorate([
    typeGraphql.Field(() => [AvailableGameSystem]),
    tslib.__metadata("design:type", Array)
], GetAvailableGameSystemsResult.prototype, "value", void 0);
GetAvailableGameSystemsResult = tslib.__decorate([
    typeGraphql.ObjectType()
], GetAvailableGameSystemsResult);
exports.GetAvailableGameSystemsResolver = class GetAvailableGameSystemsResolver {
    async getAvailableGameSystems() {
        return {
            value: messageAnalyzer.listAvailableGameSystems(),
        };
    }
};
tslib.__decorate([
    typeGraphql.Query(() => GetAvailableGameSystemsResult),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", []),
    tslib.__metadata("design:returntype", Promise)
], exports.GetAvailableGameSystemsResolver.prototype, "getAvailableGameSystems", null);
exports.GetAvailableGameSystemsResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.GetAvailableGameSystemsResolver);
//# sourceMappingURL=resolver.js.map
