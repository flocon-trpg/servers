'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');
var entity = require('../../../../entities/room/entity.js');
var DeleteRoomFailureType = require('../../../../enums/DeleteRoomFailureType.js');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var types = require('../../types.js');
var utils = require('../../utils/utils.js');

let DeleteRoomArgs = class DeleteRoomArgs {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], DeleteRoomArgs.prototype, "id", void 0);
DeleteRoomArgs = tslib.__decorate([
    typeGraphql.ArgsType()
], DeleteRoomArgs);
let DeleteRoomResult = class DeleteRoomResult {
};
tslib.__decorate([
    typeGraphql.Field(() => DeleteRoomFailureType.DeleteRoomFailureType, { nullable: true }),
    tslib.__metadata("design:type", String)
], DeleteRoomResult.prototype, "failureType", void 0);
DeleteRoomResult = tslib.__decorate([
    typeGraphql.ObjectType()
], DeleteRoomResult);
exports.DeleteRoomResolver = class DeleteRoomResolver {
    async deleteRoom(args, context, pubSub) {
        const em = context.em;
        const authorizedUserUid = utils.ensureAuthorizedUser(context).userUid;
        const room = await em.findOne(entity.Room, { id: args.id });
        if (room == null) {
            return {
                failureType: DeleteRoomFailureType.DeleteRoomFailureType.NotFound,
            };
        }
        const roomId = room.id;
        if (room.createdBy !== authorizedUserUid) {
            return {
                failureType: DeleteRoomFailureType.DeleteRoomFailureType.NotCreatedByYou,
            };
        }
        await entity.deleteRoom(em, room);
        await em.flush();
        await utils.publishRoomEvent(pubSub, {
            type: 'deleteRoomPayload',
            roomId,
            deletedBy: authorizedUserUid,
            deletedByAdmin: false,
            sendTo: types.all,
        });
        return {};
    }
};
tslib.__decorate([
    typeGraphql.Mutation(() => DeleteRoomResult),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(2)),
    tslib.__param(0, typeGraphql.Args()),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__param(2, typeGraphql.PubSub()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [DeleteRoomArgs, Object, typeGraphql.PubSubEngine]),
    tslib.__metadata("design:returntype", Promise)
], exports.DeleteRoomResolver.prototype, "deleteRoom", null);
exports.DeleteRoomResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.DeleteRoomResolver);
//# sourceMappingURL=resolver.js.map
