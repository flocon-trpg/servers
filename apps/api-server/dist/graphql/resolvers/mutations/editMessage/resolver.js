'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');
var entity = require('../../../../entities/roomMessage/entity.js');
var EditMessageFailureType = require('../../../../enums/EditMessageFailureType.js');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var roomMessage = require('../../../objects/roomMessage.js');
var utils = require('../../utils/utils.js');

let EditMessageArgs = class EditMessageArgs {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], EditMessageArgs.prototype, "roomId", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], EditMessageArgs.prototype, "messageId", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], EditMessageArgs.prototype, "text", void 0);
EditMessageArgs = tslib.__decorate([
    typeGraphql.ArgsType()
], EditMessageArgs);
const isDeleted = (entity) => {
    if (entity.textUpdatedAtValue == null) {
        return false;
    }
    return entity.updatedText == null;
};
exports.EditMessageResolver = class EditMessageResolver {
    async editMessage(args, context, pubSub) {
        const em = context.em;
        const authorizedUserUid = utils.ensureAuthorizedUser(context).userUid;
        const findResult = await utils.findRoomAndMyParticipant({
            em,
            userUid: authorizedUserUid,
            roomId: args.roomId,
        });
        if (findResult == null) {
            return {
                failureType: EditMessageFailureType.EditMessageFailureType.RoomNotFound,
            };
        }
        const { room, me } = findResult;
        if (me === undefined) {
            return {
                failureType: EditMessageFailureType.EditMessageFailureType.NotParticipant,
            };
        }
        const publicMsg = await em.findOne(entity.RoomPubMsg, { id: args.messageId });
        if (publicMsg != null) {
            if (publicMsg.createdBy?.userUid !== authorizedUserUid) {
                return {
                    failureType: EditMessageFailureType.EditMessageFailureType.NotYourMessage,
                };
            }
            if (isDeleted(publicMsg)) {
                return {
                    failureType: EditMessageFailureType.EditMessageFailureType.MessageDeleted,
                };
            }
            publicMsg.updatedText = args.text;
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
                    failureType: EditMessageFailureType.EditMessageFailureType.NotYourMessage,
                };
            }
            if (privateMsg.initText == null) {
                return {
                    failureType: EditMessageFailureType.EditMessageFailureType.MessageDeleted,
                };
            }
            privateMsg.updatedText = args.text;
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
            failureType: EditMessageFailureType.EditMessageFailureType.MessageNotFound,
        };
    }
};
tslib.__decorate([
    typeGraphql.Mutation(() => roomMessage.EditMessageResult),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(2)),
    tslib.__param(0, typeGraphql.Args()),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__param(2, typeGraphql.PubSub()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [EditMessageArgs, Object, typeGraphql.PubSubEngine]),
    tslib.__metadata("design:returntype", Promise)
], exports.EditMessageResolver.prototype, "editMessage", null);
exports.EditMessageResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.EditMessageResolver);
//# sourceMappingURL=resolver.js.map
