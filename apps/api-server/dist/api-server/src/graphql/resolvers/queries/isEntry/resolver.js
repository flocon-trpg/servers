'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');
var BaasType = require('../../../../enums/BaasType.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var utils = require('../../utils/utils.js');

exports.IsEntryResolver = class IsEntryResolver {
    async isEntry(context) {
        const userUid = utils.ensureUserUid(context);
        return await utils.checkEntry({
            em: context.em,
            userUid,
            baasType: BaasType.BaasType.Firebase,
            serverConfig: context.serverConfig,
        });
    }
};
tslib.__decorate([
    typeGraphql.Query(() => Boolean),
    typeGraphql.Authorized(),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(1)),
    tslib.__param(0, typeGraphql.Ctx()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [Object]),
    tslib.__metadata("design:returntype", Promise)
], exports.IsEntryResolver.prototype, "isEntry", null);
exports.IsEntryResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.IsEntryResolver);
//# sourceMappingURL=resolver.js.map
