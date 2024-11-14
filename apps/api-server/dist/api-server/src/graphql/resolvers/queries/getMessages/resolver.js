'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');
var GetRoomMessagesFailureType = require('../../../../enums/GetRoomMessagesFailureType.js');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var roomMessage = require('../../../objects/roomMessage.js');
var utils = require('../../utils/utils.js');

let GetMessagesArgs = class GetMessagesArgs {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], GetMessagesArgs.prototype, "roomId", void 0);
GetMessagesArgs = tslib.__decorate([
    typeGraphql.ArgsType()
], GetMessagesArgs);
exports.GetRoomMessagesResolver = class GetRoomMessagesResolver {
    async getMessages(args, context) {
        const em = context.em;
        const authorizedUserUid = utils.ensureAuthorizedUser(context).userUid;
        const findResult = await utils.findRoomAndMyParticipant({
            em,
            userUid: authorizedUserUid,
            roomId: args.roomId,
        });
        if (findResult == null) {
            return {
                __tstype: roomMessage.GetRoomMessagesFailureResultType,
                failureType: GetRoomMessagesFailureType.GetRoomMessagesFailureType.RoomNotFound,
            };
        }
        const { room, me } = findResult;
        if (me?.role === undefined) {
            return {
                __tstype: roomMessage.GetRoomMessagesFailureResultType,
                failureType: GetRoomMessagesFailureType.GetRoomMessagesFailureType.NotParticipant,
            };
        }
        const messages = await utils.getRoomMessagesFromDb(room, authorizedUserUid, 'default');
        return messages;
    }
};
tslib.__decorate([
    typeGraphql.Query(() => roomMessage.GetRoomMessagesResult),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(10)),
    tslib.__param(0, typeGraphql.Args()),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [GetMessagesArgs, Object]),
    tslib.__metadata("design:returntype", Promise)
], exports.GetRoomMessagesResolver.prototype, "getMessages", null);
exports.GetRoomMessagesResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.GetRoomMessagesResolver);
//# sourceMappingURL=resolver.js.map
