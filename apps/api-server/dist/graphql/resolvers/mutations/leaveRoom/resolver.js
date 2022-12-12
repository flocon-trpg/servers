'use strict';

var tslib = require('tslib');
var FilePathModule = require('@flocon-trpg/core');
var utils$1 = require('@flocon-trpg/utils');
var result = require('@kizahasi/result');
var produce = require('immer');
var typeGraphql = require('type-graphql');
var LeaveRoomFailureType = require('../../../../enums/LeaveRoomFailureType.js');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var utils = require('../../utils/utils.js');

let LeaveRoomResult = class LeaveRoomResult {
};
tslib.__decorate([
    typeGraphql.Field(() => LeaveRoomFailureType.LeaveRoomFailureType, { nullable: true }),
    tslib.__metadata("design:type", String)
], LeaveRoomResult.prototype, "failureType", void 0);
LeaveRoomResult = tslib.__decorate([
    typeGraphql.ObjectType()
], LeaveRoomResult);
exports.LeaveRoomResolver = class LeaveRoomResolver {
    async leaveRoom(id, context, pubSub) {
        const em = context.em;
        const authorizedUserUid = utils.ensureAuthorizedUser(context).userUid;
        const flushResult = await utils.operateAsAdminAndFlush({
            em,
            roomId: id,
            roomHistCount: context.serverConfig.roomHistCount,
            operationType: 'state',
            operation: async (roomState) => {
                if (roomState.participants?.[authorizedUserUid] == null) {
                    return result.Result.error(LeaveRoomFailureType.LeaveRoomFailureType.NotParticipant);
                }
                const nextRoomState = produce(roomState, roomState => {
                    delete roomState.participants?.[authorizedUserUid];
                });
                return result.Result.ok(nextRoomState);
            },
        });
        if (flushResult.isError) {
            if (flushResult.error.type === 'custom') {
                return { failureType: LeaveRoomFailureType.LeaveRoomFailureType.NotParticipant };
            }
            throw FilePathModule.toOtError(flushResult.error.error);
        }
        switch (flushResult.value) {
            case utils.RoomNotFound:
                return {
                    failureType: LeaveRoomFailureType.LeaveRoomFailureType.NotFound,
                };
            case utils.IdOperation:
                utils$1.loggerRef.debug('An operation in leaveRoom is id. This should not happen.');
                return { failureType: LeaveRoomFailureType.LeaveRoomFailureType.NotParticipant };
        }
        await utils.publishRoomEvent(pubSub, flushResult.value);
        return {};
    }
};
tslib.__decorate([
    typeGraphql.Mutation(() => LeaveRoomResult),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(2)),
    tslib.__param(0, typeGraphql.Arg('id')),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__param(2, typeGraphql.PubSub()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [String, Object, typeGraphql.PubSubEngine]),
    tslib.__metadata("design:returntype", Promise)
], exports.LeaveRoomResolver.prototype, "leaveRoom", null);
exports.LeaveRoomResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.LeaveRoomResolver);
//# sourceMappingURL=resolver.js.map
