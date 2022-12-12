'use strict';

var tslib = require('tslib');
var FilePathModule = require('@flocon-trpg/core');
var typeGraphql = require('type-graphql');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var utils = require('../../utils/utils.js');
var performRollCall = require('./performRollCall.js');
var PerformRollCallFailureType = require('../../../../enums/PerformRollCallFailureType.js');

let PerformRollCallResult = class PerformRollCallResult {
};
tslib.__decorate([
    typeGraphql.Field(() => PerformRollCallFailureType.PerformRollCallFailureType, { nullable: true }),
    tslib.__metadata("design:type", String)
], PerformRollCallResult.prototype, "failureType", void 0);
PerformRollCallResult = tslib.__decorate([
    typeGraphql.ObjectType()
], PerformRollCallResult);
exports.PerformRollCallResolver = class PerformRollCallResolver {
    async performRollCall(roomId, context, pubSub) {
        const myUserUid = utils.ensureUserUid(context);
        const result = await utils.operateAsAdminAndFlush({
            em: context.em,
            roomId,
            roomHistCount: undefined,
            operationType: 'state',
            operation: roomState => performRollCall.performRollCall(roomState, myUserUid),
        });
        if (result.isError) {
            if (result.error.type === 'custom') {
                return { failureType: result.error.error };
            }
            throw FilePathModule.toOtError(result.error.error);
        }
        switch (result.value) {
            case utils.RoomNotFound:
                return { failureType: PerformRollCallFailureType.PerformRollCallFailureType.NotFound };
            case utils.IdOperation:
                return {};
        }
        await utils.publishRoomEvent(pubSub, result.value);
        return {};
    }
};
tslib.__decorate([
    typeGraphql.Mutation(() => PerformRollCallResult, { description: 'since v0.7.13' }),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(2)),
    tslib.__param(0, typeGraphql.Arg('roomId')),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__param(2, typeGraphql.PubSub()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [String, Object, typeGraphql.PubSubEngine]),
    tslib.__metadata("design:returntype", Promise)
], exports.PerformRollCallResolver.prototype, "performRollCall", null);
exports.PerformRollCallResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.PerformRollCallResolver);
//# sourceMappingURL=resolver.js.map
