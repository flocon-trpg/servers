'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');
var entity = require('../../../../entities/roomMessage/entity.js');
var DeleteMessageFailureType = require('../../../../enums/DeleteMessageFailureType.js');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var roomMessage = require('../../../objects/roomMessage.js');
var utils = require('../../utils/utils.js');

let MessageIdArgs = class MessageIdArgs {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], MessageIdArgs.prototype, "roomId", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], MessageIdArgs.prototype, "messageId", void 0);
MessageIdArgs = tslib.__decorate([
    typeGraphql.ArgsType()
], MessageIdArgs);
exports.DeleteMessageResolver = class DeleteMessageResolver {
    async deleteMessage(args, context, pubSub) {
        const em = context.em;
        const authorizedUserUid = utils.ensureAuthorizedUser(context).userUid;
        const findResult = await utils.findRoomAndMyParticipant({
            em,
            userUid: authorizedUserUid,
            roomId: args.roomId,
        });
        if (findResult == null) {
            return {
                failureType: DeleteMessageFailureType.DeleteMessageFailureType.RoomNotFound,
            };
        }
        const { room, me } = findResult;
        if (me === undefined) {
            return {
                failureType: DeleteMessageFailureType.DeleteMessageFailureType.NotParticipant,
            };
        }
        const publicMsg = await em.findOne(entity.RoomPubMsg, { id: args.messageId });
        if (publicMsg != null) {
            if (publicMsg.createdBy?.userUid !== authorizedUserUid) {
                return {
                    failureType: DeleteMessageFailureType.DeleteMessageFailureType.NotYourMessage,
                };
            }
            if (publicMsg.updatedText == null && publicMsg.textUpdatedAtValue != null) {
                return {
                    failureType: DeleteMessageFailureType.DeleteMessageFailureType.MessageDeleted,
                };
            }
            publicMsg.updatedText = undefined;
            publicMsg.textUpdatedAt3 = new Date();
            room.completeUpdatedAt = new Date();
            await em.flush();
            const payloadValue = utils.createRoomPublicMessageUpdate(publicMsg);
            await utils.publishRoomEvent(pubSub, {
                type: 'messageUpdatePayload',
                sendTo: findResult.participantIds(),
                roomId: room.id,
                visibleTo: undefined,
                createdBy: publicMsg.createdBy?.userUid,
                value: payloadValue,
            });
            return {};
        }
        const privateMsg = await em.findOne(entity.RoomPrvMsg, { id: args.messageId });
        if (privateMsg != null) {
            if (privateMsg.createdBy?.userUid !== authorizedUserUid) {
                return {
                    failureType: DeleteMessageFailureType.DeleteMessageFailureType.NotYourMessage,
                };
            }
            if (privateMsg.updatedText == null && privateMsg.textUpdatedAtValue != null) {
                return {
                    failureType: DeleteMessageFailureType.DeleteMessageFailureType.MessageDeleted,
                };
            }
            privateMsg.updatedText = undefined;
            privateMsg.textUpdatedAt3 = new Date();
            room.completeUpdatedAt = new Date();
            await em.flush();
            const payloadValue = utils.createRoomPrivateMessageUpdate(privateMsg);
            await utils.publishRoomEvent(pubSub, {
                type: 'messageUpdatePayload',
                sendTo: findResult.participantIds(),
                roomId: room.id,
                visibleTo: (await privateMsg.visibleTo.loadItems()).map(user => user.userUid),
                createdBy: privateMsg.createdBy?.userUid,
                value: payloadValue,
            });
            return {};
        }
        return {
            failureType: DeleteMessageFailureType.DeleteMessageFailureType.MessageNotFound,
        };
    }
};
tslib.__decorate([
    typeGraphql.Mutation(() => roomMessage.DeleteMessageResult),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(2)),
    tslib.__param(0, typeGraphql.Args()),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__param(2, typeGraphql.PubSub()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [MessageIdArgs, Object, typeGraphql.PubSubEngine]),
    tslib.__metadata("design:returntype", Promise)
], exports.DeleteMessageResolver.prototype, "deleteMessage", null);
exports.DeleteMessageResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.DeleteMessageResolver);
//# sourceMappingURL=resolver.js.map
