'use strict';

var tslib = require('tslib');
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
        const findResult = await utils.findRoomAndMyParticipant({
            em,
            userUid: authorizedUserUid,
            roomId: id,
        });
        if (findResult == null) {
            return {
                failureType: LeaveRoomFailureType.LeaveRoomFailureType.NotFound,
            };
        }
        const { me, room } = findResult;
        const participantUserUids = findResult.participantIds();
        if (me === undefined || me.role == null) {
            return {
                failureType: LeaveRoomFailureType.LeaveRoomFailureType.NotParticipant,
            };
        }
        const { payload } = await utils.operateParticipantAndFlush({
            em,
            myUserUid: authorizedUserUid,
            update: {
                role: { newValue: undefined },
            },
            room,
            roomHistCount: context.serverConfig.roomHistCount,
            participantUserUids,
        });
        if (payload != null) {
            await utils.publishRoomEvent(pubSub, payload);
        }
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
