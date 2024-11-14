'use strict';

var tslib = require('tslib');
var FilePathModule = require('@flocon-trpg/core');
var result = require('@kizahasi/result');
var immer = require('immer');
var typeGraphql = require('type-graphql');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var utils = require('../../utils/utils.js');
var CloseRollCallFailureType = require('../../../../enums/CloseRollCallFailureType.js');

let CloseRollCallResult = class CloseRollCallResult {
};
tslib.__decorate([
    typeGraphql.Field(() => CloseRollCallFailureType.CloseRollCallFailureType, { nullable: true }),
    tslib.__metadata("design:type", String)
], CloseRollCallResult.prototype, "failureType", void 0);
CloseRollCallResult = tslib.__decorate([
    typeGraphql.ObjectType()
], CloseRollCallResult);
exports.CloseRollCallResolver = class CloseRollCallResolver {
    async closeRollCall(roomId, rollCallId, context, pubSub) {
        const myUserUid = utils.ensureUserUid(context);
        const result$1 = await utils.operateAsAdminAndFlush({
            em: context.em,
            roomId,
            roomHistCount: undefined,
            operationType: 'state',
            operation: roomState => {
                const me = roomState.participants?.[myUserUid];
                switch (me?.role) {
                    case FilePathModule.Master:
                    case FilePathModule.Player:
                        break;
                    default:
                        return result.Result.error(CloseRollCallFailureType.CloseRollCallFailureType.NotAuthorizedParticipant);
                }
                const rollCall = roomState.rollCalls?.[rollCallId];
                if (rollCall == null) {
                    return result.Result.error(CloseRollCallFailureType.CloseRollCallFailureType.RollCallNotFound);
                }
                if (rollCall.closeStatus != null) {
                    return result.Result.error(CloseRollCallFailureType.CloseRollCallFailureType.AlreadyClosed);
                }
                const nextRoomState = immer.produce(roomState, roomState => {
                    const rollCall = roomState.rollCalls?.[rollCallId];
                    if (rollCall == null) {
                        return;
                    }
                    rollCall.closeStatus = { closedBy: myUserUid, reason: 'Closed' };
                });
                return result.Result.ok(nextRoomState);
            },
        });
        if (result$1.isError) {
            if (result$1.error.type === 'custom') {
                return { failureType: result$1.error.error };
            }
            throw FilePathModule.toOtError(result$1.error.error);
        }
        switch (result$1.value) {
            case utils.RoomNotFound:
                return { failureType: CloseRollCallFailureType.CloseRollCallFailureType.RoomNotFound };
            case utils.IdOperation:
                return {};
        }
        await utils.publishRoomEvent(pubSub, result$1.value);
        return {};
    }
};
tslib.__decorate([
    typeGraphql.Mutation(() => CloseRollCallResult, { description: 'since v0.7.13' }),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(2)),
    tslib.__param(0, typeGraphql.Arg('roomId')),
    tslib.__param(1, typeGraphql.Arg('rollCallId')),
    tslib.__param(2, typeGraphql.Ctx()),
    tslib.__param(3, typeGraphql.PubSub()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [String, String, Object, typeGraphql.PubSubEngine]),
    tslib.__metadata("design:returntype", Promise)
], exports.CloseRollCallResolver.prototype, "closeRollCall", null);
exports.CloseRollCallResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.CloseRollCallResolver);
//# sourceMappingURL=resolver.js.map
