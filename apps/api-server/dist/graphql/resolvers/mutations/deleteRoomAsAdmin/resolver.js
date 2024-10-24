'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');
var entity = require('../../../../entities/room/entity.js');
var DeleteRoomAsAdminFailureType = require('../../../../enums/DeleteRoomAsAdminFailureType.js');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var types = require('../../types.js');
var utils = require('../../utils/utils.js');

let DeleteRoomAsAdminInput = class DeleteRoomAsAdminInput {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], DeleteRoomAsAdminInput.prototype, "id", void 0);
DeleteRoomAsAdminInput = tslib.__decorate([
    typeGraphql.ArgsType()
], DeleteRoomAsAdminInput);
let DeleteRoomAsAdminResult = class DeleteRoomAsAdminResult {
};
tslib.__decorate([
    typeGraphql.Field(() => DeleteRoomAsAdminFailureType.DeleteRoomAsAdminFailureType, { nullable: true }),
    tslib.__metadata("design:type", String)
], DeleteRoomAsAdminResult.prototype, "failureType", void 0);
DeleteRoomAsAdminResult = tslib.__decorate([
    typeGraphql.ObjectType()
], DeleteRoomAsAdminResult);
exports.DeleteRoomAsAdminResolver = class DeleteRoomAsAdminResolver {
    async deleteRoomAsAdmin(args, context, pubSub) {
        const em = context.em;
        const authorizedUserUid = utils.ensureAuthorizedUser(context).userUid;
        const room = await em.findOne(entity.Room, { id: args.id });
        if (room == null) {
            return {
                failureType: DeleteRoomAsAdminFailureType.DeleteRoomAsAdminFailureType.NotFound,
            };
        }
        const roomId = room.id;
        await entity.deleteRoom(em, room);
        await em.flush();
        await utils.publishRoomEvent(pubSub, {
            type: 'deleteRoomPayload',
            sendTo: types.all,
            roomId,
            deletedBy: authorizedUserUid,
            deletedByAdmin: true,
        });
        return {};
    }
};
tslib.__decorate([
    typeGraphql.Mutation(() => DeleteRoomAsAdminResult, { description: 'since v0.7.2' }),
    typeGraphql.Authorized(roles.ADMIN),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(2)),
    tslib.__param(0, typeGraphql.Args()),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__param(2, typeGraphql.PubSub()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [DeleteRoomAsAdminInput, Object, typeGraphql.PubSubEngine]),
    tslib.__metadata("design:returntype", Promise)
], exports.DeleteRoomAsAdminResolver.prototype, "deleteRoomAsAdmin", null);
exports.DeleteRoomAsAdminResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.DeleteRoomAsAdminResolver);
//# sourceMappingURL=resolver.js.map
